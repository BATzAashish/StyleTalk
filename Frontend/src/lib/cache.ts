/**
 * Frontend caching utility for tone shift responses
 * Stores responses in localStorage to reduce API calls
 */

import { ToneShiftResponse } from './api';

const CACHE_PREFIX = 'tone_cache_';
const CACHE_VERSION = 'v1';
const MAX_CACHE_SIZE = 100; // Maximum number of cached entries
const CACHE_EXPIRY_DAYS = 30; // Cache entries expire after 30 days

interface CacheEntry {
  key: string;
  response: ToneShiftResponse;
  timestamp: number;
  hitCount: number;
}

/**
 * Generate a cache key from request parameters
 */
function generateCacheKey(text: string, targetTone: string, context?: string): string {
  const normalizedData = {
    text: text.toLowerCase().trim(),
    tone: targetTone.toLowerCase().trim(),
    context: (context || '').toLowerCase().trim(),
  };
  
  // Simple hash function for cache key
  const str = JSON.stringify(normalizedData);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return `${CACHE_PREFIX}${CACHE_VERSION}_${Math.abs(hash)}`;
}

/**
 * Check if cache entry is expired
 */
function isExpired(timestamp: number): boolean {
  const expiryTime = CACHE_EXPIRY_DAYS * 24 * 60 * 60 * 1000; // Convert days to milliseconds
  return Date.now() - timestamp > expiryTime;
}

/**
 * Get cached response
 */
export function getCachedResponse(
  text: string,
  targetTone: string,
  context?: string
): ToneShiftResponse | null {
  try {
    const cacheKey = generateCacheKey(text, targetTone, context);
    const cachedData = localStorage.getItem(cacheKey);
    
    if (!cachedData) {
      return null;
    }
    
    const entry: CacheEntry = JSON.parse(cachedData);
    
    // Check if expired
    if (isExpired(entry.timestamp)) {
      localStorage.removeItem(cacheKey);
      return null;
    }
    
    // Increment hit count
    entry.hitCount++;
    localStorage.setItem(cacheKey, JSON.stringify(entry));
    
    console.log('[CACHE HIT] Using cached response, hits:', entry.hitCount);
    
    // Mark response as cached
    const response = { ...entry.response, cached: true, cache_hit_count: entry.hitCount };
    return response;
  } catch (error) {
    console.error('[CACHE ERROR] Failed to get cached response:', error);
    return null;
  }
}

/**
 * Store response in cache
 */
export function setCachedResponse(
  text: string,
  targetTone: string,
  response: ToneShiftResponse,
  context?: string
): void {
  try {
    const cacheKey = generateCacheKey(text, targetTone, context);
    
    const entry: CacheEntry = {
      key: cacheKey,
      response,
      timestamp: Date.now(),
      hitCount: 0,
    };
    
    localStorage.setItem(cacheKey, JSON.stringify(entry));
    console.log('[CACHE] Stored response in localStorage');
    
    // Clean up old entries if cache is too large
    cleanupCache();
  } catch (error) {
    console.error('[CACHE ERROR] Failed to store response:', error);
  }
}

/**
 * Clear all cached responses
 */
export function clearCache(): number {
  let count = 0;
  const keys = Object.keys(localStorage);
  
  for (const key of keys) {
    if (key.startsWith(CACHE_PREFIX)) {
      localStorage.removeItem(key);
      count++;
    }
  }
  
  console.log(`[CACHE] Cleared ${count} entries`);
  return count;
}

/**
 * Get cache statistics
 */
export function getCacheStats(): {
  totalEntries: number;
  totalHits: number;
  oldestEntry: Date | null;
  newestEntry: Date | null;
} {
  let totalEntries = 0;
  let totalHits = 0;
  let oldestTimestamp: number | null = null;
  let newestTimestamp: number | null = null;
  
  const keys = Object.keys(localStorage);
  
  for (const key of keys) {
    if (key.startsWith(CACHE_PREFIX)) {
      try {
        const entry: CacheEntry = JSON.parse(localStorage.getItem(key) || '');
        totalEntries++;
        totalHits += entry.hitCount;
        
        if (!oldestTimestamp || entry.timestamp < oldestTimestamp) {
          oldestTimestamp = entry.timestamp;
        }
        if (!newestTimestamp || entry.timestamp > newestTimestamp) {
          newestTimestamp = entry.timestamp;
        }
      } catch (error) {
        // Skip invalid entries
      }
    }
  }
  
  return {
    totalEntries,
    totalHits,
    oldestEntry: oldestTimestamp ? new Date(oldestTimestamp) : null,
    newestEntry: newestTimestamp ? new Date(newestTimestamp) : null,
  };
}

/**
 * Clean up old cache entries to maintain size limit
 */
function cleanupCache(): void {
  const keys = Object.keys(localStorage);
  const cacheKeys = keys.filter(key => key.startsWith(CACHE_PREFIX));
  
  if (cacheKeys.length <= MAX_CACHE_SIZE) {
    return;
  }
  
  // Get all cache entries with timestamps
  const entries: Array<{ key: string; timestamp: number; hitCount: number }> = [];
  
  for (const key of cacheKeys) {
    try {
      const entry: CacheEntry = JSON.parse(localStorage.getItem(key) || '');
      entries.push({
        key,
        timestamp: entry.timestamp,
        hitCount: entry.hitCount,
      });
    } catch (error) {
      // Remove invalid entries
      localStorage.removeItem(key);
    }
  }
  
  // Sort by hit count (ascending) then by timestamp (oldest first)
  // This keeps frequently used and recent entries
  entries.sort((a, b) => {
    if (a.hitCount !== b.hitCount) {
      return a.hitCount - b.hitCount;
    }
    return a.timestamp - b.timestamp;
  });
  
  // Remove oldest/least used entries
  const entriesToRemove = entries.length - MAX_CACHE_SIZE;
  for (let i = 0; i < entriesToRemove; i++) {
    localStorage.removeItem(entries[i].key);
  }
  
  console.log(`[CACHE] Cleaned up ${entriesToRemove} old entries`);
}

/**
 * Clean up expired entries
 */
export function cleanupExpiredEntries(): number {
  let count = 0;
  const keys = Object.keys(localStorage);
  
  for (const key of keys) {
    if (key.startsWith(CACHE_PREFIX)) {
      try {
        const entry: CacheEntry = JSON.parse(localStorage.getItem(key) || '');
        if (isExpired(entry.timestamp)) {
          localStorage.removeItem(key);
          count++;
        }
      } catch (error) {
        // Remove invalid entries
        localStorage.removeItem(key);
        count++;
      }
    }
  }
  
  console.log(`[CACHE] Cleaned up ${count} expired entries`);
  return count;
}
