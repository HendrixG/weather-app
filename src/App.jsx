import React, { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';
import SearchBar from './components/SearchBar';
import WeatherCard from './components/WeatherCard';
import './App.css';

function App() {
  const [weatherDataList, setWeatherDataList] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    document.body.classList.toggle('dark', darkMode);
  }, [darkMode]);

  async function geocodeCity(city) {
    const res = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`
    );
    const json = await res.json();
    if (!json.results?.length) {
      throw new Error("Location not found");
    }
    const { latitude, longitude, name, country } = json.results[0];
    return { latitude, longitude, name, country };
  }

  async function fetchWeather(city) {
    setLoading(true);
    setError('');
    try {
      const { latitude, longitude, name, country } = await geocodeCity(city);
      const url = new URL("https://api.open-meteo.com/v1/forecast");
      url.search = new URLSearchParams({
        latitude,
        longitude,
        current_weather: "true",
        hourly: "relativehumidity_2m",
        timezone: "auto"
      }).toString();

      const res = await fetch(url);
      if (!res.ok) throw new Error("Weather data unavailable");
      const { current_weather, hourly } = await res.json();
      const { temperature, windspeed, time } = current_weather;
      const idx = hourly.time.findIndex(t => t === time);
      const humidity =
        idx >= 0
          ? hourly.relativehumidity_2m[idx]
          : null;

      setWeatherDataList(prev => {
        const next = [
          ...prev,
          { name, country, temperature, windspeed, humidity, id: Date.now() }
        ];
        return next.length > 5 ? next.slice(next.length - 5) : next;
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleRemove(id) {
    setWeatherDataList(prev => prev.filter(card => card.id !== id));
  }

  return (
    <div className="app-container">
      <div className="app-inner">
        <button
          className="theme-toggle"
          onClick={() => setDarkMode(d => !d)}
          aria-label="Toggle dark mode"
        >
          {darkMode ? <Sun size={40} /> : <Moon size={40} color="#000" />}
        </button>

        <h1>Hendrix's Weather App</h1>

        <SearchBar
          onSearch={fetchWeather}
          placeholder={weatherDataList.length < 10 ? "Enter city name…" : "Max 5 reached"}
          disabled={weatherDataList.length >= 10}
        />

        {loading && <p>Loading…</p>}
        {error && <p className="error">{error}</p>}
      </div>

      <div className="cards-container">
        {weatherDataList.map(card => (
          <WeatherCard
            key={card.id}
            data={card}
            onRemove={() => handleRemove(card.id)}
          />
        ))}
      </div>
    </div>
  );
}

export default App;



