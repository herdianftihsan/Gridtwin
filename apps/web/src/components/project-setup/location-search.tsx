'use client';

import React, { useState, useEffect, useRef } from 'react';
import { apiClient } from '../../lib/api/api-client';

export interface LocationResult {
  id: string;
  name: string;
  province: string;
  administrativeLevel: string;
}

interface LocationSearchProps {
  value: string; // The current value (e.g., 'loc_surabaya' or 'Surabaya')
  onChange: (id: string, name: string) => void;
  error?: string;
}

export function LocationSearch({ value, onChange, error }: LocationSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<LocationResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedName, setSelectedName] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Initialize query if value exists but we don't have a selected name yet
  // This handles edit mode where `value` might be 'Surabaya'
  useEffect(() => {
    if (value && !selectedName) {
      // If it's a legacy string, we just display it
      const displayValue = value.startsWith('loc_') ? value.replace('loc_', '').charAt(0).toUpperCase() + value.replace('loc_', '').slice(1) : value;
      setQuery(displayValue);
      setSelectedName(displayValue);
    }
  }, [value, selectedName]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Explicit Search Execution
  const handleLocationSearch = async (searchQuery: string = query) => {
    if (!searchQuery || searchQuery.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setIsLoading(true);
    try {
      const response = await apiClient.get<LocationResult[]>(
        `/api/locations/search?q=${encodeURIComponent(searchQuery)}`,
        { signal: abortControllerRef.current.signal }
      );
      if (response.data) {
        setResults(response.data);
        setIsOpen(true);
        setHighlightedIndex(-1);
      }
    } catch (err: any) {
      if (err.message?.includes('aborted')) return;
      console.error('Location search failed', err);
    } finally {
      if (abortControllerRef.current && !abortControllerRef.current.signal.aborted) {
        setIsLoading(false);
      }
    }
  };

  // Debounced search
  useEffect(() => {
    if (!query || query === selectedName || query.length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(() => {
      handleLocationSearch(query);
    }, 300);

    return () => {
      clearTimeout(timer);
    };
  }, [query, selectedName]);

  const handleSelect = (loc: LocationResult) => {
    const displayName = `${loc.name}, ${loc.province}`;
    setQuery(displayName);
    setSelectedName(displayName);
    onChange(loc.id, displayName);
    setIsOpen(false);
  };

  const handleClear = () => {
    setQuery('');
    setSelectedName('');
    onChange('', '');
    setIsOpen(false);
    setResults([]);
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // Stop form submission
      if (isOpen && highlightedIndex >= 0 && highlightedIndex < results.length) {
        const item = results[highlightedIndex];
        if (item) handleSelect(item);
      } else if (isOpen && results.length === 1) {
        const item = results[0];
        if (item) handleSelect(item);
      } else {
        handleLocationSearch();
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isOpen) {
        if (results.length > 0) setIsOpen(true);
      } else {
        setHighlightedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev));
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (isOpen) {
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1));
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setHighlightedIndex(-1);
    }
  };

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (selectedName) {
              setSelectedName(''); // Reset selection if typing
              onChange('', ''); // Clear parent validation state
            }
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (results.length > 0) setIsOpen(true);
          }}
          placeholder="Search city, regency, or district..."
          className={`w-full appearance-none pl-3.5 pr-10 py-2.5 rounded-lg border text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all ${
            error ? 'border-red-500' : 'border-slate-200'
          }`}
          role="combobox"
          aria-expanded={isOpen}
          aria-controls="location-options"
          aria-autocomplete="list"
        />
        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center">
          {isLoading ? (
            <span className="w-4 h-4 border-2 border-slate-300 border-t-sky-500 rounded-full animate-spin" />
          ) : query && selectedName ? (
            <button
              type="button"
              onClick={handleClear}
              className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              aria-label="Clear location"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => handleLocationSearch()}
              className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              aria-label="Search location"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {isOpen && results.length > 0 && (
        <ul
          id="location-options"
          className="absolute z-10 w-full mt-1 max-h-60 overflow-auto bg-white border border-slate-200 rounded-lg shadow-lg py-1 text-sm focus:outline-none"
          role="listbox"
        >
          {results.map((loc, index) => (
            <li
              key={loc.id}
              onClick={() => handleSelect(loc)}
              className={`cursor-pointer select-none px-4 py-2 flex flex-col ${
                index === highlightedIndex
                  ? 'bg-slate-50 text-slate-900'
                  : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
              }`}
              role="option"
              aria-selected={value === loc.id}
            >
              <span className="font-medium text-slate-900">{loc.name}</span>
              <span className="text-xs text-slate-500">{loc.administrativeLevel === 'city' ? 'City' : 'Regency'} • {loc.province}</span>
            </li>
          ))}
        </ul>
      )}
      
      {isOpen && query && results.length === 0 && !isLoading && !selectedName && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg py-3 px-4 text-sm text-slate-500 text-center">
          Lokasi tidak ditemukan. Coba nama kota atau kabupaten lain.
        </div>
      )}
    </div>
  );
}
