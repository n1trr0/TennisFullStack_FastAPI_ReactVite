import type { FormEvent } from 'react'
import { FIELD_KEYS, FIELD_LABELS, type DailyGuess, type FieldKey } from '../utils/dailyGame'

type DailyGuessFormProps = {
  guess: DailyGuess
  disabled: boolean
  onChange: (key: FieldKey, value: string) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}

export function DailyGuessForm({ guess, disabled, onChange, onSubmit }: DailyGuessFormProps) {
  return (
    <form className="guess-form" onSubmit={onSubmit}>
      <div className="guess-fields">
        {FIELD_KEYS.map((key) => (
          <label className={`guess-field ${key === 'year' ? 'year-field' : ''}`} key={key}>
            <span>{FIELD_LABELS[key]}</span>
            <input
              value={guess[key]}
              onChange={(event) => onChange(key, event.target.value)}
              placeholder={key === 'year' ? 'YYYY' : `Enter ${FIELD_LABELS[key].toLowerCase()}`}
              inputMode={key === 'year' ? 'numeric' : 'text'}
              type={key === 'year' ? 'number' : 'text'}
              disabled={disabled}
              autoComplete="off"
            />
          </label>
        ))}
      </div>
      <button type="submit" disabled={disabled}>Check attempt <span aria-hidden="true">→</span></button>
    </form>
  )
}
