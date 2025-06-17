// src/SearchBar.jsx
import React, { useState, useEffect, useRef } from 'react'

export default function SearchBar({ onSearch, placeholder }) {
  const [query, setQuery]                     = useState('')
  const [suggestions, setSuggestions]         = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const abortCtrlRef                          = useRef(null)
  const debounceRef                           = useRef(null)

  useEffect(() => {
    if (!query) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      abortCtrlRef.current?.abort()
      const ctrl = new AbortController()
      abortCtrlRef.current = ctrl

      fetch(
        `https://geocoding-api.open-meteo.com/v1/search?` +
        `name=${encodeURIComponent(query)}&count=5&country=US`,
        { signal: ctrl.signal }
      )
        .then(res => res.json())
        .then(json => {
          const rawResults = json.results || []
          const filtered = rawResults.filter(r =>
            r.country_code === 'US' && r.feature_code !== 'ADM1'
          )
          const mapped = filtered.map(r => ({
            display: `${r.name}, ${r.admin1}`,
            raw:     `${r.name}, ${r.admin1}`
          }))
          setSuggestions(mapped)
          setShowSuggestions(mapped.length > 0)
        })
        .catch(() => {
          setSuggestions([])
          setShowSuggestions(false)
        })
    }, 300)

    return () => {
      clearTimeout(debounceRef.current)
      abortCtrlRef.current?.abort()
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

  const canSearch =
    query.trim() !== '' &&
    suggestions.some(s => s.raw === query.trim())

  return (
    <div className="search-bar-wrapper">
      <div className="search-bar">
        <div className="input-wrapper">
          <input
            value={query}
            placeholder={placeholder}
            onChange={e => setQuery(e.target.value)}
            onFocus={() => query && setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          />

          {query && (
            <button
              className="clear-button"
              onMouseDown={clearQuery}
              aria-label="Clear text"
            >
              ×
            </button>
          )}

          {showSuggestions && suggestions.length > 0 && (
            <div className="suggestions-container">
              <button
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

        <button
          className="search-button"
          onClick={() => doSearch(query.trim())}
          disabled={!canSearch}
        >
          Search
        </button>
      </div>
    </div>
  )
}

