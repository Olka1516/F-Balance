import { createClient, type SupabaseClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, prefer, accept, accept-profile, content-profile, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
}

const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp'])
const MAX_BASE64_CHARS = 1_100_000
const COOLDOWN_MS = 20_000
const MAX_PER_HOUR = 6
const MAX_PER_DAY = 24
const CACHE_TTL_MS = 48 * 60 * 60 * 1000

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'methodNotAllowed' }, 405)
  }

  const client = createUserClient(req)

  if (!client) {
    return jsonResponse({ error: 'unauthorized' }, 401)
  }

  const userId = await requireUserId(client)

  if (!userId) {
    return jsonResponse({ error: 'unauthorized' }, 401)
  }

  let body: { imageBase64?: unknown; mimeType?: unknown }

  try {
    body = await req.json()
  } catch {
    return jsonResponse({ error: 'invalidBody' }, 400)
  }

  const mimeType = String(body.mimeType ?? '').toLowerCase()
  const imageBase64 = String(body.imageBase64 ?? '').replace(/\s/g, '')

  if (!ALLOWED_MIME.has(mimeType) || !imageBase64) {
    return jsonResponse({ error: 'invalidImage' }, 400)
  }

  if (imageBase64.length > MAX_BASE64_CHARS) {
    return jsonResponse({ error: 'imageTooLarge' }, 400)
  }

  const inputHash = await sha256Hex(
    `photo:${mimeType}:${imageBase64.slice(0, 512)}:${imageBase64.length}`,
  )
  const limit = await checkAiRateLimit(client, userId, inputHash)

  if (!limit.ok) {
    return jsonResponse({ error: limit.code }, 429)
  }

  if (limit.cachedEstimate) {
    return jsonResponse({ ...limit.cachedEstimate, cached: true })
  }

  const estimate = await estimateNutritionWithGemini({
    imageBase64,
    mimeType,
  })

  if (!estimate.ok) {
    return jsonResponse({ error: estimate.code }, 502)
  }

  await logAiRequest(client, userId, 'photo', inputHash, estimate.data)

  return jsonResponse({ ...estimate.data, cached: false })
})

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  })
}

function createUserClient(req: Request): SupabaseClient | null {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')
  const authHeader = req.headers.get('Authorization')

  if (!supabaseUrl || !anonKey || !authHeader) {
    return null
  }

  return createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  })
}

async function requireUserId(client: SupabaseClient): Promise<string | null> {
  const { data, error } = await client.auth.getUser()

  if (error || !data.user) {
    return null
  }

  return data.user.id
}

type NutritionEstimate = {
  name: string | null
  calories: number
  protein: number | null
  fat: number | null
  carbs: number | null
}

async function checkAiRateLimit(
  client: SupabaseClient,
  userId: string,
  inputHash: string,
): Promise<
  | { ok: true; cachedEstimate: NutritionEstimate | null }
  | { ok: false; code: string }
> {
  const now = Date.now()
  const dayAgo = new Date(now - 24 * 60 * 60 * 1000).toISOString()
  const hourAgo = new Date(now - 60 * 60 * 1000).toISOString()

  const { data: recent, error } = await client
    .from('ai_requests')
    .select('calories, input_hash, created_at, result')
    .eq('user_id', userId)
    .gte('created_at', dayAgo)
    .order('created_at', { ascending: false })
    .limit(MAX_PER_DAY + 5)

  if (error) {
    return { ok: false, code: 'rateLimited' }
  }

  const rows = recent ?? []

  if (rows.length >= MAX_PER_DAY) {
    return { ok: false, code: 'dailyLimit' }
  }

  const hourCount = rows.filter(
    (row) => new Date(row.created_at).getTime() >= new Date(hourAgo).getTime(),
  ).length

  if (hourCount >= MAX_PER_HOUR) {
    return { ok: false, code: 'rateLimited' }
  }

  const latest = rows[0]

  if (latest) {
    const elapsed = now - new Date(latest.created_at).getTime()

    if (elapsed < COOLDOWN_MS) {
      return { ok: false, code: 'cooldown' }
    }
  }

  const cached = rows.find(
    (row) =>
      row.input_hash === inputHash &&
      row.calories != null &&
      now - new Date(row.created_at).getTime() <= CACHE_TTL_MS,
  )

  if (cached?.calories != null) {
    const estimate = normalizeEstimate(cached.result, Number(cached.calories))

    return {
      ok: true,
      cachedEstimate: estimate,
    }
  }

  return { ok: true, cachedEstimate: null }
}

async function logAiRequest(
  client: SupabaseClient,
  userId: string,
  requestType: 'text' | 'photo',
  inputHash: string,
  estimate: NutritionEstimate,
): Promise<void> {
  await client.from('ai_requests').insert({
    user_id: userId,
    request_type: requestType,
    input_hash: inputHash,
    calories: estimate.calories,
    result: estimate,
  })
}

async function sha256Hex(value: string): Promise<string> {
  const data = new TextEncoder().encode(value)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

async function estimateNutritionWithGemini(input: {
  text?: string
  imageBase64?: string
  mimeType?: string
}): Promise<{ ok: true; data: NutritionEstimate } | { ok: false; code: string }> {
  const apiKey = Deno.env.get('GEMINI_API_KEY')?.trim()

  if (!apiKey) {
    return { ok: false, code: 'misconfigured' }
  }

  const preferred = [
    Deno.env.get('GEMINI_MODEL')?.trim() || '',
    'gemini-2.5-flash',
    'gemini-2.0-flash',
  ].filter((value, index, list) => value && list.indexOf(value) === index)

  let lastCode = 'modelUnavailable'

  for (const model of preferred) {
    const result = await callGeminiModel(apiKey, model, input)

    if (result.ok) {
      return result
    }

    lastCode = result.code

    if (
      result.code === 'misconfigured' ||
      result.code === 'upstreamLimited'
    ) {
      return result
    }
  }

  const discovered = await listGeminiModels(apiKey)

  for (const model of discovered) {
    if (preferred.includes(model)) {
      continue
    }

    const result = await callGeminiModel(apiKey, model, input)

    if (result.ok) {
      return result
    }

    lastCode = result.code

    if (
      result.code === 'misconfigured' ||
      result.code === 'upstreamLimited'
    ) {
      return result
    }
  }

  return { ok: false, code: lastCode }
}

async function listGeminiModels(apiKey: string): Promise<string[]> {
  try {
    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models?pageSize=100',
      {
        headers: {
          'x-goog-api-key': apiKey,
        },
      },
    )

    if (!response.ok) {
      return []
    }

    const payload = (await response.json()) as {
      models?: Array<{
        name?: string
        supportedGenerationMethods?: string[]
      }>
    }

    return (payload.models ?? [])
      .filter((model) =>
        (model.supportedGenerationMethods ?? []).includes('generateContent'),
      )
      .map((model) => String(model.name ?? '').replace(/^models\//, ''))
      .filter((name) =>
        name.includes('flash') &&
        !name.includes('embed') &&
        !name.includes('tts') &&
        !name.includes('image'),
      )
  } catch {
    return []
  }
}

async function callGeminiModel(
  apiKey: string,
  model: string,
  input: {
    text?: string
    imageBase64?: string
    mimeType?: string
  },
): Promise<{ ok: true; data: NutritionEstimate } | { ok: false; code: string }> {
  const parts: Array<Record<string, unknown>> = [
    {
      text:
        'Analyze the food portion from the description or photo. ' +
        'Reply with JSON only in this exact shape: ' +
        '{"name":"short dish name","calories":number,"protein":number,"fat":number,"carbs":number}. ' +
        'Values are estimates for the whole visible/described portion. ' +
        'protein/fat/carbs are grams. No markdown, no extra keys.',
    },
  ]

  if (input.text) {
    parts.push({ text: `Food description: ${input.text}` })
  }

  if (input.imageBase64 && input.mimeType) {
    parts.push({
      inlineData: {
        mimeType: input.mimeType,
        data: input.imageBase64,
      },
    })
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        contents: [{ role: 'user', parts }],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 1024,
        },
      }),
    },
  )

  if (response.status === 429) {
    return { ok: false, code: 'upstreamLimited' }
  }

  if (response.status === 401 || response.status === 403) {
    return { ok: false, code: 'misconfigured' }
  }

  if (response.status === 404) {
    return { ok: false, code: 'modelUnavailable' }
  }

  if (!response.ok) {
    return { ok: false, code: 'upstreamFailed' }
  }

  const payload = (await response.json()) as {
    candidates?: Array<{
      content?: { parts?: Array<{ text?: string }> }
    }>
  }

  const rawText = payload.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
  const estimate = parseNutritionJson(rawText)

  if (!estimate) {
    return { ok: false, code: 'invalidAiResult' }
  }

  return { ok: true, data: estimate }
}

function parseNutritionJson(raw: string): NutritionEstimate | null {
  const trimmed = raw
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim()

  try {
    const parsed = JSON.parse(trimmed) as Record<string, unknown>
    const calories = Number(parsed.calories)

    if (!Number.isFinite(calories) || calories < 0 || calories > 10000) {
      return null
    }

    return {
      name: optionalString(parsed.name),
      calories: Math.round(calories * 100) / 100,
      protein: optionalMacro(parsed.protein),
      fat: optionalMacro(parsed.fat),
      carbs: optionalMacro(parsed.carbs),
    }
  } catch {
    return null
  }
}

function normalizeEstimate(
  result: unknown,
  fallbackCalories: number,
): NutritionEstimate | null {
  if (!result || typeof result !== 'object') {
    return null
  }

  const parsed = result as Record<string, unknown>
  const calories = Number(parsed.calories ?? fallbackCalories)
  const protein = optionalMacro(parsed.protein)
  const fat = optionalMacro(parsed.fat)
  const carbs = optionalMacro(parsed.carbs)
  const name = optionalString(parsed.name)

  if (!Number.isFinite(calories) || calories < 0) {
    return null
  }

  if (protein == null || fat == null || carbs == null || !name) {
    return null
  }

  return {
    name,
    calories: Math.round(calories * 100) / 100,
    protein,
    fat,
    carbs,
  }
}

function optionalString(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null
  }

  const trimmed = value.trim()
  return trimmed ? trimmed.slice(0, 120) : null
}

function optionalMacro(value: unknown): number | null {
  if (value == null || value === '') {
    return null
  }

  const parsed = Number(value)

  if (!Number.isFinite(parsed) || parsed < 0 || parsed > 1000) {
    return null
  }

  return Math.round(parsed * 100) / 100
}
