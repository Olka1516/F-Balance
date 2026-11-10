export type UserGoal = 'lose' | 'maintain' | 'gain'

/**
 * Biological sex used by the BMR formula.
 */
export type BiologicalSex = 'female' | 'male'

/**
 * How fast the user wants to change weight.
 */
export type GoalPace = 'slow' | 'normal' | 'fast'

export type ActivityLevel =
  | 'sedentary'
  | 'light'
  | 'moderate'
  | 'active'
  | 'very_active'

/**
 * Persisted nutrition profile for an authenticated user.
 */
export type UserProfile = {
  userId: string
  goal: UserGoal | null
  sex: BiologicalSex | null
  weight: number | null
  targetWeight: number | null
  pace: GoalPace | null
  height: number | null
  age: number | null
  activityLevel: ActivityLevel | null
  dailyCalories: number | null
  dailyProtein: number | null
  dailyFat: number | null
  dailyCarbs: number | null
  onboardingCompleted: boolean
  updatedAt: string
}

/**
 * Writable profile fields sent to Supabase upserts.
 */
export type UserProfileInput = {
  goal: UserGoal | null
  sex: BiologicalSex | null
  weight: number | null
  targetWeight: number | null
  pace: GoalPace | null
  height: number | null
  age: number | null
  activityLevel: ActivityLevel | null
  dailyCalories: number | null
  dailyProtein: number | null
  dailyFat: number | null
  dailyCarbs: number | null
  onboardingCompleted: boolean
}

/**
 * Editable profile form values as strings for inputs.
 */
export type ProfileFormValues = {
  goal: string
  sex: string
  weight: string
  targetWeight: string
  pace: string
  height: string
  age: string
  activityLevel: string
  dailyCalories: string
  dailyProtein: string
  dailyFat: string
  dailyCarbs: string
}
