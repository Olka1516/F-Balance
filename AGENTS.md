# Agent rules — F-Balance

Entry point for any agent. Details live in `.cursor/rules/` plus `project_TZ.txt`, `structure.md`, `limits.md`, and `BUILD.md`.

When **creating the site**, follow `BUILD.md` in order. Stop after MVP (Phase 6) unless asked to continue.

Canonical name: **F-Balance** (CALIO in some docs is the same product). Stack: Vue 3, TypeScript, Supabase, TanStack Query, Pinia (UI only), Regle, vue-i18n (`uk`/`en`), ECharts, VueUse, Gemini via Edge Function.

---

## Walkthrough (required)

### Step A — Understand the task

1. Restate what the user asked in one sentence.
2. Is this MVP or post-MVP? If it is post-MVP and the MVP shell is missing, say so first.
3. Which screens/entities are involved: Landing, Auth, Onboarding, Dashboard, Add Food, My Meals, AI, Recommendations, Profile.
4. Is there an external service (Open Food Facts, TheMealDB, Gemini, Storage)? If yes, read `limits.md`.

### Step B — Design the change

5. Which files under `src/` or `supabase/` change (folders from `structure.md`).
6. Where does state live: Query or Pinia?
7. Which i18n keys to add in `uk` and `en`.
8. Which loading / error / empty states are needed.
9. Fallback if the API/AI is unavailable.

### Step C — Implement

10. Follow existing patterns. No new libraries unless asked.
11. No copy in components. No hardcoded colors — theme CSS variables.
12. Secrets and `service_role` stay off the client. Gemini only from an Edge Function.
13. Forms use Regle. API search uses 500–800 ms debounce and a 2–3 character minimum.
14. No `//` comments. JSDoc on exported APIs (intent only — types stay in TypeScript). Extract repeated logic. Magic values → `src/constants/` and reuse them.
15. Vue files: `<template>` then `<script setup>`. Styles → `src/styles/views/{route-name}.css` or `src/styles/components/{kebab-name}.css` — no `<style>` in SFCs.

### Step D — Check before saying "done"

16. The user flow from the spec for this feature works.
17. Both languages, mobile-first, request states.
18. RLS / limits / AI estimate — if relevant.
19. No `//` comments; JSDoc on exports; no duplicated logic; no hardcoded literals.
20. Vue order template→script; styles external under `src/styles/`.
21. No features from another stage, no medical wording.

---

## Domain checks (add to Step D)

**Auth / Onboarding:** session, logout → landing/login, optional fields can be skipped, profile can be edited later.

**Dashboard:** daily target, consumed, remaining, macros, meal list; charts via ECharts, no overkill in MVP.

**Add Food / My Meals:** manual entry in MVP; a meal recalculates macros when ingredients change; CRUD for saved meals.

**AI:** explicit Analyze action only; UI shows a calorie estimate; user confirms or edits before save; compress photos before upload.

**Recommendations:** consider goal, intake, time of day; not identical every day; Recipe API failure must not break Dashboard.

**Profile:** weight, height, activity, goal, language, logout; account deletion if needed.

---

## Cursor rules

| File | When it applies |
|---|---|
| `.cursor/rules/core.mdc` | always — stack, MVP, constraints |
| `.cursor/rules/architecture.mdc` | always — folders and state |
| `.cursor/rules/security-limits.mdc` | always — RLS, keys, limits |
| `.cursor/rules/agent-workflow.mdc` | always — implementation checklist |
| `.cursor/rules/code-style.mdc` | always — no `//` comments, JSDoc + TS, DRY, constants, Vue order, external CSS |
| `.cursor/rules/build-order.mdc` | always — follow `BUILD.md` phases in order |
| `.cursor/rules/ui-i18n.mdc` | when working with `src/**/*.{vue,ts,css,json}` |
