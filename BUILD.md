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

44. Add Edge Functions `analyze-text` and `analyze-photo`. Gemini key only in function env.
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
| Phase 8 | none on the client (Gemini in Edge Function) |

Never: Zod, VeeValidate, Gemini client SDK in Vue, `service_role` in the app.
