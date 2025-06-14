// src/components/WeatherCard.jsx
import React from 'react'

export default function WeatherCard({ data, onRemove }) {
  const { name, state, country, temperature, windspeed, daily, logs } = data

  // Convert Celsius to Fahrenheit
  const tempF = Math.round((temperature * 9) / 5 + 32)
  const wind = Math.round(windspeed) // m/s, unchanged

  // Precompute daily highs/lows in °F if daily is present
  const highsF = daily
    ? daily.temperature_2m_max.map(c => Math.round((c * 9) / 5 + 32))
    : []
  const lowsF = daily
    ? daily.temperature_2m_min.map(c => Math.round((c * 9) / 5 + 32))
    : []

  return (
    <div className="weather-card">
      <button
        className="remove-btn"
        onClick={onRemove}
        aria-label="Remove card"
      >
        ×
      </button>

      <h2>
        {name}, {state}, {country}
      </h2>

      <p>
        <strong>Temp:</strong> {tempF}°F
      </p>
      <p>
        <strong>Wind:</strong> {wind} m/s
      </p>

      {/* 5-day forecast strip */}
      {daily && (
        <div className="forecast-container">
          {daily.time.map((d, i) => (
            <div key={d} className="forecast-day">
              <div className="forecast-date">
                {new Date(d).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric'
                })}
              </div>
              <div className="forecast-temps">
                <span>↑ {highsF[i]}°F</span>
                <span>↓ {lowsF[i]}°F</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* API logs */}
      {logs && (
        <details className="api-logs">
          <summary>Show API Process</summary>
          <ul>
            {logs.map((l, i) => (
              <li key={i}>
                <code>{l}</code>
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  )
}






