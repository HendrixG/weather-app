import React, { useState } from 'react';

export default function SearchBar({
  onSearch,
  placeholder = '',
  disabled = false
}) {
  const [query, setQuery] = useState('');

  const handleSubmit = e => {
    e.preventDefault();
    if (!query.trim() || disabled) return;
    onSearch(query.trim());
    setQuery('');
  };

  return (
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
  );
}

