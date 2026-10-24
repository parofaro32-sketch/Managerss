export type TeamEffortLevel = 'Medium' | 'High' | 'Extreme';
export type StaminaCondition = 'Great' | 'Tired' | 'Exhausted';

export interface StaminaBurnRates {
  Medium: number;
  High: number;
  Extreme: number;
}

// Configurable stamina consumption multipliers per 90-minute match
export const DEFAULT_STAMINA_BURN_RATES: StaminaBurnRates = {
  Medium: 14,   // Standard balanced work-rate
  High: 22,     // High pressing, aggressive work-rate
  Extreme: 32,  // Heavy pressing & relentless overload work-rate
};

/**
 * Calculates new stamina value based on minutes played and team effort.
 */
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

/**
 * Determines player physical condition based on numeric stamina
 * - Great: 70–100
 * - Tired: 30–69
 * - Exhausted: 0–29
 */
export function getStaminaCondition(stamina: number): StaminaCondition {
  if (stamina >= 70) return 'Great';
  if (stamina >= 30) return 'Tired';
  return 'Exhausted';
}
