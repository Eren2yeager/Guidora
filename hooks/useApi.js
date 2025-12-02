'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Simple in-memory cache for API responses
 */
const cache = new Map();

/**
 * Get cached data if not expired
 * @param {string} key - Cache key
 * @param {number} maxAge - Max age in milliseconds
 * @returns {*} - Cached data or null
 */
function getCachedData(key, maxAge) {
  const cached = cache.get(key);
  if (!cached) return null;
  
  const isExpired = Date.now() - cached.timestamp > maxAge;
  if (isExpired) {
    cache.delete(key);
    return null;
  }
  
  return cached.data;
}

/**
 * Set cache data
 * @param {string} key - Cache key
 * @param {*} data - Data to cache
 */
function setCacheData(key, data) {
  cache.set(key, {
    data,
    timestamp: Date.now(),
  });
}

/**
 * Clear cache entry
 * @param {string} key - Cache key (optional, clears all if not provided)
 */
export function clearCache(key) {
  if (key) {
    cache.delete(key);
  } else {
    cache.clear();
  }
}

/**
 * useApi Hook
 * Fetches data from an API endpoint with loading, error states, and caching
 * 
 * @param {string} url - API endpoint URL
 * @param {Object} options - Hook options
 * @param {boolean} options.immediate - Fetch immediately on mount (default: true)
 * @param {boolean} options.cache - Enable caching (default: false)
 * @param {number} options.cacheTime - Cache duration in ms (default: 5 minutes)
 * @param {Object} options.fetchOptions - Options to pass to fetch
 * @param {Function} options.onSuccess - Callback on successful fetch
 * @param {Function} options.onError - Callback on error
 * @returns {Object} - { data, loading, error, refetch, mutate }
 */
export default function useApi(url, options = {}) {
  const {
    immediate = true,
    cache: enableCache = false,
    cacheTime = 5 * 60 * 1000, // 5 minutes
    fetchOptions = {},
    onSuccess,
    onError,
  } = options;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);
  
  // Ref to track if component is mounted
  const mountedRef = useRef(true);
  // Ref to store abort controller
  const abortControllerRef = useRef(null);

  /**
   * Fetch data from the API
   */
  const fetchData = useCallback(async (fetchUrl = url, skipCache = false) => {
    if (!fetchUrl) return;

    // Check cache first
    if (enableCache && !skipCache) {
      const cachedData = getCachedData(fetchUrl, cacheTime);
      if (cachedData) {
        setData(cachedData);
        setLoading(false);
        return cachedData;
      }
    }

    // Cancel any pending request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(fetchUrl, {
        ...fetchOptions,
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      // Only update state if component is still mounted
      if (mountedRef.current) {
        setData(result);
        setLoading(false);
        
        // Cache the result
        if (enableCache) {
          setCacheData(fetchUrl, result);
        }

        // Call success callback
        onSuccess?.(result);
      }

      return result;
    } catch (err) {
      // Ignore abort errors
      if (err.name === 'AbortError') {
        return;
      }

      // Only update state if component is still mounted
      if (mountedRef.current) {
        const errorObj = {
          message: err.message || 'An error occurred',
          code: 'FETCH_ERROR',
        };
        setError(errorObj);
        setLoading(false);

        // Call error callback
        onError?.(errorObj);
      }

      throw err;
    }
  }, [url, enableCache, cacheTime, fetchOptions, onSuccess, onError]);

  /**
   * Refetch data (bypasses cache)
   */
  const refetch = useCallback(() => {
    return fetchData(url, true);
  }, [fetchData, url]);

  /**
   * Manually update the data (optimistic updates)
   */
  const mutate = useCallback((newData) => {
    setData(newData);
    if (enableCache && url) {
      setCacheData(url, newData);
    }
  }, [enableCache, url]);

  // Fetch on mount if immediate is true
  useEffect(() => {
    if (immediate && url) {
      fetchData();
    }
  }, [immediate, url, fetchData]);

  // Cleanup on unmount
  useEffect(() => {
    mountedRef.current = true;
    
    return () => {
      mountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    data,
    loading,
    error,
    refetch,
    mutate,
    isLoading: loading,
    isError: !!error,
  };
}

/**
 * useMutation Hook
 * For POST/PUT/DELETE operations
 * 
 * @param {string} url - API endpoint URL
 * @param {Object} options - Hook options
 * @returns {Object} - { mutate, loading, error, data, reset }
 */
export function useMutation(url, options = {}) {
  const {
    method = 'POST',
    onSuccess,
    onError,
  } = options;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const mutate = useCallback(async (body, mutateOptions = {}) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(mutateOptions.url || url, {
        method: mutateOptions.method || method,
        headers: {
          'Content-Type': 'application/json',
          ...mutateOptions.headers,
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setData(result);
      setLoading(false);
      onSuccess?.(result);
      return result;
    } catch (err) {
      const errorObj = {
        message: err.message || 'An error occurred',
        code: 'MUTATION_ERROR',
      };
      setError(errorObj);
      setLoading(false);
      onError?.(errorObj);
      throw err;
    }
  }, [url, method, onSuccess, onError]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    mutate,
    loading,
    error,
    data,
    reset,
    isLoading: loading,
    isError: !!error,
  };
}
