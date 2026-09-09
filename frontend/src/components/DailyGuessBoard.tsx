import { FIELD_KEYS, FIELD_LABELS, evaluateTournamentLevel, type DailyGuess, type DailyMatch, evaluateGuess } from '../utils/dailyGame'

type DailyGuessBoardProps = {
  guesses: DailyGuess[]
  match: DailyMatch
}

const stateSymbols = { up: '↑', down: '↓' }

export function DailyGuessBoard({ guesses, match }: DailyGuessBoardProps) {
  return (
    <div className="guess-board" aria-label="Daily game attempts">
      <div className="board-header">
        {FIELD_KEYS.flatMap((key) => key === 'tournament_name' ? [<span key={key}>{FIELD_LABELS[key]}</span>, <span key="tournament_level">ATP level</span>] : [<span key={key}>{FIELD_LABELS[key]}</span>])}
      </div>
      {guesses.map((guess, index) => {
        const states = evaluateGuess(guess, match)
        return (
          <div className="attempt-row" key={`${index}-${guess.winner}`}>
            {FIELD_KEYS.flatMap((key) => {
              const cells = [
                <div className={`attempt-cell ${states[key]}`} key={key}>
                  <span>{guess[key] || '—'}</span>
                  {(states[key] === 'up' || states[key] === 'down') && <b aria-label={states[key] === 'up' ? 'Higher' : 'Lower'}>{stateSymbols[states[key]]}</b>}
                </div>,
              ]
              if (key === 'tournament_name') cells.push(<div className={`attempt-cell ${evaluateTournamentLevel(guess, match)}`} key="tournament_level"><span>{guess.tournament_level || '—'}</span></div>)
              return cells
            })}
          </div>
        )
      })}
      {guesses.length === 0 && <div className="empty-board">Your completed attempts will appear here.</div>}
    </div>
  )
}
