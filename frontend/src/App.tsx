import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { DailyGamePage } from './pages/DailyGamePage'
import { HomePage } from './pages/HomePage'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/dailygame" element={<DailyGamePage />} />
        <Route path="/" element={<HomePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
