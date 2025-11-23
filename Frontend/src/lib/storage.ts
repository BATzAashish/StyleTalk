/**
 * Local Storage Service for User Preferences
 * Handles both guest users (localStorage) and authenticated users (API sync)
 */

export interface UserPreferences {
  default_tone: string;
  default_language: string;
  privacy_mode: 'local' | 'cloud';
  theme: 'dark' | 'light';
  enable_cache: boolean;
  enable_emojis: boolean;
  enable_gifs: boolean;
  grammar_correction: boolean;
  rephrasing: boolean;
  translation: boolean;
  relationship_default: string;
}

const STORAGE_KEYS = {
  PREFERENCES: 'styletalk_preferences',
  HISTORY: 'styletalk_history',
  FAVORITES: 'styletalk_favorites',
};

// Default preferences
export const DEFAULT_PREFERENCES: UserPreferences = {
  default_tone: 'neutral',
  default_language: 'en',
  privacy_mode: 'cloud',
  theme: 'dark',
  enable_cache: true,
  enable_emojis: true,
  enable_gifs: true,
  grammar_correction: true,
  rephrasing: true,
  translation: false,
  relationship_default: 'auto',
};

/**
 * Get user preferences from localStorage
 */
export const getPreferences = (): UserPreferences => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.PREFERENCES);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Merge with defaults to ensure all keys exist
      return { ...DEFAULT_PREFERENCES, ...parsed };
    }
  } catch (error) {
    console.error('[Storage] Error reading preferences:', error);
  }
  return DEFAULT_PREFERENCES;
};

/**
 * Save user preferences to localStorage
 */
export const savePreferences = (preferences: Partial<UserPreferences>): void => {
  try {
    const current = getPreferences();
    const updated = { ...current, ...preferences };
    localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(updated));
    console.log('[Storage] Preferences saved:', updated);
    
    // Dispatch custom event for preference changes
    window.dispatchEvent(new CustomEvent('preferences-updated', { detail: updated }));
  } catch (error) {
    console.error('[Storage] Error saving preferences:', error);
  }
};

/**
 * Reset preferences to default
 */
export const resetPreferences = (): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(DEFAULT_PREFERENCES));
    window.dispatchEvent(new CustomEvent('preferences-updated', { detail: DEFAULT_PREFERENCES }));
    console.log('[Storage] Preferences reset to default');
  } catch (error) {
    console.error('[Storage] Error resetting preferences:', error);
  }
};

/**
 * Get conversation history from localStorage
 */
export const getHistory = (): any[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.HISTORY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('[Storage] Error reading history:', error);
    return [];
  }
};

/**
 * Save conversation to history
 */
export const saveToHistory = (entry: any): void => {
  try {
    const history = getHistory();
    const newEntry = {
      ...entry,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      is_favorite: false,
    };
    
    // Keep only last 100 entries
    const updated = [newEntry, ...history].slice(0, 100);
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(updated));
    console.log('[Storage] Entry saved to history');
  } catch (error) {
    console.error('[Storage] Error saving to history:', error);
  }
};

/**
 * Toggle favorite status of a history entry
 */
export const toggleFavorite = (entryId: string): void => {
  try {
    const history = getHistory();
    const updated = history.map(entry => 
      entry.id === entryId 
        ? { ...entry, is_favorite: !entry.is_favorite }
        : entry
    );
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(updated));
    console.log('[Storage] Favorite toggled for entry:', entryId);
  } catch (error) {
    console.error('[Storage] Error toggling favorite:', error);
  }
};

/**
 * Get favorite entries
 */
export const getFavorites = (): any[] => {
  try {
    const history = getHistory();
    return history.filter(entry => entry.is_favorite);
  } catch (error) {
    console.error('[Storage] Error getting favorites:', error);
    return [];
  }
};

/**
 * Delete history entry
 */
export const deleteHistoryEntry = (entryId: string): void => {
  try {
    const history = getHistory();
    const updated = history.filter(entry => entry.id !== entryId);
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(updated));
    console.log('[Storage] History entry deleted:', entryId);
  } catch (error) {
    console.error('[Storage] Error deleting history entry:', error);
  }
};

/**
 * Clear all history (optionally keep favorites)
 */
export const clearHistory = (keepFavorites: boolean = true): void => {
  try {
    if (keepFavorites) {
      const history = getHistory();
      const favorites = history.filter(entry => entry.is_favorite);
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(favorites));
      console.log('[Storage] History cleared, kept favorites');
    } else {
      localStorage.removeItem(STORAGE_KEYS.HISTORY);
      console.log('[Storage] All history cleared');
    }
  } catch (error) {
    console.error('[Storage] Error clearing history:', error);
  }
};

/**
 * Search history
 */
export const searchHistory = (query: string): any[] => {
  try {
    const history = getHistory();
    const lowerQuery = query.toLowerCase();
    return history.filter(entry => 
      entry.input_text?.toLowerCase().includes(lowerQuery) ||
      entry.results?.some((r: any) => r.content?.toLowerCase().includes(lowerQuery))
    );
  } catch (error) {
    console.error('[Storage] Error searching history:', error);
    return [];
  }
};

/**
 * Export all user data
 */
export const exportUserData = (): string => {
  try {
    const data = {
      preferences: getPreferences(),
      history: getHistory(),
      exported_at: new Date().toISOString(),
    };
    return JSON.stringify(data, null, 2);
  } catch (error) {
    console.error('[Storage] Error exporting data:', error);
    return '{}';
  }
};

/**
 * Clear all user data
 */
export const clearAllData = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEYS.PREFERENCES);
    localStorage.removeItem(STORAGE_KEYS.HISTORY);
    localStorage.removeItem(STORAGE_KEYS.FAVORITES);
    console.log('[Storage] All user data cleared');
  } catch (error) {
    console.error('[Storage] Error clearing all data:', error);
  }
};
