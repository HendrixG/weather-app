// src/components/SearchBar.jsx
import React, { useState, useEffect, useRef } from 'react'

export default function SearchBar({ onSearch, placeholder }) {
  const [query, setQuery]                     = useState('')
  const [suggestions, setSuggestions]         = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const abortCtrlRef                          = useRef(null)
  const debounceRef                           = useRef(null)

  // Debounced fetch for U.S. cities
  useEffect(() => {
    if (!query) {
      setSuggestions([])
      return
    }
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      if (abortCtrlRef.current) abortCtrlRef.current.abort()
      const ctrl = new AbortController()
      abortCtrlRef.current = ctrl

      fetch(
        `https://geocoding-api.open-meteo.com/v1/search?` +
        `name=${encodeURIComponent(query)}&count=5&country=US`,
        { signal: ctrl.signal }
      )
        .then(res => res.json())
        .then(json => {
          const results = json.results || []
          setSuggestions(
            results.map(r => ({
              display: `${r.name}, ${r.admin1}`,
              raw: r.name
            }))
          )
          setShowSuggestions(results.length > 0)
        })
        .catch(() => {
          setSuggestions([])
        })
    }, 300)
    return () => {
      clearTimeout(debounceRef.current)
      if (abortCtrlRef.current) abortCtrlRef.current.abort()
    }
  }, [query])

  const doSearch = val => {
    setQuery(val)
    setShowSuggestions(false)
    onSearch(val)
  }

  const clearQuery = () => {
    setQuery('')
    setSuggestions([])
    setShowSuggestions(false)
  }

  return (
    <div className="search-bar-wrapper">
      <div className="search-bar">
        <div className="input-wrapper">
          <input
            type="text"
            value={query}
            placeholder={placeholder}
            onChange={e => setQuery(e.target.value)}
            onFocus={() => query && setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          />
          {query && (
            <button
              type="button"
              className="clear-button"
              onMouseDown={clearQuery}
              aria-label="Clear text"
            >
              ×
            </button>
          )}
        </div>

        <button
          type="button"
          className="search-button"
          onClick={() => doSearch(query.trim())}
          disabled={!query.trim()}
        >
          Search
        </button>
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div className="suggestions-container">
          <button
            type="button"
            className="suggestions-close"
            onMouseDown={() => setShowSuggestions(false)}
            aria-label="Close suggestions"
          >
            ×
          </button>
          <ul className="suggestions">
            {suggestions.map((loc, i) => (
              <li key={i} onMouseDown={() => doSearch(loc.raw)}>
                {loc.display}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}






