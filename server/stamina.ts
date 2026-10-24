export type TeamEffortLevel = 'Medium' | 'High' | 'Extreme';
export type StaminaCondition = 'Great' | 'Tired' | 'Exhausted';

export interface StaminaBurnRates {
  Medium: number;
  High: number;
  Extreme: number;
}

export const DEFAULT_STAMINA_BURN_RATES: StaminaBurnRates = {
  Medium: 14,
  High: 22,
  Extreme: 32,
};

export function calculateMatchStaminaLoss(
  currentStamina: number,
  minutesPlayed: number,
  teamEffort: TeamEffortLevel,
  burnRates: StaminaBurnRates = DEFAULT_STAMINA_BURN_RATES
): number {
  const fullMatchBurn = burnRates[teamEffort] || burnRates.Medium;
  const matchFraction = Math.min(Math.max(minutesPlayed / 90, 0), 1.5);
  const staminaLoss = Math.round(fullMatchBurn * matchFraction);
  const newStamina = Math.max(0, Math.min(100, currentStamina - staminaLoss));
  return newStamina;
}

export function getStaminaCondition(stamina: number): StaminaCondition {
  if (stamina >= 70) return 'Great';
  if (stamina >= 30) return 'Tired';
  return 'Exhausted';
}
