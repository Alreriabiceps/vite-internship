import React, { useState, useRef, useEffect } from "react";
import { Input } from "./input";

const AutocompleteInput = ({
  value,
  onChange,
  placeholder,
  suggestions = [],
  disabled = false,
  className = "",
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (value && suggestions.length > 0) {
      // Ensure value is a string
      const stringValue =
        typeof value === "string" ? value : String(value || "");

      const filtered = suggestions.filter(
        (suggestion) =>
          suggestion && // Check if suggestion exists
          typeof suggestion === "string" && // Ensure it's a string
          suggestion.toLowerCase().includes(stringValue.toLowerCase()) &&
          suggestion.toLowerCase() !== stringValue.toLowerCase()
      );
      setFilteredSuggestions(filtered.slice(0, 5)); // Show max 5 suggestions
    } else {
      setFilteredSuggestions([]);
    }
  }, [value, suggestions]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        inputRef.current &&
        !inputRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    onChange(newValue);
    setIsOpen(true);
  };

  const handleSuggestionClick = (suggestion) => {
    onChange(suggestion);
    setIsOpen(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <div className="relative">
      <Input
        ref={inputRef}
        value={typeof value === "string" ? value : String(value || "")}
        onChange={handleInputChange}
        onFocus={() => setIsOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className={className}
        {...props}
      />

      {isOpen && filteredSuggestions.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-y-auto"
        >
          {filteredSuggestions.map((suggestion, index) => (
            <div
              key={index}
              className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-100"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              {suggestion}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AutocompleteInput;
