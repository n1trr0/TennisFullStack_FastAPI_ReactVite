import { useState, type FormEvent } from 'react'
import { FIELD_KEYS, FIELD_LABELS, formatTournamentOption, normalize, type DailyGuess, type FieldKey, type TournamentOption } from '../utils/dailyGame'

type DailyGuessFormProps = {
  guess: DailyGuess
  disabled: boolean
  onChange: (key: FieldKey, value: string) => void
  tournamentOptions: TournamentOption[]
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}

export function DailyGuessForm({ guess, disabled, onChange, tournamentOptions, onSubmit }: DailyGuessFormProps) {
  const [isTournamentListOpen, setIsTournamentListOpen] = useState(false)
  const filteredTournaments = tournamentOptions.filter((option) => normalize(formatTournamentOption(option)).includes(normalize(guess.tournament_name)))

  function updateTournamentName(value: string) {
    onChange('tournament_name', value)
    onChange('tournament_level', '')
    setIsTournamentListOpen(true)
  }

  function selectTournament(option: TournamentOption) {
    onChange('tournament_name', option.tourney_name)
    onChange('tournament_level', option.level ?? '')
    setIsTournamentListOpen(false)
  }

  return (
    <form className="guess-form" onSubmit={onSubmit}>
      <div className="guess-fields">
        {FIELD_KEYS.map((key) => (
          <label className={`guess-field ${key === 'year' ? 'year-field' : ''}`} key={key}>
            <span>{FIELD_LABELS[key]}</span>
            {key === 'tournament_name' ? (
              <div className="tournament-autocomplete">
                <input
                  value={guess[key]}
                  onChange={(event) => updateTournamentName(event.target.value)}
                  onFocus={() => setIsTournamentListOpen(true)}
                  placeholder="Type a tournament"
                  disabled={disabled}
                  autoComplete="off"
                  role="combobox"
                  aria-expanded={isTournamentListOpen}
                  aria-controls="tournament-suggestions"
                />
                {isTournamentListOpen && !disabled && (
                  <div className="tournament-suggestions" id="tournament-suggestions" role="listbox">
                    {filteredTournaments.length > 0 ? filteredTournaments.map((option) => (
                      <button
                        className="tournament-suggestion"
                        type="button"
                        role="option"
                        key={`${option.tourney_name}::${option.level ?? ''}`}
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => selectTournament(option)}
                      >
                        <span>{option.tourney_name}</span><small>({option.level ?? 'ATP'})</small>
                      </button>
                    )) : <p className="no-tournament-suggestions">No tournaments found</p>}
                  </div>
                )}
              </div>
            ) : (
              <input
                value={guess[key]}
                onChange={(event) => onChange(key, event.target.value)}
                placeholder={key === 'year' ? 'YYYY' : `Enter ${FIELD_LABELS[key].toLowerCase()}`}
                inputMode={key === 'year' ? 'numeric' : 'text'}
                type={key === 'year' ? 'number' : 'text'}
                disabled={disabled}
                autoComplete="off"
              />
            )}
          </label>
        ))}
      </div>
      <button type="submit" disabled={disabled}>Check attempt <span aria-hidden="true">→</span></button>
    </form>
  )
}
