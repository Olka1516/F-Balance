/**
 * Logged meal portion for a specific calendar day.
 */
export type DailyEntry = {
  id: string
  userId: string
  mealId: string
  date: string
  amount: number
}
