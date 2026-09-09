import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { DailyGuessBoard } from '../components/DailyGuessBoard'
import { DailyGuessForm } from '../components/DailyGuessForm'
import { MatchCard } from '../components/MatchCard'
import { FIELD_KEYS, evaluateGuess, type DailyGuess, type DailyMatch, type FieldKey } from '../utils/dailyGame'

const MAX_GUESSES = 6
const emptyGuess = (): DailyGuess => ({ winner: '', loser: '', tournament_name: '', round: '', year: '' })

export function DailyGamePage() {
  const [match, setMatch] = useState<DailyMatch | null>(null)
  const [guess, setGuess] = useState<DailyGuess>(emptyGuess)
  const [guesses, setGuesses] = useState<DailyGuess[]>([])
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/matches/today')
      .then((response) => {
        if (!response.ok) throw new Error('Could not load today\'s match')
        return response.json() as Promise<DailyMatch>
      })
      .then(setMatch)
      .catch(() => setError('The daily match could not be loaded.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <main className="page-state"><span className="loader" /> Loading today&apos;s match</main>
  if (error || !match) return <main className="page-state"><p>{error || 'No match available today.'}</p><Link className="text-link" to="/dailygame">Try again</Link></main>

  const results = guesses.map((item) => evaluateGuess(item, match))
  const won = results.some((result) => FIELD_KEYS.every((key) => result[key] === 'correct'))
  const lost = guesses.length >= MAX_GUESSES && !won
  const gameOver = won || lost

  function submitGuess(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (gameOver) return
    if (FIELD_KEYS.some((key) => !guess[key].trim())) {
      setMessage('Complete all five fields before checking your attempt.')
      return
    }
    if (!/^[0-9]{4}$/.test(guess.year)) {
      setMessage('Year must contain four digits.')
      return
    }
    setGuesses((current) => [...current, guess])
    setGuess(emptyGuess())
    setMessage('')
  }

  function updateGuess(key: FieldKey, value: string) {
    setGuess((current) => ({ ...current, [key]: value }))
  }

  function resetGame() {
    setGuesses([])
    setGuess(emptyGuess())
    setMessage('')
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <Link className="brand" to="/dailygame"><span className="brand-mark">M</span><span>Match Point</span></Link>
        <div className="date-stamp"><span className="live-dot" /> DAILY GAME <span className="slash">/</span> 09 SEP 2026</div>
        <button className="icon-button" type="button" onClick={resetGame} aria-label="Reset game" title="Reset game">↻</button>
      </header>
      <main className="game-layout">
        <section className="game-column">
          <div className="eyebrow">TODAY&apos;S MATCH · {match.tournament_level ?? 'ATP'}</div>
          <h1>Read the<br /><em>match point.</em></h1>
          <p className="intro">Fill in the five clues. Green is exact, yellow is close, and red is off the mark.</p>
          <div className="game-meta"><span><strong>{guesses.length}</strong> / {MAX_GUESSES} attempts</span><span className="meta-divider" /><span>5 clues per attempt</span></div>
          <DailyGuessBoard guesses={guesses} match={match} />
          {!gameOver && <DailyGuessForm guess={guess} disabled={gameOver} onChange={updateGuess} onSubmit={submitGuess} />}
          <p className={`message ${message ? 'visible' : ''}`}>{message || ' '}</p>
          {gameOver && <button className="play-again" type="button" onClick={resetGame}>Play again <span aria-hidden="true">↻</span></button>}
        </section>
        <MatchCard match={match} revealed={gameOver} won={won} lost={lost} />
      </main>
      <footer className="footer"><span>ONE MATCH. ONE DAY.</span><span>Powered by the tour archive</span></footer>
    </div>
  )
}
