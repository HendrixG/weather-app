// import React from 'react';

export default function WeatherCard({ data, onRemove }) {
  const { name, country, temperature, windspeed, humidity } = data;

  const fahrenheit = (temperature * 9) / 5 +32;

  return (
    <div className="weather-card">
      <button
        className="remove-btn"
        onClick={onRemove}
        aria-label="Remove card"
      >
        ×
      </button>
      <h2>{name}, {country}</h2>
      <p><strong>Temp:</strong> {Math.round(temperature)}°C / {Math.round(fahrenheit)}°F</p>
      <p><strong>Humidity:</strong> {humidity}%</p>
      <p><strong>Wind:</strong> {windspeed} m/s</p>
    </div>
  );
}

