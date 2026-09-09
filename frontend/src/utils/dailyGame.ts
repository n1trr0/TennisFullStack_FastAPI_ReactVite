export type DailyMatch = {
  winner: string | null
  winner_ioc3: string | null
  loser: string | null
  loser_ioc3: string | null
  tournament_name: string | null
  tournament_level: string | null
  round: string | null
  year: number | null
  result: string | null
  minutes: number | null
}

export type FieldKey = 'winner' | 'loser' | 'tournament_name' | 'round' | 'year'
export type FieldState = 'correct' | 'present' | 'absent' | 'up' | 'down' | 'empty'

export type DailyGuess = Record<FieldKey, string>

export const FIELD_LABELS: Record<FieldKey, string> = {
  winner: 'Winner',
  loser: 'Loser',
  tournament_name: 'Tournament',
  round: 'Round',
  year: 'Year',
}

export const FIELD_KEYS: FieldKey[] = ['winner', 'loser', 'tournament_name', 'round', 'year']

export function normalize(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/gi, '')
    .toUpperCase()
}

export function evaluateField(key: FieldKey, guess: string, answer: string | number | null): FieldState {
  if (!guess.trim() || answer === null || answer === undefined) return 'empty'
  if (key === 'year') {
    const guessedYear = Number(guess)
    const answerYear = Number(answer)
    if (guessedYear === answerYear) return 'correct'
    return guessedYear < answerYear ? 'up' : 'down'
  }

  const normalizedGuess = normalize(guess)
  const normalizedAnswer = normalize(String(answer))
  if (normalizedGuess === normalizedAnswer) return 'correct'
  if (normalizedAnswer.includes(normalizedGuess) || normalizedGuess.includes(normalizedAnswer)) return 'present'
  return 'absent'
}

export function getMatchValue(match: DailyMatch, key: FieldKey) {
  return match[key]
}

export function evaluateGuess(guess: DailyGuess, match: DailyMatch) {
  return FIELD_KEYS.reduce<Record<FieldKey, FieldState>>((states, key) => {
    states[key] = evaluateField(key, guess[key], getMatchValue(match, key))
    return states
  }, {} as Record<FieldKey, FieldState>)
}
