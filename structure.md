# Документація: Структура проєкту

## 1. Технологічний стек

```
Vue 3 + TypeScript
│
├── Supabase        — Auth, PostgreSQL, Storage, Edge Functions
├── TanStack Query   — server state / кешування / API-запити
├── Pinia            — client state (модалки, таби, тема, sidebar)
├── Regle            — форми та валідація
├── vue-i18n         — UA / EN
├── Apache ECharts   — аналітика/графіки
├── VueUse           — браузерні утиліти
└── Gemini API       — AI-аналіз (через Edge Function)
```

---

## 2. Розподіл: server state vs client state

Це ключовий архітектурний принцип проєкту.

**TanStack Query** відповідає за все, що приходить із сервера:

- meals (страви користувача)
- profile
- nutrition API (Open Food Facts)
- recipes (TheMealDB)
- recommendations
- statistics

**Pinia / звичайний Vue state** відповідає за клієнтський UI-стан:

- відкрите модальне вікно
- обраний tab
- поточна сезонна тема
- значення інпутів форми (до сабміту)
- чи відкритий sidebar

Ці два шари не дублюють одне одного — TanStack Query ніколи не зберігає суто UI-стан, Pinia ніколи не кешує дані з API.

---

## 3. Структура папок

```
├── src/
│   ├── assets/                 # статичні файли, іконки, шрифти
│   │
│   ├── components/
│   │   ├── common/             # кнопки, інпути, лоадери, модалки (UI-kit)
│   │   ├── dashboard/          # компоненти головної сторінки/аналітики
│   │   ├── meals/              # додавання/перегляд страв
│   │   ├── recommendations/    # блок рекомендацій та рецептів
│   │   ├── auth/               # форми логіну/реєстрації, анкета цілей
│   │   └── profile/            # редагування профілю/цілей
│   │
│   ├── views/                  # сторінки (routes)
│   │   ├── LandingView.vue
│   │   ├── LoginView.vue
│   │   ├── RegisterView.vue
│   │   ├── DashboardView.vue
│   │   ├── AddMealView.vue
│   │   ├── RecommendationsView.vue
│   │   └── ProfileView.vue
│   │
│   ├── composables/            # useSeasonTheme, useDebounce, useAIAnalysis...
│   │
│   ├── queries/                # TanStack Query hooks по доменах
│   │   ├── useMealsQuery.ts
│   │   ├── useProfileQuery.ts
│   │   ├── useFoodSearchQuery.ts
│   │   ├── useRecipesQuery.ts
│   │   └── useStatisticsQuery.ts
│   │
│   ├── stores/                 # Pinia — тільки client state
│   │   ├── ui.ts               # modal, sidebar, tabs
│   │   └── theme.ts            # поточна сезонна тема
│   │
│   ├── services/                # клієнти для зовнішніх сервісів
│   │   ├── supabase.ts
│   │   ├── openFoodFacts.ts
│   │   └── theMealDb.ts
│   │   # ⚠ Gemini НЕ викликається напряму звідси — тільки через Edge Function
│   │
│   ├── router/
│   │   └── index.ts
│   │
│   ├── locales/
│   │   ├── ua.json
│   │   └── en.json
│   │
│   ├── styles/
│   │   ├── themes/
│   │   │   ├── autumn.css      # жовтий, червоний, золотий, оранжевий
│   │   │   ├── winter.css      # синій, блакитний, білий
│   │   │   ├── spring.css      # зелений, аквамарин, рожевий
│   │   │   └── summer.css      # ягідний, жовтий, темно-зелений
│   │   └── base.css
│   │
│   ├── types/                  # TypeScript-типи (Meal, Profile, Goal...)
│   │
│   └── utils/                  # чисті функції-хелпери
│
├── supabase/
│   └── functions/
│       ├── analyze-photo/      # Edge Function → Gemini (фото)
│       └── analyze-text/       # Edge Function → Gemini (опис)
│
└── ...конфігураційні файли (vite.config, tsconfig, .env.example)
```

---

## 4. Логіка сезонної теми

Стилі не обираються вручну користувачем — вони визначаються поточною датою.

```
Поточна дата
     ↓
Визначити сезон (const-мапа: місяць/день → сезон)
     ↓
Обрати відповідний styles/themes/*.css
     ↓
Застосувати CSS-змінні до додатку (через theme.ts store)
```

Сезони як константи, а не хардкод по компонентах — щоб зміна кольорової палітри не вимагала правок у самих компонентах, лише в `styles/themes/`.

---

## 5. Розподіл відповідальності: Regle vs TanStack Query

- **Regle** — усе, що стосується форм: реєстрація, анкета цілей, редагування профілю, додавання страви вручну. Валідація описується прямо в структурі форми.
- **TanStack Query** — усе, що стосується отримання/кешування/синхронізації даних із сервера чи зовнішніх API.

Вони не перетинаються за зоною відповідальності: Regle не займається кешуванням, Query не займається валідацією полів.

---

## 6. AI-виклики — окрема гілка

AI-логіка навмисно винесена окремо від основного потоку даних (Supabase / Food API / Recipe API), оскільки:

- викликається лише вручну, не автоматично;
- ключ живе тільки в Edge Function;
- не є критичною залежністю для роботи сайту.

```
Vue → "Analyze" (дія користувача) → Supabase Edge Function → Gemini API → результат (ккал) → Vue
```
