import { corsHeaders, jsonResponse, normalizeLocale } from '../_shared/http.ts'
import { AI_LIMITS } from '../_shared/limits.ts'
import { runAnalysis } from '../_shared/analyze.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'methodNotAllowed' }, 405)
  }

  const body = (await req.json().catch(() => null)) as
    | { description?: unknown; locale?: unknown }
    | null

  if (!body) {
    return jsonResponse({ error: 'invalidBody' }, 400)
  }

  const description = String(body.description ?? '').trim()
  const locale = normalizeLocale(body.locale)

  if (description.length < AI_LIMITS.textMin || description.length > AI_LIMITS.textMax) {
    return jsonResponse({ error: 'invalidDescription' }, 400)
  }

  return runAnalysis(req, {
    requestType: 'text',
    cacheKey: `text:${locale}:${description.toLowerCase()}`,
    locale,
    text: description,
  })
})
