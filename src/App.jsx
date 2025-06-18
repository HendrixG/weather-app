// src/App.jsx
import React, { useState, useEffect } from 'react'
import SearchBar   from './components/SearchBar'
import WeatherCard from './components/WeatherCard'
import ChessGame   from './components/ChessGame'
import About       from './components/About'
import './App.css'

export default function App() {
  const [tab, setTab] = useState('weather')

  // Weather state
  const [weatherData,  setWeatherData]  = useState(null)
  const [weatherError, setWeatherError] = useState('')
  const [loading,      setLoading]      = useState(false)

  // Chess state
  const [started,     setStarted]     = useState(false)
  const [whiteTime,   setWhiteTime]   = useState(0)
  const [blackTime,   setBlackTime]   = useState(0)
  const [isWhiteTurn, setIsWhiteTurn] = useState(true)
  const [moves,       setMoves]       = useState([])
  const [inCheck,     setInCheck]     = useState(false)

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

  // Fetch weather
  async function fetchWeather(cityRaw) {
    setLoading(true)
    setWeatherError('')
    try {
      const logs = []
      const [cityName, stateName] = cityRaw.split(',').map(s => s.trim())

      // 1) Geocode
      const geoUrl =
        `https://geocoding-api.open-meteo.com/v1/search?` +
        `name=${encodeURIComponent(cityName)}&count=5&country=US`
      logs.push(geoUrl)
      const geoRes  = await fetch(geoUrl)
      const geoJson = await geoRes.json()
      logs.push(JSON.stringify(geoJson))
      const loc = (geoJson.results || []).find(
        r => r.country_code === 'US' && r.admin1 === stateName
      )
      if (!loc) throw new Error('Location not found')

      // 2) Forecast
      const url = new URL('https://api.open-meteo.com/v1/forecast')
      url.search = new URLSearchParams({
        latitude:        loc.latitude,
        longitude:       loc.longitude,
        current_weather: 'true',
        daily:           'temperature_2m_max,temperature_2m_min',
        timezone:        'auto'
      }).toString()
      logs.push(url.toString())
      const res  = await fetch(url)
      const data = await res.json()
      logs.push(JSON.stringify(data))
      if (!res.ok) throw new Error('Weather data unavailable')

      const {
        current_weather: { temperature, windspeed },
        daily
      } = data

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
        {['weather','chess','contact'].map(p => (
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
      {tab === 'weather' && (
        <>
          <h1>Weather</h1>
          <details className="info-card">
            <summary>About Weather</summary>
            <p>
              Enter any U.S. city to see the current temperature (°F), wind speed,
              and a 7-day high/low forecast. Behind the scenes we geocode via
              Open-Meteo then fetch current + daily data, logging each step.
            </p>
          </details>

          <SearchBar
            onSearch={fetchWeather}
            placeholder="Enter a U.S. city…"
          />
          {loading && <p className="status">Loading…</p>}
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
      )}

      {/* CHESS VIEW */}
      {tab === 'chess' && (
        <>
          <h1>Chess</h1>
          <details className="info-card">
            <summary>About Chess</summary>
            <p>
              A React-based chessboard using react-chessboard + chess.js. Timers,
              move validation, and a companion move-history table.
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

          {started && (
            <div className="chess-layout">
              <div className="chess-area">
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
              <div className="move-history">
                <div className="timers">
                  <span>♟ {whiteTime}s</span>
                  <span>♙ {blackTime}s</span>
                </div>
                <table>
                  <thead>
                    <tr>
                      <th>Turn</th>
                      <th>White</th>
                      <th>Black</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: Math.ceil(moves.length / 2) })
                      .map((_, i) => (
                        <tr key={i}>
                          <td>{i + 1}</td>
                          <td>{moves[2 * i]     || ''}</td>
                          <td>{moves[2 * i + 1] || ''}</td>
                        </tr>
                      ))
                    }
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* CONTACT VIEW */}
      {tab === 'contact' && <About />}
    </div>
  )
}

