// src/App.jsx
import React, { useState, useEffect } from 'react'
import SearchBar from './components/SearchBar'
import WeatherCard from './components/WeatherCard'
import ChessGame from './components/ChessGame'
import './App.css'

export default function App() {
  const [tab, setTab] = useState('weather')

  // Weather state
  const [weatherData, setWeatherData]   = useState(null)
  const [weatherError, setWeatherError] = useState('')
  const [loading, setLoading]           = useState(false)

  // Chess state
  const [started, setStarted]         = useState(false)
  const [whiteTime, setWhiteTime]     = useState(0)
  const [blackTime, setBlackTime]     = useState(0)
  const [isWhiteTurn, setIsWhiteTurn] = useState(true)
  const [moves, setMoves]             = useState([])
  const [inCheck, setInCheck]         = useState(false)

  // Chess clock
  useEffect(() => {
    if (!started) return
    const iv = setInterval(() => {
      isWhiteTurn
        ? setWhiteTime(t => t + 1)
        : setBlackTime(t => t + 1)
    }, 1000)
    return () => clearInterval(iv)
  }, [started, isWhiteTurn])

  // Fetch weather + US-only + logs + pick correct state match
  async function fetchWeather(cityRaw) {
    setLoading(true)
    setWeatherError('')
    try {
      const logs = []

      // 1) Parse out city and state
      const [cityName, stateName] = cityRaw.split(',').map(s => s.trim())

      // 2) Geocode up to 5 U.S. results, then choose the one in our state
      const geoUrl =
        `https://geocoding-api.open-meteo.com/v1/search?` +
        `name=${encodeURIComponent(cityName)}&count=5&country=US`
      logs.push(`🔍 ${geoUrl}`)
      const geoRes  = await fetch(geoUrl)
      const geoJson = await geoRes.json()
      logs.push(`🔍 ${JSON.stringify(geoJson)}`)
      const loc = (geoJson.results || []).find(
        r => r.country_code === 'US' && r.admin1 === stateName
      )
      if (!loc) throw new Error('Location not found')

      // 3) Fetch forecast
      const url = new URL('https://api.open-meteo.com/v1/forecast')
      url.search = new URLSearchParams({
        latitude:        loc.latitude,
        longitude:       loc.longitude,
        current_weather: 'true',
        daily:           'temperature_2m_max,temperature_2m_min',
        timezone:        'auto'
      }).toString()
      logs.push(`☁️ ${url}`)
      const res  = await fetch(url)
      const data = await res.json()
      logs.push(`☁️ ${JSON.stringify(data)}`)
      if (!res.ok) throw new Error('Weather data unavailable')

      const {
        current_weather: { temperature, windspeed },
        daily
      } = data

      // 4) Save to state (including name, state, country, logs, etc)
      setWeatherData({
        id:          Date.now(),
        name:        loc.name,
        state:       loc.admin1,
        country:     loc.country,
        temperature,
        windspeed,
        daily,
        logs
      })
    } catch (err) {
      setWeatherError(err.message)
      setWeatherData(null)
    } finally {
      setLoading(false)
    }
  }

  const clearWeather = () => {
    setWeatherData(null)
    setWeatherError('')
  }

  const resetChess = () => {
    setStarted(false)
    setMoves([])
    setInCheck(false)
    setWhiteTime(0)
    setBlackTime(0)
    setIsWhiteTurn(true)
  }

  return (
    <div className="app-container">
      {/* fixed nav */}
      <nav className="tabs">
        {['weather', 'chess'].map(p => (
          <button
            key={p}
            className={tab === p ? 'tab active' : 'tab'}
            onClick={() => setTab(p)}
          >
            {p.charAt(0).toUpperCase() + p.slice(1)}
          </button>
        ))}
      </nav>

      {/* WEATHER VIEW */}
      {tab === 'weather' ? (
        <>
          <h1>Weather</h1>

          <details className="info-card">
            <summary>About the Weather</summary>
            <p>
              Enter any U.S. city to see the current temperature (°F), wind speed,
              and a 5-day high/low forecast. Under the hood we geocode via Open-Meteo,
              fetch several US results, pick the one matching your state, then log
              each API step.
            </p>
          </details>

          <SearchBar
            onSearch={fetchWeather}
            placeholder="Enter a U.S. city..."
          />
          {loading      && <p className="status">Loading…</p>}
          {weatherError && <p className="error">{weatherError}</p>}
          <div className="cards-container">
            {weatherData && (
              <WeatherCard
                data={weatherData}
                onRemove={clearWeather}
              />
            )}
          </div>
        </>
      ) : (
        <>
          <h1>Chess Game</h1>

          <details className="info-card">
            <summary>About the Chess Game</summary>
            <p>
              A React-based chessboard utilizing <code>react-chessboard</code> and
              <code>chess.js</code>. Each side has its own timer, moves are validated,
              and you can review move history in the companion table.
            </p>
          </details>

          {!started ? (
            <button
              className="btn btn-primary"
              onClick={() => setStarted(true)}
            >
              Start Game
            </button>
          ) : (
            <button
              className="btn btn-outline btn-error"
              onClick={resetChess}
            >
              End / Reset
            </button>
          )}
          <div className="chess-layout">
            <div className={started ? 'chess-area' : 'chess-area disabled'}>
              {inCheck && (
                <div className="check-alert">
                  ♟ The King is in Check!
                </div>
              )}
              <ChessGame
                moves={moves}
                onMoveUpdate={(m, c) => {
                  setMoves(m)
                  setInCheck(c)
                }}
                onTurnChange={setIsWhiteTurn}
              />
            </div>
            {started && (
              <div className="move-history">
                <div className="timers">
                  <span>♟ {whiteTime}s</span>
                  <span>♙ {blackTime}s</span>
                </div>
                <table>
                  <thead>
                    <tr>
                      <th>Turn</th>
                      <th>W</th>
                      <th>B</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: Math.ceil(moves.length / 2) }).map((_, i) => (
                      <tr key={i}>
                        <td>{i + 1}</td>
                        <td>{moves[2 * i] || ''}</td>
                        <td>{moves[2 * i + 1] || ''}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

