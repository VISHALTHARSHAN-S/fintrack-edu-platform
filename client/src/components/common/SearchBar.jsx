import React, { useState } from 'react';
import { Search, X } from 'lucide-react';

const SearchBar = ({
  placeholder = 'Search courses, mentors, skills...',
  value,
  onChange,
  onSearch,
  className = '',
}) => {
  const [query, setQuery] = useState(value || '');

  const handleChange = (e) => {
    setQuery(e.target.value);
    if (onChange) onChange(e.target.value);
  };

  const handleClear = () => {
    setQuery('');
    if (onChange) onChange('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) onSearch(query);
  };

  return (
    <form onSubmit={handleSubmit} className={`relative w-full max-w-md ${className}`}>
      <div className="relative flex items-center">
        <Search className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={handleChange}
          placeholder={placeholder}
          className="w-full pl-10 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-full text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-100 transition-all duration-200"
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 p-1 text-slate-400 hover:text-slate-600 rounded-full"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </form>
  );
};

export default SearchBar;
