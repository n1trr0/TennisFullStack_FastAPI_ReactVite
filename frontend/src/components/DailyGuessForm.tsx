import { useEffect, useRef, useState, type FormEvent } from 'react'
import { FIELD_KEYS, FIELD_LABELS, formatTournamentOption, normalize, type DailyGuess, type FieldKey, type PlayerOption, type TournamentOption } from '../utils/dailyGame'

type DailyGuessFormProps = {
  guess: DailyGuess
  disabled: boolean
  onChange: (key: FieldKey, value: string) => void
  tournamentOptions: TournamentOption[]
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}

type PlayerFieldProps = {
  field: 'winner' | 'loser'
  value: string
  disabled: boolean
  onChange: (key: FieldKey, value: string) => void
}

function PlayerAutocomplete({ field, value, disabled, onChange }: PlayerFieldProps) {
  const [options, setOptions] = useState<PlayerOption[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [selectedName, setSelectedName] = useState('')
  const [searchError, setSearchError] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const requestId = useRef(0)

  useEffect(() => {
    function closeOnOutsidePointer(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setIsOpen(false)
    }

    document.addEventListener('pointerdown', closeOnOutsidePointer)
    return () => document.removeEventListener('pointerdown', closeOnOutsidePointer)
  }, [])

  useEffect(() => {
    setSelectedName('')
    setOptions([])
    setSearchError('')
    const query = value.trim()
    if (query.length < 2) {
      setIsOpen(false)
      return
    }

    const currentRequest = ++requestId.current
    const timer = window.setTimeout(() => {
      const controller = new AbortController()
      fetch(`/api/players/${encodeURIComponent(query)}`, { signal: controller.signal })
        .then((response) => {
          if (!response.ok) throw new Error('Could not search players')
          return response.json() as Promise<PlayerOption[]>
        })
        .then((players) => {
          if (currentRequest !== requestId.current) return
          setOptions(players)
          setSearchError('')
          setIsOpen(true)
        })
        .catch((error: unknown) => {
          if (error instanceof DOMException && error.name === 'AbortError') return
          if (currentRequest === requestId.current) setSearchError('Could not search players.')
        })
      return () => controller.abort()
    }, 750)

    return () => window.clearTimeout(timer)
  }, [value])

  function updateValue(nextValue: string) {
    setSelectedName('')
    onChange(field, nextValue)
    setIsOpen(true)
  }

  function selectPlayer(player: PlayerOption) {
    setSelectedName(player.name_full)
    onChange(field, player.name_full)
    setIsOpen(false)
  }

  return (
    <div className="player-autocomplete" ref={containerRef}>
      <input
        value={value}
        onChange={(event) => updateValue(event.target.value)}
        onFocus={() => value.trim().length >= 2 && setIsOpen(true)}
        placeholder={`Enter ${field}`}
        disabled={disabled}
        autoComplete="off"
        role="combobox"
        aria-expanded={isOpen}
      />
      {isOpen && !disabled && !selectedName && value.trim().length >= 2 && (
        <div className="player-suggestions" role="listbox">
          {searchError ? <p className="no-player-suggestions">{searchError}</p> : options.length > 0 ? options.slice(0, 10).map((player) => (
            <button className="player-suggestion" type="button" role="option" key={`${player.name_full}-${player.ioc3 ?? ''}`} onMouseDown={(event) => event.preventDefault()} onClick={() => selectPlayer(player)}>
              <span>{player.name_full}</span><small>{player.ioc3 ?? '—'}</small>
            </button>
          )) : <p className="no-player-suggestions">No players found</p>}
        </div>
      )}
    </div>
  )
}

export function DailyGuessForm({ guess, disabled, onChange, tournamentOptions, onSubmit }: DailyGuessFormProps) {
  const [isTournamentListOpen, setIsTournamentListOpen] = useState(false)
  const tournamentContainerRef = useRef<HTMLDivElement>(null)
  const filteredTournaments = tournamentOptions.filter((option) => normalize(formatTournamentOption(option)).includes(normalize(guess.tournament_name)))

  useEffect(() => {
    function closeOnOutsidePointer(event: PointerEvent) {
      if (!tournamentContainerRef.current?.contains(event.target as Node)) setIsTournamentListOpen(false)
    }

    document.addEventListener('pointerdown', closeOnOutsidePointer)
    return () => document.removeEventListener('pointerdown', closeOnOutsidePointer)
  }, [])

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
            {key === 'winner' || key === 'loser' ? (
              <PlayerAutocomplete field={key} value={guess[key]} disabled={disabled} onChange={onChange} />
            ) : key === 'tournament_name' ? (
              <div className="tournament-autocomplete" ref={tournamentContainerRef}>
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
                    {filteredTournaments.length > 0 ? filteredTournaments.slice(0, 10).map((option) => (
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
