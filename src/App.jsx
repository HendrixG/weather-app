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
  const [started, setStarted]       = useState(false)
  const [whiteTime, setWhiteTime]   = useState(0)
  const [blackTime, setBlackTime]   = useState(0)
  const [isWhiteTurn, setIsWhiteTurn] = useState(true)
  const [moves, setMoves]           = useState([])
  const [inCheck, setInCheck]       = useState(false)

  // Chess clock
  useEffect(() => {
    if (!started) return
    const iv = setInterval(() => {
      isWhiteTurn ? setWhiteTime(t => t + 1) : setBlackTime(t => t + 1)
    }, 1000)
    return () => clearInterval(iv)
  }, [started, isWhiteTurn])

  // Fetch weather (US-only) with logs
  async function fetchWeather(city) {
    setLoading(true)
    setWeatherError('')
    try {
      const logs = []

      // Geocode
      const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
        city
      )}&count=1`
      logs.push(`🔍 ${geoUrl}`)
      const geoRes = await fetch(geoUrl)
      const geoJson = await geoRes.json()
      logs.push(`🔍 ${JSON.stringify(geoJson)}`)
      const loc = geoJson.results?.[0]
      if (!loc) throw new Error('Location not found')
      if (loc.country_code !== 'US') throw new Error('Please enter a U.S. city')

      // Forecast
      const url = new URL('https://api.open-meteo.com/v1/forecast')
      url.search = new URLSearchParams({
        latitude: loc.latitude,
        longitude: loc.longitude,
        current_weather: 'true',
        daily: 'temperature_2m_max,temperature_2m_min',
        timezone: 'auto'
      }).toString()
      logs.push(`☁️ ${url}`)
      const res = await fetch(url)
      const data = await res.json()
      logs.push(`☁️ ${JSON.stringify(data)}`)
      if (!res.ok) throw new Error('Weather data unavailable')

      const {
        current_weather: { temperature, windspeed },
        daily
      } = data

      setWeatherData({
        id: Date.now(),
        name: loc.name,
        country: loc.country,
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
      {/* Nav */}
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

      {tab === 'weather' ? (
        <>
          <h1>Weather App</h1>

          <SearchBar onSearch={fetchWeather} placeholder="Enter U.S. city…" />

          {loading && <p className="status">Loading…</p>}
          {weatherError && <p className="error">{weatherError}</p>}

          <div className="cards-container">
            {weatherData && (
              <WeatherCard data={weatherData} onRemove={clearWeather} />
            )}
          </div>
        </>
      ) : (
        <>
          <h1>Chess Game</h1>

          {!started ? (
            <button className="btn btn-primary" onClick={() => setStarted(true)}>
              Start Game
            </button>
          ) : (
            <button className="btn btn-outline btn-error" onClick={resetChess}>
              End / Reset
            </button>
          )}

          <div className="chess-layout">
            <div className={started ? 'chess-area' : 'chess-area disabled'}>
              {inCheck && <div className="check-alert">♟ Check!</div>}
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
                  <span>♙ {whiteTime}s</span>
                  <span>♟ {blackTime}s</span>
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









