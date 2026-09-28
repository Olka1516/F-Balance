# AI Edge Functions (Phase 8)

Each function is a **single self-contained** `index.ts` (safe for Dashboard paste/deploy).

## Deploy (CLI)

```bash
npx supabase functions deploy analyze-text --no-verify-jwt
npx supabase functions deploy analyze-photo --no-verify-jwt
```

## Deploy (Dashboard)

1. Open Edge Functions → function editor for `analyze-photo` / `analyze-text`
2. Paste the full contents of the matching `index.ts`
3. Turn **Verify JWT** OFF
4. Deploy

## Secrets

- `GEMINI_API_KEY` (required)
- `GEMINI_MODEL` (optional). Recommended: `gemini-2.5-flash`

If analysis returns `modelUnavailable`, set:

```
GEMINI_MODEL=gemini-2.5-flash
```

Then redeploy both functions with the latest `index.ts`.

Photos/text return structured estimate: name, calories, protein, fat, carbs.
User can edit before save. Also run SQL:
- `supabase/migrations/20260321140000_ai_requests.sql`
- `supabase/migrations/20260321141000_ai_requests_result.sql`
