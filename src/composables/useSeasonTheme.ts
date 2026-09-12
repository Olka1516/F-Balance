import { ref } from 'vue'
import {
  getThemeClassName,
  MONTH_TO_SEASON,
  SEASONS,
  type Season,
} from '@/constants/theme'

export function resolveSeasonFromDate(date: Date): Season {
  const month = date.getMonth() + 1
  return MONTH_TO_SEASON[month] ?? SEASONS[0]
}

export function useSeasonTheme() {
  const currentSeason = ref<Season>(resolveSeasonFromDate(new Date()))

  function applyTheme(season: Season): void {
    const root = document.documentElement

    for (const seasonName of SEASONS) {
      root.classList.remove(getThemeClassName(seasonName))
    }

    root.classList.add(getThemeClassName(season))
  }

  function syncThemeFromDate(date: Date = new Date()): Season {
    const season = resolveSeasonFromDate(date)
    currentSeason.value = season
    applyTheme(season)
    return season
  }

  return {
    currentSeason,
    resolveSeasonFromDate,
    applyTheme,
    syncThemeFromDate,
  }
}
