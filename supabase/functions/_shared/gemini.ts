/**
 * Calls Gemini and extracts a calorie estimate only.
 */
export async function estimateCaloriesWithGemini(input: {
  text?: string
  imageBase64?: string
  mimeType?: string
}): Promise<{ ok: true; calories: number } | { ok: false; code: string }> {
  const apiKey = Deno.env.get('GEMINI_API_KEY')

  if (!apiKey) {
    return { ok: false, code: 'misconfigured' }
  }

  const models = uniqueModels([
    Deno.env.get('GEMINI_MODEL'),
    'gemini-2.0-flash',
    'gemini-1.5-flash',
    'gemini-1.5-flash-latest',
  ])

  let lastCode = 'upstreamFailed'

  for (const model of models) {
    const result = await callGeminiModel(apiKey, model, input)

    if (result.ok) {
      return result
    }

    lastCode = result.code

    if (
      result.code === 'misconfigured' ||
      result.code === 'upstreamLimited' ||
      result.code === 'invalidAiResult'
    ) {
      return result
    }
  }

  return { ok: false, code: lastCode }
}

async function callGeminiModel(
  apiKey: string,
  model: string,
  input: {
    text?: string
    imageBase64?: string
    mimeType?: string
  },
): Promise<{ ok: true; calories: number } | { ok: false; code: string }> {
  const parts: Array<Record<string, unknown>> = [
    {
      text:
        'Estimate the total calories of the described or photographed food portion. ' +
        'Reply with JSON only in this exact shape: {"calories": number}. ' +
        'No other keys, no markdown, no explanation.',
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
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts }],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 128,
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
    error?: { message?: string }
  }

  if (payload.error?.message) {
    return { ok: false, code: 'upstreamFailed' }
  }

  const rawText = payload.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
  const calories = parseCaloriesJson(rawText)

  if (calories == null) {
    return { ok: false, code: 'invalidAiResult' }
  }

  return { ok: true, calories }
}

function parseCaloriesJson(raw: string): number | null {
  const trimmed = raw.trim()
  const fenced = trimmed
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim()

  try {
    const parsed = JSON.parse(fenced) as { calories?: unknown }
    const value = Number(parsed.calories)

    if (Number.isFinite(value) && value >= 0 && value <= 10000) {
      return Math.round(value * 100) / 100
    }
  } catch {
    const match = fenced.match(/"calories"\s*:\s*(\d+(\.\d+)?)/)

    if (match) {
      const value = Number(match[1])

      if (Number.isFinite(value) && value >= 0 && value <= 10000) {
        return Math.round(value * 100) / 100
      }
    }
  }

  return null
}

function uniqueModels(values: Array<string | null | undefined>): string[] {
  const seen = new Set<string>()
  const models: string[] = []

  for (const value of values) {
    const model = String(value ?? '').trim()

    if (!model || seen.has(model)) {
      continue
    }

    seen.add(model)
    models.push(model)
  }

  return models
}
