"use client";

import { useState, useRef, useEffect } from "react";
import { searchCities, US_CITIES } from "@/lib/cities";

interface CityAutocompleteProps {
  value: string;
  onChange: (city: string, isCustom: boolean) => void;
}

export default function CityAutocomplete({
  value,
  onChange,
}: CityAutocompleteProps) {
  const [query, setQuery] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const results = query.trim() ? searchCities(query) : [];
  const showDropdown = isOpen && query.trim().length > 0 && !isCustomMode;

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightIndex >= 0 && listRef.current) {
      const item = listRef.current.children[highlightIndex] as HTMLElement;
      item?.scrollIntoView({ block: "nearest" });
    }
  }, [highlightIndex]);

  function selectCity(city: string) {
    setQuery(city);
    setIsOpen(false);
    setHighlightIndex(-1);
    onChange(city, false);
  }

  function handleCustomMode() {
    setIsCustomMode(true);
    setIsOpen(false);
    setQuery("");
    setHighlightIndex(-1);
    // Focus input after state update
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  function handleBackToSearch() {
    setIsCustomMode(false);
    setQuery("");
    onChange("", false);
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  function handleInputChange(val: string) {
    setQuery(val);
    setIsOpen(true);
    setHighlightIndex(-1);
    if (isCustomMode) {
      onChange(val, true);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!showDropdown) return;

    const totalItems = results.length + 1; // +1 for "My city isn't listed"

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIndex((i) => (i + 1) % totalItems);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex((i) => (i - 1 + totalItems) % totalItems);
    } else if (e.key === "Enter" && highlightIndex >= 0) {
      e.preventDefault();
      if (highlightIndex < results.length) {
        selectCity(results[highlightIndex]);
      } else {
        handleCustomMode();
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
      setHighlightIndex(-1);
    }
  }

  // Check if current value is from the list (to show selected state)
  const isFromList = US_CITIES.includes(value as typeof US_CITIES[number]);

  return (
    <div ref={containerRef} className="relative">
      {isCustomMode && (
        <button
          type="button"
          onClick={handleBackToSearch}
          className="text-xs text-coral font-medium mb-1.5 hover:underline"
        >
          &larr; Back to city search
        </button>
      )}
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => handleInputChange(e.target.value)}
        onFocus={() => !isCustomMode && setIsOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder={
          isCustomMode ? "Type your city name..." : "Start typing your city..."
        }
        autoComplete="off"
        className="w-full px-4 py-3.5 rounded-xl bg-white border border-navy/10 text-navy placeholder:text-navy/30 focus:outline-none focus:border-coral focus:ring-1 focus:ring-coral transition-colors"
      />
      {isFromList && !isOpen && !isCustomMode && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500 text-sm pointer-events-none">
          ✓
        </div>
      )}
      {showDropdown && (
        <ul
          ref={listRef}
          className="absolute z-50 w-full mt-1 bg-white border border-navy/10 rounded-xl shadow-lg max-h-60 overflow-y-auto"
          role="listbox"
        >
          {results.length === 0 ? (
            <li className="px-4 py-3 text-navy/40 text-sm">
              No matching cities
            </li>
          ) : (
            results.slice(0, 8).map((city, i) => (
              <li
                key={city}
                role="option"
                aria-selected={highlightIndex === i}
                onClick={() => selectCity(city)}
                className={`px-4 py-3 text-navy cursor-pointer transition-colors text-[15px] ${
                  highlightIndex === i
                    ? "bg-coral/10 text-coral"
                    : "hover:bg-navy/5"
                } ${i === 0 ? "rounded-t-xl" : ""}`}
              >
                {city}
              </li>
            ))
          )}
          <li
            role="option"
            aria-selected={highlightIndex === results.length}
            onClick={handleCustomMode}
            className={`px-4 py-3 text-navy/50 cursor-pointer border-t border-navy/5 text-sm font-medium transition-colors rounded-b-xl ${
              highlightIndex === results.length
                ? "bg-coral/10 text-coral"
                : "hover:bg-navy/5"
            }`}
          >
            My city isn&apos;t listed
          </li>
        </ul>
      )}
    </div>
  );
}
