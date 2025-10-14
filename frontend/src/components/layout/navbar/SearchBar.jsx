import React, { useState, useCallback } from 'react';
import { Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn, debounce } from '../../../lib/utils';

/**
 * Search Bar Component
 * Global search functionality with suggestions
 */
const SearchBar = () => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (searchQuery) => {
      if (!searchQuery.trim()) {
        setSuggestions([]);
        return;
      }

      setIsLoading(true);
      try {
        // TODO: Implement actual search API call
        // const results = await searchAPI(searchQuery);
        // setSuggestions(results);
        
        // Mock suggestions for now
        const mockSuggestions = [
          { id: 1, type: 'employee', name: 'John Doe', subtitle: 'Software Engineer' },
          { id: 2, type: 'department', name: 'Engineering', subtitle: 'Department' },
          { id: 3, type: 'employee', name: 'Jane Smith', subtitle: 'HR Manager' },
        ].filter(item => 
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.subtitle.toLowerCase().includes(searchQuery.toLowerCase())
        );
        
        setSuggestions(mockSuggestions);
      } catch (error) {
        console.error('Search error:', error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 300),
    []
  );

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    debouncedSearch(value);
  };

  const handleClear = () => {
    setQuery('');
    setSuggestions([]);
  };

  const handleSuggestionClick = (suggestion) => {
    setQuery('');
    setSuggestions([]);
    // TODO: Navigate to suggestion
    console.log('Navigate to:', suggestion);
  };

  return (
    <div className="flex-1 max-w-2xl mx-4 relative">
      <div className="relative">
        <Search className={cn(
          'absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 transition-colors',
          isFocused ? 'text-blue-500' : 'text-gray-400'
        )} />
        
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          placeholder="Search employees, departments, or anything..."
          className={cn(
            'w-full pl-10 pr-10 py-2.5',
            'border border-gray-300 rounded-xl',
            'focus:ring-2 focus:ring-blue-500 focus:border-transparent',
            'transition-all duration-200',
            'bg-gray-50 focus:bg-white',
            'text-sm placeholder-gray-500'
          )}
        />
        
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-md hover:bg-gray-100 transition-colors"
          >
            <X className="h-3 w-3 text-gray-400" />
          </button>
        )}
      </div>

      {/* Search Suggestions */}
      <AnimatePresence>
        {isFocused && (suggestions.length > 0 || isLoading) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50"
          >
            {isLoading ? (
              <div className="px-4 py-3 text-sm text-gray-500 text-center">
                Searching...
              </div>
            ) : (
              <>
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion.id}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <span className="text-xs font-medium text-blue-600">
                          {suggestion.type === 'employee' ? 'E' : 'D'}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {suggestion.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {suggestion.subtitle}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
                
                {suggestions.length === 0 && query && (
                  <div className="px-4 py-3 text-sm text-gray-500 text-center">
                    No results found for "{query}"
                  </div>
                )}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchBar;
