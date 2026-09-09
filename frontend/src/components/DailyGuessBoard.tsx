import { FIELD_KEYS, FIELD_LABELS, evaluateTournamentLevel, type DailyGuess, type DailyMatch, evaluateGuess } from '../utils/dailyGame'

type DailyGuessBoardProps = {
  guesses: DailyGuess[]
  match: DailyMatch
  revealed: boolean
}

const stateSymbols = { up: '↑', down: '↓' }

export function DailyGuessBoard({ guesses, match, revealed }: DailyGuessBoardProps) {
  return (
    <div className="guess-board" aria-label="Daily game attempts">
      <div className="board-header">
        <span>Winner</span><span>IOC3</span><span>Loser</span><span>IOC3</span><span>{FIELD_LABELS.tournament_name}</span><span>ATP level</span><span>{FIELD_LABELS.round}</span><span>{FIELD_LABELS.year}</span>
      </div>
      {guesses.map((guess, index) => {
        const states = evaluateGuess(guess, match)
        return (
          <div className="attempt-row" key={`${index}-${guess.winner}`}>
            <div className={`attempt-cell ${states.winner}`}><span>{guess.winner || '—'}</span></div>
            <div className="attempt-cell info-cell"><span>{revealed ? match.winner_ioc3 || '—' : '???'}</span></div>
            <div className={`attempt-cell ${states.loser}`}><span>{guess.loser || '—'}</span></div>
            <div className="attempt-cell info-cell"><span>{revealed ? match.loser_ioc3 || '—' : '???'}</span></div>
            <div className={`attempt-cell ${states.tournament_name}`}><span>{guess.tournament_name || '—'}</span></div>
            <div className={`attempt-cell ${evaluateTournamentLevel(guess, match)}`}><span>{guess.tournament_level || '—'}</span></div>
            <div className={`attempt-cell ${states.round}`}><span>{guess.round || '—'}</span></div>
            <div className={`attempt-cell ${states.year}`}>
              <span>{guess.year || '—'}</span>
              {(states.year === 'up' || states.year === 'down') && <b aria-label={states.year === 'up' ? 'Higher' : 'Lower'}>{stateSymbols[states.year]}</b>}
            </div>
          </div>
        )
      })}
      {guesses.length === 0 && <div className="empty-board">Your completed attempts will appear here.</div>}
    </div>
  )
}
