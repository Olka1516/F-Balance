# F-Balance — build steps

Follow this order when creating the site. Do not skip ahead or install a library before the step that needs it, unless the user asks for a specific feature.

Sources: `project_TZ.txt`, `structure.md`, `limits.md`, `.cursor/rules/`.

---

## Phase 0 — Scaffold

1. Create a Vite + Vue 3 + TypeScript app in this repo (keep existing docs and `.cursor/`).
2. Add `.gitignore` and `.env.example` (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` — no secrets).
3. Create folders from `.cursor/rules/architecture.mdc`:
   - `src/assets`
   - `src/components/{common,dashboard,meals,recommendations,auth,profile}`
   - `src/views`
   - `src/composables`
   - `src/queries`
   - `src/stores`
   - `src/services`
   - `src/router`
   - `src/locales/{uk,en}`
   - `src/styles/themes`
   - `src/types`
   - `src/constants`
   - `src/utils`
   - `supabase/functions` (empty until post-MVP AI)
4. Install only the core libs: `vue-router`, `pinia`, `vue-i18n`, `@vueuse/core`.
5. Add TypeScript types for the data model (`User`, `UserProfile`, `Food`, `Meal`, `MealIngredient`, `DailyEntry`).
6. Add domain constants (`meals`, `theme`, later `api`, `storage`).
7. Add i18n files: `common.json`, `auth.json`, `dashboard.json`, `meals.json` for `uk` and `en`.
8. Add `base.css` and four season files (`spring`, `summer`, `autumn`, `winter`) with CSS variables only.
9. Add `useSeasonTheme` + Pinia `theme` store: date → season → CSS variables.
10. Add Pinia `ui` store (modal, sidebar, tabs).
11. Add router shell and empty views: Landing, Login, Register, Onboarding, Dashboard, AddMeal, MyMeals, Profile (Recommendations as a stub route, hidden until post-MVP).
12. Add common UI-kit stubs: button, input, loader, empty state — mobile-first.

---

## Phase 1 — Landing + i18n shell

13. Build the Landing page: short value, benefits, CTA to register. No backend.
14. Wire language switch (`uk` / `en`) without reload. Persist the choice.
15. Apply seasonal theme on app start. Confirm layout does not change between seasons.

---

## Phase 2 — Supabase + Auth

16. Create the Supabase project (Free plan). Put URL + anon key in `.env`.
17. Install `@supabase/supabase-js`. Add `src/services/supabase.ts` (client only, anon key).
18. Install `@regle/core` (and Vue adapter as required). Do not add Zod or VeeValidate.
19. Auth screens: register (email, password, confirm), login, logout, password reset.
20. Session persistence. Auth guards: guest → Landing/Login; logged-in → Dashboard. Logout → Landing/Login.
21. Loading / disabled / error / success on every auth action.

---

## Phase 3 — Onboarding + Profile

22. SQL: `user_profiles` (+ later meal tables). Enable RLS: user reads/writes only own rows.
23. Install `@tanstack/vue-query`. Add `useProfileQuery` (and mutations).
24. Onboarding: goal, weight, height, activity, optional age, daily calories (or inputs to compute later). Optional fields can be skipped.
25. Save profile to Supabase. Allow finishing onboarding later from Profile.
26. Profile page: edit the same fields, language, logout.

---

## Phase 4 — Meals (manual MVP)

27. SQL: `foods` / meals / ingredients / `daily_entries` as in the spec. RLS on all user-specific tables.
28. Utils: macro totals, remaining calories — shared, not copied in views.
29. Add Food — **manual only**: name, calories, protein, fat, carbs, amount. Validate with Regle.
30. My Meals: create, edit, duplicate, delete. Recalculate macros when ingredient amounts change. Add a saved meal to today.
31. Queries: `useMealsQuery` and related mutations. Cache via TanStack Query.

---

## Phase 5 — Dashboard + basic analytics

32. Install `echarts` + Vue wrapper only at this step.
33. Dashboard: daily target, consumed, remaining, macros, today’s meal list (Breakfast / Lunch / Dinner / Snacks).
34. One simple chart (target vs actual or macros). Keep it light.
35. Empty, loading, and error states. Do not load full history.

---

## Phase 6 — MVP polish (definition of done)

36. Responsive: smartphone first, then tablet, then desktop. Large touch targets.
37. Every async path has loading / error. Lists have an empty state.
38. All new copy in both `uk` and `en`.
39. JSDoc on exports, no `//` comments, no magic numbers, no duplicated logic.
40. Manual test: register → onboard → add food → see Dashboard → edit profile → switch language → logout.

**Stop here for MVP.** Do not start the steps below unless asked.

---

## Phase 7 — Nutrition API (post-MVP)

41. Add `src/services/openFoodFacts.ts` and `useFoodSearchQuery`.
42. Constants: debounce 500–800 ms, min 2–3 characters, `staleTime`, result limit.
43. Add Food → Search tab. If API fails or data is incomplete → manual entry still works.

---

## Phase 8 — AI calories (post-MVP)

44. Add Edge Functions `analyze-text` and `analyze-photo`. Key only in function secrets (see Phase 11).
45. Auth check, input validation, per-user rate limit, structured calorie result only.
46. Client: Analyze button only (never on page load). Show **estimate**. User can edit before save.
47. Photos: MIME, max size, compress/downscale before send. Do not keep Storage files after analysis unless the user saves them.

---

## Phase 9 — Recommendations + recipes (post-MVP)

48. Add `src/services/theMealDb.ts` and recommendation query. Cache results.
49. Recommendations page: goal, remaining calories, time of day, meal type. Not the same every day.
50. If TheMealDB is down: show unavailable; Dashboard and add-food still work.
51. Optional: AI only to adapt copy, not as the only source.

---

## Phase 10 — Hardening (post-MVP)

52. Stronger AI rate limits / cooldown. Tighter Storage rules.
53. Richer ECharts (weekly progress) only if Dashboard stays fast on mobile.
54. PWA / offline only if the user asks.

---

## Library install map

| When | Install |
|---|---|
| Phase 0 | `vue-router`, `pinia`, `vue-i18n`, `@vueuse/core` |
| Phase 2 | `@supabase/supabase-js`, `@regle/core` (+ Vue adapter) |
| Phase 3 | `@tanstack/vue-query` |
| Phase 5 | `echarts` (+ Vue wrapper) |
| Phase 7 | none required (fetch Open Food Facts) |
| Phase 8 | none on the client (AI SDK only in Edge Function) |

Never: Zod, VeeValidate, any AI SDK in Vue, `service_role` in the app.

---

# v2 — Simplify & redesign (active plan)

Goal: as simple as possible, yet covering the full daily flow. Reference for UX: Micron (App Store) — photo-first logging, meals grouped by time of day, one calorie budget on Home, a separate Progress tab, encouraging tone, no diet wording.

Do phases in order. Each phase ends with Step D from `AGENTS.md` and a docs update.

## Phase 11 — AI provider: secure & usable limits (request 2) ✅ done

55. Keep Gemini (free tier) inside Edge Functions only; default model `gemini-flash-lite-latest`, override via `GEMINI_MODEL`. Provider code is isolated in `_shared/nutrition.ts`, so switching to Claude later (paid API) touches one file.
56. Key lives only in Supabase secrets: `supabase secrets set GEMINI_API_KEY=...`. Never in `.env`, never with a `VITE_` prefix, never in the repo or client bundle. `.env.example` documents nothing for it.
57. Move all shared logic (CORS, user client, rate limit, hashing, provider call) into `supabase/functions/_shared/` and import it; delete inlined copies.
58. New limits (constants in one place): cooldown 3 s, 20/hour, 60/day per user. Reserve a row in `ai_requests` **before** the provider call (status `pending` → `ok` / `failed`); failed calls do not count toward the daily cap. Concurrent requests are blocked by the reservation.
59. Cache full estimates (not only calories) by input hash for 48 h.

## Phase 12 — Calorie & macro targets (request 5) ✅ done

60. Profile gets `sex`, `target_weight`, `pace` (slow / normal / fast); `age` stays. Migration `20261110130000_profile_body_targets.sql`, RLS unchanged.
61. `src/utils/nutritionTargets.ts` (constants in `src/constants/profile.ts`): BMR by Mifflin–St Jeor → TDEE via activity factor (1.2 / 1.375 / 1.55 / 1.725 / 1.9) → goal adjustment by pace (lose −10/−15/−20 %, gain +5/+10/+15 %) with a floor (no lower than BMR × 1.0 by default).
62. Macros: protein 2.0 / 1.6 / 1.8 g/kg (lose / maintain / gain), fat ≥ max(0.8 g/kg, 25 % kcal), carbs = remainder. Calorie floor: max(BMR, 1200 F / 1500 M).
63. Onboarding shows the result with a short "how we calculated" explainer; user can override the numbers in Profile. Recalculate when weight/activity changes.

## Phase 13 — Navigation & layout redesign (requests 1, 4, 7) ✅ done

64. Mobile: bottom tab bar — **Today**, **Meals**, **Add (+)** in the centre, **Progress**, **Profile** (`AppNav`, items in `APP_NAV_ITEMS`). Burger menu removed; Meals tab folds into Add in Phase 15; Recommendations no longer in nav. Language switch: Profile header + desktop sidebar.
65. Desktop (≥ 1024 px): left sidebar with the same items; Today becomes two columns (budget + macros left, meals by time of day right); max content width, no stretched forms.
66. Today: one calorie ring (eaten / remaining), three macro bars, meals grouped Breakfast / Lunch / Dinner / Snacks with "+" per group, day strip on top.
67. Progress (`/progress`): 7-day calories chart, average kcal and macros, days within ±10 % of target, logged days. Weight trend needs weight history — deferred. Charts read colours via `useThemeColors` (no hex literals); unused macro/progress charts removed.
68. Remove the visible season label (seasonal theme may stay, silently).

## Phase 14 — Logging flow (requests 3, 8, 9) ✅ done

69. Rename the "AI" tab to **"Photo or description"** (`uk`: «Фото або опис»). No "AI" word in navigation; a small "estimate" note stays on the result.
70. Add screen order: Photo/description (photo first) → Search → Manual. Saved meals join in Phase 15.
71. The form holds **portion** values (grams + kcal of what was eaten). Per-100 g is derived only on save (`formValuesToManualMealInput`). For AI / search / edit, changing grams rescales kcal and macros. Per-ingredient breakdown of a dish is deferred.
72. Manual entry: name + portion (g or "1 serving") + total kcal; macros optional and collapsed by default.
73. On photo analysis error: keep the compressed photo in memory, show **Retry** (same photo, no re-upload) and **Describe instead**. Retry respects cooldown with a visible countdown.
74. Optional clarification text after a photo ("without sauce", "half portion") sent with the retry.

## Phase 15 — Saved meals & suggestions (requests 6, 7) ✅ done

75. "My Meals" → **Saved** (`SavedMealsList`, also a tab in Add): Recent (30 days of diary) / Favourites (★, `meals.is_favorite`) / All. One tap "+" adds to the target slot (`daily_entries.meal_type`, from `?mealType=` or time of day). Each Today group has its own "+".
76. Multi-ingredient recipes — deferred (data model already supports `meal_ingredients`).
77. Recommendations page and TheMealDB code removed (`/recommendations` redirects to Today). `NextMealCard` on Today: up to 3 saved meals that fit remaining kcal, current slot and favourites first, rotated daily, hidden when nothing fits.

## Phase 16 — Polish

78. All new copy in `uk` and `en`; empty / loading / error states; mobile-first then desktop check.
79. Manual test: register → onboarding with calculated targets → photo log → retry on error → edit grams → save to favourites → re-add in one tap → Progress → desktop layout.

### v2 library map
No new client libraries. Edge Functions call the Gemini REST API with `fetch` (key in a header, never in the URL). Never: any AI SDK or key in Vue code.
