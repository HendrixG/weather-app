import React, { useState, useEffect, useRef } from 'react';

export default function SearchBar({ onSearch, placeholder = '', disabled = false }) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef(null);
  const wrapperRef = useRef(null);

  // Fetch suggestions when `query` changes, debounced
  useEffect(() => {
    if (disabled || query.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    setLoading(true);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const url = new URL('https://geocoding-api.open-meteo.com/v1/search');
        url.search = new URLSearchParams({
          name: query.trim(),
          count: 5,
          country_code: 'US'
        }).toString();

        const res = await fetch(url);
        const json = await res.json();
        if (json.results) {
          setSuggestions(
            json.results.map(loc => ({
              name: loc.name,
              region: loc.admin1 || loc.country,
            }))
          );
        } else {
          setSuggestions([]);
        }
      } catch {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(debounceRef.current);
  }, [query, disabled]);

  // Close suggestions on outside click
  useEffect(() => {
    function onClick(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setSuggestions([]);
      }
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const handleSelect = locName => {
    setQuery(locName);
    setSuggestions([]);
    onSearch(locName);
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (!query.trim() || disabled) return;
    setSuggestions([]);
    onSearch(query.trim());
  };

  return (
    <div className="search-bar-wrapper" ref={wrapperRef}>
      <form onSubmit={handleSubmit} className="search-bar">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
        />
        <button type="submit" disabled={disabled}>
          Search
        </button>
      </form>

      {loading && <div className="suggestions"><em>Loading…</em></div>}

      {!loading && suggestions.length > 0 && (
        <ul className="suggestions">
          {suggestions.map((s, i) => (
            <li key={i} onClick={() => handleSelect(s.name)}>
              {s.name}, {s.region}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}


