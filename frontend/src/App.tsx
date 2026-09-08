import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { BrowserRouter, Link, Navigate, Route, Routes } from 'react-router-dom'
import './App.css'

type DailyMatch = {
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

type LetterState = 'correct' | 'present' | 'absent' | 'empty'

const MAX_GUESSES = 6

function normalize(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z]/gi, '')
    .toUpperCase()
}

function evaluateGuess(guess: string, answer: string): LetterState[] {
  const result = Array<LetterState>(answer.length).fill('absent')
  const remaining = answer.split('')

  guess.split('').forEach((letter, index) => {
    if (letter === answer[index]) {
      result[index] = 'correct'
      remaining[index] = ''
    }
  })

  guess.split('').forEach((letter, index) => {
    if (result[index] === 'correct') return
    const foundAt = remaining.indexOf(letter)
    if (foundAt !== -1) {
      result[index] = 'present'
      remaining[foundAt] = ''
    }
  })

  return result
}

function DailyGame() {
  const [match, setMatch] = useState<DailyMatch | null>(null)
  const [guess, setGuess] = useState('')
  const [guesses, setGuesses] = useState<string[]>([])
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

  const answer = normalize(match?.winner ?? '')
  const won = guesses.some((item) => normalize(item) === answer)
  const lost = guesses.length >= MAX_GUESSES && !won
  const gameOver = won || lost

  const keyboard = useMemo(() => {
    const states: Record<string, LetterState> = {}
    guesses.forEach((item) => {
      const letters = normalize(item)
      evaluateGuess(letters, answer).forEach((state, index) => {
        const letter = letters[index]
        if (!letter) return
        if (state === 'correct' || (state === 'present' && states[letter] === 'absent')) {
          states[letter] = state
        } else if (!states[letter]) {
          states[letter] = state
        }
      })
    })
    return states
  }, [answer, guesses])

  function submitGuess(event: FormEvent) {
    event.preventDefault()
    const normalizedGuess = normalize(guess)
    if (!normalizedGuess) {
      setMessage('Type a player name to make a guess.')
      return
    }
    if (normalizedGuess.length !== answer.length) {
      setMessage(`Your guess needs ${answer.length} letters, ignoring spaces.`)
      return
    }
    if (gameOver) return

    setGuesses((current) => [...current, guess.trim()])
    setGuess('')
    setMessage(normalizedGuess === answer ? 'Match point. You got it.' : '')
  }

  function resetGame() {
    setGuesses([])
    setGuess('')
    setMessage('')
  }

  if (loading) {
    return <main className="page-state"><span className="loader" /> Loading today’s match</main>
  }

  if (error || !match) {
    return <main className="page-state"><p>{error || 'No match available today.'}</p><Link className="text-link" to="/dailygame">Try again</Link></main>
  }

  const rows = Array.from({ length: MAX_GUESSES }, (_, index) => guesses[index] ?? '')

  return (
    <div className="app-shell">
      <header className="topbar">
        <Link className="brand" to="/dailygame"><span className="brand-mark">M</span><span>Match Point</span></Link>
        <div className="date-stamp"><span className="live-dot" /> DAILY GAME <span className="slash">/</span> 08 SEP 2026</div>
        <button className="icon-button" type="button" onClick={resetGame} aria-label="Reset game" title="Reset game">↻</button>
      </header>

      <main className="game-layout">
        <section className="game-column">
          <div className="eyebrow">TODAY'S MATCH · {match.tournament_level ?? 'ATP'}</div>
          <h1>Who took the<br /><em>match point?</em></h1>
          <p className="intro">Guess the winner in six tries. Every tile tells you how close you are.</p>

          <div className="game-meta"><span><strong>{guesses.length}</strong> / {MAX_GUESSES} guesses</span><span className="meta-divider" /><span>{answer.length} letters</span></div>

          <div className="board" aria-label="Daily game board">
            {rows.map((row, rowIndex) => {
              const letters = normalize(row)
              const states = row ? evaluateGuess(letters, answer) : []
              return <div className="guess-row" style={{ gridTemplateColumns: `repeat(${answer.length}, minmax(0, 1fr))` }} key={rowIndex}>
                {Array.from({ length: answer.length }, (_, letterIndex) => {
                  const value = letters[letterIndex] ?? ''
                  return <span className={`tile ${states[letterIndex] ?? 'empty'} ${value ? 'filled' : ''}`} key={letterIndex}>{value}</span>
                })}
              </div>
            })}
          </div>

          <form className="guess-form" onSubmit={submitGuess}>
            <label className="sr-only" htmlFor="guess">Guess the winner</label>
            <input id="guess" value={guess} onChange={(event) => setGuess(event.target.value)} placeholder="PLAYER NAME" disabled={gameOver} autoComplete="off" />
            <button type="submit" disabled={gameOver}>Enter</button>
          </form>
          <p className={`message ${message ? 'visible' : ''}`}>{message || ' '}</p>

          <div className="keyboard" aria-label="Letter keyboard">
            {'QWERTYUIOP ASDFGHJKL ZXCVBNM'.split(' ').map((row) => <div className="key-row" key={row}>
              {row.split('').map((letter) => <span className={`key ${keyboard[letter] ?? ''}`} key={letter}>{letter}</span>)}
            </div>)}
          </div>
        </section>

        <aside className={`match-card ${gameOver ? 'revealed' : ''}`}>
          <div className="card-top"><span>COURT REPORT</span><span className="card-number">NO. 248</span></div>
          <div className="court-line" />
          <div className="match-status">{won ? 'WINNER FOUND' : lost ? 'FINAL RESULT' : 'RESULT LOCKED'}</div>
          <div className="players">
            <div className="player-row winner-row"><span className="player-label">W</span><div><strong>{gameOver ? match.winner : '?????'}</strong><small>{gameOver ? match.winner_ioc3 : '???'}</small></div></div>
            <div className="player-row"><span className="player-label">L</span><div><strong>{gameOver ? match.loser : '?????'}</strong><small>{gameOver ? match.loser_ioc3 : '???'}</small></div></div>
          </div>
          <div className="match-details">
            <div><span>EVENT</span><strong>{match.tournament_name ?? '—'}</strong></div>
            <div><span>ROUND</span><strong>{match.round ?? '—'}</strong></div>
            <div><span>YEAR</span><strong>{match.year ?? '—'}</strong></div>
            <div><span>SCORE</span><strong>{gameOver ? match.result ?? '—' : '—'}</strong></div>
            <div><span>DURATION</span><strong>{gameOver && match.minutes ? `${match.minutes} min` : '—'}</strong></div>
          </div>
          {lost && <p className="reveal-note">The winner was <b>{match.winner}</b>. Come back tomorrow for a new match.</p>}
          {won && <p className="reveal-note">Excellent read. A clean winner in {guesses.length} {guesses.length === 1 ? 'guess' : 'guesses'}.</p>}
        </aside>
      </main>
      <footer className="footer"><span>ONE MATCH. ONE DAY.</span><span>Powered by the tour archive</span></footer>
    </div>
  )
}

function Home() {
  return (
    <main className="home-page">
      <span className="eyebrow">MATCH POINT</span>
      <h1>One match.<br /><em>One chance.</em></h1>
      <p>Test your tennis instincts in the daily match game.</p>
      <Link className="home-link" to="/dailygame">Play today&apos;s game <span aria-hidden="true">→</span></Link>
    </main>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/dailygame" element={<DailyGame />} />
        <Route path="/" element={<Home />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
