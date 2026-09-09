import { Link } from 'react-router-dom'

export function HomePage() {
  return (
    <main className="home-page">
      <span className="eyebrow">MATCH POINT</span>
      <h1>One match.<br /><em>One chance.</em></h1>
      <p>Test your tennis instincts in the daily match game.</p>
      <Link className="home-link" to="/dailygame">Play today&apos;s game <span aria-hidden="true">→</span></Link>
    </main>
  )
}
