/**
 * MaterialSearch Component
 * Search materials with debounce + filter by type
 */

import React, { useState } from "react";
import type { MaterialType } from "../types/Material";
import { useMaterialSearch } from "../hooks";
import "./MaterialSearch.css";

interface MaterialSearchProps {
  onResultSelect?: (resultId: string) => void;
}

const MATERIAL_TYPES: MaterialType[] = [
  "API",
  "Excipient",
  "Dietary Supplement",
  "Container",
  "Closure",
  "Process Chemical",
  "Testing Material",
];

export const MaterialSearch: React.FC<MaterialSearchProps> = ({
  onResultSelect,
}) => {
  const [inputValue, setInputValue] = useState("");
  const {
    results,
    total,
    loading,
    error,
    search,
    filterByType,
    clear,
    hasNextPage,
    hasPreviousPage,
    nextPage,
    previousPage,
    page,
    limit,
  } = useMaterialSearch(500);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    if (value.trim().length >= 2) {
      search(value);
    } else if (value.trim().length === 0) {
      clear();
    }
  };

  const handleTypeFilter = (type: MaterialType) => {
    setInputValue("");
    filterByType(type);
  };

  const handleClear = () => {
    setInputValue("");
    clear();
  };

  const handleResultClick = (resultId: string) => {
    if (onResultSelect) {
      onResultSelect(resultId);
    }
  };

  const hasResults = results.length > 0;
  const isSearching =
    inputValue.trim().length >= 2 ||
    (total > 0 && results.length === 0 && loading);

  return (
    <div className="material-search">
      <div className="search-box">
        <div className="search-input-container">
          <input
            type="text"
            placeholder="Search by name, ID, or part number... (min 2 chars)"
            value={inputValue}
            onChange={handleSearchChange}
            className="search-input"
            autoComplete="off"
          />
          {inputValue && (
            <button
              className="btn-clear"
              onClick={handleClear}
              title="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        <div className="type-filter">
          <button
            className={`type-btn ${inputValue === "" && total === 0 ? "active" : ""}`}
            onClick={handleClear}
            title="Show all types"
          >
            All Types
          </button>
          {MATERIAL_TYPES.map((type) => (
            <button
              key={type}
              className="type-btn"
              onClick={() => handleTypeFilter(type)}
              title={`Filter by ${type}`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="search-error">
          <p>Search failed: {error.message}</p>
        </div>
      )}

      {isSearching && loading && !hasResults && (
        <div className="search-loading">
          <p>Searching...</p>
        </div>
      )}

      {hasResults && (
        <div className="search-results">
          <div className="results-header">
            <h3>Search Results</h3>
            <span className="result-count">
              {total} result{total !== 1 ? "s" : ""} found
            </span>
          </div>

          <div className="results-list">
            {results.map((material) => (
              <div
                key={material._id}
                className="result-item"
                onClick={() => handleResultClick(material._id)}
              >
                <div className="result-main">
                  <div className="result-id">
                    <code>{material.material_id}</code>
                  </div>
                  <div className="result-details">
                    <p className="result-name">{material.material_name}</p>
                    <p className="result-secondary">
                      Part: <strong>{material.part_number}</strong>
                    </p>
                  </div>
                </div>
                <div className="result-side">
                  <span className="result-type-badge">
                    {material.material_type}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {(hasNextPage || hasPreviousPage) && (
            <div className="results-pagination">
              <button
                onClick={previousPage}
                disabled={!hasPreviousPage || loading}
              >
                ← Previous
              </button>
              <span className="result-page-info">
                Page {page} ({Math.min(limit, results.length)} of {total})
              </span>
              <button onClick={nextPage} disabled={!hasNextPage || loading}>
                Next →
              </button>
            </div>
          )}
        </div>
      )}

      {inputValue === "" && total === 0 && !loading && !error && (
        <div className="search-empty">
          <p>Enter a search query or select a type to begin</p>
        </div>
      )}
    </div>
  );
};

export default MaterialSearch;
