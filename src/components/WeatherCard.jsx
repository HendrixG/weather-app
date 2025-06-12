import React from "react";

export default function WeatherCard({ data, onRemove }) {
  const { name, country, temperature, windspeed, daily, logs } = data;

  // helper to convert °C → °F
  const toF = c => Math.round((c * 9) / 5 + 32);

  // take the next 5 days (skip today)
  const days = daily.time.slice(1, 6);

  return (
    <div className="weather-card">
      <button className="remove-btn" onClick={onRemove} aria-label="Remove card">
        ×
      </button>

      <h2>{name}, {country}</h2>
      <p><strong>Temp:</strong> {Math.round(temperature)}°C / {toF(temperature)}°F</p>
      <p><strong>Wind:</strong> {Math.round(windspeed)} m/s</p>

      <div className="forecast-container">
        {days.map((d, i) => {
          const maxC = daily.temperature_2m_max[i+1];
          const minC = daily.temperature_2m_min[i+1];
          return (
            <div className="forecast-day" key={d}>
              <div className="forecast-date">
                {new Date(d).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
              </div>
              <div className="forecast-temps">
                <span>H: {Math.round(maxC)}°C / {toF(maxC)}°F</span>
                <span>L: {Math.round(minC)}°C / {toF(minC)}°F</span>
              </div>
            </div>
          );
        })}
      </div>

      <details className="api-logs">
        <summary>Show API Process</summary>
        <ul>
          {logs.map((ln, idx) => (
            <li key={idx}><code>{ln}</code></li>
          ))}
        </ul>
      </details>
    </div>
  );
}




