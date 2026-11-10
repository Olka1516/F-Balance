import { corsHeaders, jsonResponse, normalizeLocale } from '../_shared/http.ts'
import { AI_LIMITS, type AllowedImageMime } from '../_shared/limits.ts'
import { runAnalysis } from '../_shared/analyze.ts'

function isAllowedMime(value: string): value is AllowedImageMime {
  return (AI_LIMITS.photoAllowedMime as readonly string[]).includes(value)
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'methodNotAllowed' }, 405)
  }

  const body = (await req.json().catch(() => null)) as
    | { imageBase64?: unknown; mimeType?: unknown; locale?: unknown; clarification?: unknown }
    | null

  if (!body) {
    return jsonResponse({ error: 'invalidBody' }, 400)
  }

  const mimeType = String(body.mimeType ?? '').toLowerCase()
  const imageBase64 = String(body.imageBase64 ?? '').replace(/\s/g, '')
  const clarification = String(body.clarification ?? '')
    .trim()
    .slice(0, AI_LIMITS.clarificationMax)
  const locale = normalizeLocale(body.locale)

  if (!isAllowedMime(mimeType) || !imageBase64) {
    return jsonResponse({ error: 'invalidImage' }, 400)
  }

  if (imageBase64.length > AI_LIMITS.photoMaxBase64Chars) {
    return jsonResponse({ error: 'imageTooLarge' }, 400)
  }

  return runAnalysis(req, {
    requestType: 'photo',
    cacheKey: `photo:${locale}:${clarification.toLowerCase()}:${imageBase64}`,
    locale,
    text: clarification || undefined,
    image: { base64: imageBase64, mimeType },
  })
})
