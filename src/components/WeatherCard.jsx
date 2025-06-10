import React from 'react';

export default function WeatherCard({ data, onRemove }) {
  const { name, country, temperature, windspeed, daily } = data;
  const fahrenheit = (temperature * 9) / 5 + 32;

  
  const daysToShow = daily.time.slice(1, 6);

  return (
    <div className="weather-card">
      <button className="remove-btn" onClick={onRemove} aria-label="Remove card">
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
        {daysToShow.map((day, i) => (
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
    </div>
  );
}


