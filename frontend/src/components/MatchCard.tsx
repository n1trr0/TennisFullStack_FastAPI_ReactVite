import type { DailyMatch } from '../utils/dailyGame'

type MatchCardProps = { match: DailyMatch; revealed: boolean; won: boolean; lost: boolean; onClose: () => void }

export function MatchCard({ match, revealed, won, lost, onClose }: MatchCardProps) {
  return (
    <div className="match-modal" role="dialog" aria-modal="true" aria-labelledby="match-result-title">
      <button className="modal-close" type="button" onClick={onClose} aria-label="Close result" title="Close result">×</button>
      <aside className={`match-card ${revealed ? 'revealed' : ''}`}>
        <div className="card-top"><span id="match-result-title">COURT REPORT</span><span className="card-number">DAILY / 01</span></div>
        <div className="court-line" />
        <div className="match-status">{won ? 'MATCH SOLVED' : lost ? 'FINAL RESULT' : 'RESULT LOCKED'}</div>
        <div className="players">
          <div className="player-row winner-row"><span className="player-label">W</span><div><strong>{revealed ? match.winner : '?????'}</strong><small>{revealed ? match.winner_ioc3 : '???'}</small></div></div>
          <div className="player-row"><span className="player-label">L</span><div><strong>{revealed ? match.loser : '?????'}</strong><small>{revealed ? match.loser_ioc3 : '???'}</small></div></div>
        </div>
        <div className="match-details">
          <div><span>EVENT</span><strong>{revealed ? match.tournament_name ?? '—' : '—'}</strong></div>
          <div><span>ROUND</span><strong>{revealed ? match.round ?? '—' : '—'}</strong></div>
          <div><span>YEAR</span><strong>{revealed ? match.year ?? '—' : '—'}</strong></div>
          <div><span>SCORE</span><strong>{revealed ? match.result ?? '—' : '—'}</strong></div>
          <div><span>DURATION</span><strong>{revealed && match.minutes ? `${match.minutes} min` : '—'}</strong></div>
        </div>
        {lost && <p className="reveal-note">The match winner was <b>{match.winner}</b>. Come back tomorrow for a new match.</p>}
        {won && <p className="reveal-note">Excellent read. You solved today&apos;s match.</p>}
      </aside>
    </div>
  )
}
