# AI Edge Functions

`analyze-text` and `analyze-photo` call **Gemini** through shared code in `_shared/`:

| File | Role |
|---|---|
| `_shared/http.ts` | CORS, JSON responses, user client, locale, hashing |
| `_shared/limits.ts` | Payload bounds, provider timeout, default model |
| `_shared/nutrition.ts` | Provider call (Gemini REST, structured JSON) + validation — the only provider-specific file |
| `_shared/analyze.ts` | Pipeline: auth → `reserve_ai_request` → provider → `complete_ai_request` |

## Secrets (server only)

```bash
npx supabase secrets set GEMINI_API_KEY=your_key
npx supabase secrets set GEMINI_MODEL=gemini-flash-lite-latest   # optional
```

The key never goes into `.env`, the repo, or any `VITE_*` variable, and is sent to Google in a header (not the URL).

## Limits

Enforced atomically in SQL (`supabase/migrations/20261110120000_ai_requests_reservation.sql`):
cooldown 3 s, 20 / hour, 60 / day per user; failed calls do not count; identical input is served from a 48 h cache.

## Deploy (CLI only — functions import `_shared/`)

```bash
npx supabase db push
npx supabase functions deploy analyze-text --no-verify-jwt
npx supabase functions deploy analyze-photo --no-verify-jwt
```
