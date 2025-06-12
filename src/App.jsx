// src/App.jsx
import React, { useState, useEffect } from 'react';
import SearchBar from './components/SearchBar';
import WeatherCard from './components/WeatherCard';
import ChessGame from './components/ChessGame';
import './App.css';

function App() {
  const [currentTab, setCurrentTab] = useState('weather');

  // Weather state (single card)
  const [weatherData, setWeatherData]   = useState(null);
  const [weatherError, setWeatherError] = useState('');
  const [weatherLoading, setWeatherLoading] = useState(false);

  // Chess state
  const [gameStarted, setGameStarted] = useState(false);
  const [whiteTime, setWhiteTime]     = useState(0);
  const [blackTime, setBlackTime]     = useState(0);
  const [isWhiteTurn, setIsWhiteTurn] = useState(true);
  const [chessMoves, setChessMoves]   = useState([]);
  const [isCheck, setIsCheck]         = useState(false);

  // Chess clock
  useEffect(() => {
    if (!gameStarted) return;
    const interval = setInterval(() => {
      if (isWhiteTurn) setWhiteTime(t => t + 1);
      else setBlackTime(t => t + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [gameStarted, isWhiteTurn]);

  const handleMoveUpdate = (moves, inCheck) => {
    setChessMoves(moves);
    setIsCheck(inCheck);
  };
  const resetChess = () => {
    setGameStarted(false);
    setChessMoves([]);
    setIsCheck(false);
    setWhiteTime(0);
    setBlackTime(0);
    setIsWhiteTurn(true);
  };

  // Fetch weather + logs + US-only
  async function fetchWeather(city) {
    setWeatherLoading(true);
    setWeatherError('');
    try {
      const logs = [];

      // Geocode
      const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
        city
      )}&count=1`;
      logs.push(`🔍 Geocode Request: ${geoUrl}`);
      const geoRes = await fetch(geoUrl);
      const geoJson = await geoRes.json();
      logs.push(`🔍 Geocode Response: ${JSON.stringify(geoJson)}`);

      const loc = geoJson.results?.[0];
      if (!loc) throw new Error('Location not found');
      const { latitude, longitude, name, country, country_code } = loc;
      if (country_code !== 'US') {
        throw new Error('Please enter a location in the United States');
      }

      // Forecast
      const url = new URL('https://api.open-meteo.com/v1/forecast');
      url.search = new URLSearchParams({
        latitude,
        longitude,
        current_weather: 'true',
        daily: 'temperature_2m_max,temperature_2m_min',
        timezone: 'auto'
      }).toString();
      logs.push(`☁️ Forecast Request: ${url}`);
      const res = await fetch(url);
      const json = await res.json();
      logs.push(`☁️ Forecast Response: ${JSON.stringify(json)}`);

      if (!res.ok) throw new Error('Weather data unavailable');

      const {
        current_weather: { temperature, windspeed },
        daily
      } = json;

      setWeatherData({
        id: Date.now(),
        name,
        country,
        temperature,
        windspeed,
        daily,
        logs
      });
    } catch (err) {
      setWeatherError(err.message);
      setWeatherData(null);
    } finally {
      setWeatherLoading(false);
    }
  }

  const clearWeather = () => {
    setWeatherData(null);
    setWeatherError('');
  };

  return (
    <div className="app-container">
      {/* Tabs */}
      <nav className="tabs">
        <button
          className={currentTab === 'weather' ? 'tab active' : 'tab'}
          onClick={() => setCurrentTab('weather')}
        >
          Weather
        </button>
        <button
          className={currentTab === 'chess' ? 'tab active' : 'tab'}
          onClick={() => setCurrentTab('chess')}
        >
          Chess
        </button>
      </nav>

      {/* WEATHER VIEW */}
      {currentTab === 'weather' && (
        <>
          <div className="app-inner">
            <h1>Weather App</h1>
            <SearchBar
              onSearch={fetchWeather}
              placeholder="Enter U.S. city…"
            />
            {weatherLoading && <p>Loading…</p>}
            {weatherError && <p className="error">{weatherError}</p>}
          </div>
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
      {currentTab === 'chess' && (
        <div className="app-inner">
          <h1>Chess Game</h1>

          {!gameStarted ? (
            <button
              className="btn btn-primary"
              onClick={() => setGameStarted(true)}
            >
              Start Game
            </button>
          ) : (
            <button
              className="btn btn-outline btn-error"
              onClick={resetChess}
            >
              End Game / Reset
            </button>
          )}

          <div className="chess-layout">
            <div className={gameStarted ? 'chess-area' : 'chess-area disabled'}>
              {isCheck && (
                <div className="check-alert">
                  ♟ Check! The king is in check!
                </div>
              )}
              <ChessGame
                moves={chessMoves}
                onMoveUpdate={handleMoveUpdate}
                onTurnChange={setIsWhiteTurn}
              />
            </div>

            {gameStarted && (
              <div className="move-history">
                <div className="timers">
                  <span>♟ White Time: {whiteTime}s</span>
                  <span>♙ Black Time: {blackTime}s</span>  
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
                    {Array.from({ length: Math.ceil(chessMoves.length / 2) }).map((_, i) => (
                      <tr key={i}>
                        <td>{i + 1}</td>
                        <td>{chessMoves[2 * i] || ''}</td>
                        <td>{chessMoves[2 * i + 1] || ''}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;








