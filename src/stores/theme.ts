import { defineStore } from 'pinia'
import { useSeasonTheme } from '@/composables/useSeasonTheme'
import type { Season } from '@/constants/theme'

export const useThemeStore = defineStore('theme', () => {
  const { currentSeason, resolveSeasonFromDate, applyTheme, syncThemeFromDate } =
    useSeasonTheme()

  function init(): Season {
    return syncThemeFromDate()
  }

  function setSeason(season: Season): void {
    currentSeason.value = season
    applyTheme(season)
  }

  return {
    season: currentSeason,
    init,
    setSeason,
    resolveSeasonFromDate,
    syncThemeFromDate,
  }
})
