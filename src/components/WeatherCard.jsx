// src/components/WeatherCard.jsx
import React from 'react';

export default function WeatherCard({ data, onRemove }) {
  const { name, country, temperature, windspeed, daily, logs } = data;
  const fahrenheit = (temperature * 9) / 5 + 32;
  const nextDays = daily.time.slice(1, 6);

  return (
    <div className="weather-card">
      <button className="remove-btn" onClick={onRemove} aria-label="Remove">
        ×
      </button>
      <h2>
        {name}, {country}
      </h2>
      <p>
        <strong>Temp:</strong> {Math.round(temperature)}°C /{' '}
        {Math.round(fahrenheit)}°F
      </p>
      <p>
        <strong>Wind:</strong> {Math.round(windspeed)} m/s
      </p>

      <div className="forecast-container">
        {nextDays.map((day, i) => (
          <div key={day} className="forecast-day">
            <div className="forecast-date">
              {new Date(day).toLocaleDateString(undefined, {
                weekday: 'short',
                month:   'short',
                day:     'numeric'
              })}
            </div>
            <div className="forecast-temps">
              <span>
                H: {Math.round(daily.temperature_2m_max[i + 1])}°C
              </span>
              <span>
                L: {Math.round(daily.temperature_2m_min[i + 1])}°C
              </span>
            </div>
          </div>
        ))}
      </div>

      <details className="api-logs">
        <summary>Show API Process</summary>
        <ul>
          {logs.map((line, idx) => (
            <li key={idx}>
              <code>{line}</code>
            </li>
          ))}
        </ul>
      </details>
    </div>
  );
}



