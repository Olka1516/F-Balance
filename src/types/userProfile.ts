export type UserGoal = 'lose' | 'maintain' | 'gain'

export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'

export type UserProfile = {
  userId: string
  goal: UserGoal
  weight: number
  height: number
  activityLevel: ActivityLevel
  dailyCalories: number
  updatedAt: string
}
