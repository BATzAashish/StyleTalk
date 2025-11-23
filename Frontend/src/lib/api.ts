// API configuration and axios instance
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

interface AuthResponse {
  message: string;
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
  };
}

interface ErrorResponse {
  error: string;
}

// Helper function to make API calls
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('authToken');
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'An error occurred');
  }

  return data as T;
}

// Auth API functions
export const authAPI = {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const data = await apiCall<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    // Store token in localStorage
    if (data.token) {
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    
    return data;
  },

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const data = await apiCall<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    // Store token in localStorage
    if (data.token) {
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    
    return data;
  },

  async getCurrentUser() {
    const data = await apiCall<{ user: AuthResponse['user'] }>('/api/auth/me', {
      method: 'GET',
    });
    return data.user;
  },

  logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  },

  getToken(): string | null {
    return localStorage.getItem('authToken');
  },

  getStoredUser(): AuthResponse['user'] | null {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },
};

// Health check
export const healthCheck = async (): Promise<{ status: string; message: string }> => {
  return apiCall('/health');
};

// Tone Shifting API
export interface ToneShiftRequest {
  text: string;
  target_tone: string;
  context?: string;
  preserve_meaning?: boolean;
  temperature?: number;
}

export interface ToneShiftResponse {
  success: boolean;
  original_text: string;
  transformed_text: string;
  target_tone: string;
  tone_description: string;
  model_used: string;
  cached?: boolean;
  cache_hit_count?: number;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  error?: string;
}

export interface AvailableTonesResponse {
  success: boolean;
  tones: Record<string, string>;
  total: number;
}

export const toneAPI = {
  /**
   * Shift text tone using Groq AI (with caching)
   */
  async shiftTone(request: ToneShiftRequest, useCache: boolean = true): Promise<ToneShiftResponse> {
    // Check frontend cache first if enabled
    if (useCache) {
      const { getCachedResponse, setCachedResponse } = await import('./cache');
      const cached = getCachedResponse(request.text, request.target_tone, request.context);
      if (cached) {
        return cached;
      }
    }

    // Make API call (backend will also check its cache)
    const response = await apiCall<ToneShiftResponse>('/api/tone/shift', {
      method: 'POST',
      body: JSON.stringify({ ...request, use_cache: useCache }),
    });

    // Store in frontend cache if enabled and successful
    if (useCache && response.success && !response.cached) {
      const { setCachedResponse } = await import('./cache');
      setCachedResponse(request.text, request.target_tone, response, request.context);
    }

    return response;
  },

  /**
   * Quick tone shift without authentication (with caching)
   */
  async quickShift(request: ToneShiftRequest, useCache: boolean = true): Promise<ToneShiftResponse> {
    // Check frontend cache first if enabled
    if (useCache) {
      const { getCachedResponse, setCachedResponse } = await import('./cache');
      const cached = getCachedResponse(request.text, request.target_tone, request.context);
      if (cached) {
        return cached;
      }
    }

    const response = await fetch(`${API_URL}/api/tone/quick-shift`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...request, use_cache: useCache }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Tone shift failed');
    }

    // Store in frontend cache if enabled and successful
    if (useCache && data.success && !data.cached) {
      const { setCachedResponse } = await import('./cache');
      setCachedResponse(request.text, request.target_tone, data, request.context);
    }

    return data as ToneShiftResponse;
  },

  /**
   * Get available tone presets
   */
  async getAvailableTones(): Promise<AvailableTonesResponse> {
    const response = await fetch(`${API_URL}/api/tone/tones`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch tones');
    }

    return data as AvailableTonesResponse;
  },

  /**
   * Batch shift multiple texts
   */
  async batchShift(texts: string[], target_tone: string, context?: string): Promise<any> {
    return apiCall('/api/tone/batch-shift', {
      method: 'POST',
      body: JSON.stringify({ texts, target_tone, context }),
    });
  },

  /**
   * Get tone improvement suggestions
   */
  async suggestImprovements(text: string, current_tone: string, target_audience?: string): Promise<any> {
    return apiCall('/api/tone/suggest-improvements', {
      method: 'POST',
      body: JSON.stringify({ text, current_tone, target_audience }),
    });
  },

  /**
   * Get cache statistics
   */
  async getCacheStats(): Promise<any> {
    return apiCall('/api/tone/cache/stats', {
      method: 'GET',
    });
  },

  /**
   * Clear user's cache on the backend
   */
  async clearBackendCache(): Promise<any> {
    return apiCall('/api/tone/cache/clear', {
      method: 'DELETE',
    });
  },
};

// Text Processing API
export interface TextRewriteRequest {
  text: string;
  tone: string;
  use_cache?: boolean;
}

export interface TextRewriteResponse {
  success: boolean;
  original: string;
  rewritten: string;
  tone: string;
  emotion: string;
  intent: string;
  cached?: boolean;
  cache_hit_count?: number;
  error?: string;
}

export interface TextRewriteMultipleRequest {
  text: string;
  tones: string[];
  use_cache?: boolean;
}

export interface TextVariation {
  tone: string;
  rewritten: string;
  cached?: boolean;
  cache_hit_count?: number;
}

export interface TextRewriteMultipleResponse {
  success: boolean;
  original: string;
  emotion: string;
  intent: string;
  total_variations: number;
  variations: TextVariation[];
  error?: string;
}

export const textAPI = {
  /**
   * Rewrite text in a single tone with emotion/intent detection
   */
  async rewrite(request: TextRewriteRequest, useCache: boolean = true): Promise<TextRewriteResponse> {
    // Check frontend cache first if enabled
    if (useCache) {
      const { getCachedResponse, setCachedResponse } = await import('./cache');
      const cached = getCachedResponse(request.text, request.tone);
      if (cached) {
        return {
          success: true,
          original: request.text,
          rewritten: cached.transformed_text,
          tone: request.tone,
          emotion: 'neutral',
          intent: 'inform',
          cached: true,
          cache_hit_count: cached.cache_hit_count
        };
      }
    }

    const response = await fetch(`${API_URL}/api/text/rewrite`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...request, use_cache: useCache }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Text rewrite failed');
    }

    // Store in frontend cache if enabled and successful
    if (useCache && data.success && !data.cached) {
      const { setCachedResponse } = await import('./cache');
      setCachedResponse(request.text, request.tone, {
        success: true,
        transformed_text: data.rewritten,
        target_tone: request.tone,
        original_text: request.text,
        tone_description: '',
        model_used: '',
        usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 }
      });
    }

    return data as TextRewriteResponse;
  },

  /**
   * Rewrite text in multiple tones at once
   */
  async rewriteMultiple(request: TextRewriteMultipleRequest, useCache: boolean = true): Promise<TextRewriteMultipleResponse> {
    const response = await fetch(`${API_URL}/api/text/rewrite-multiple`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...request, use_cache: useCache }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Multi-tone rewrite failed');
    }

    return data as TextRewriteMultipleResponse;
  },

  /**
   * Get available tones for text processing
   */
  async getAvailableTones(): Promise<any> {
    const response = await fetch(`${API_URL}/api/text/available-tones`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch tones');
    }

    return data;
  },
};

// ==================== USER PREFERENCES API ====================

export const userAPI = {
  /**
   * Get user preferences
   */
  async getPreferences(): Promise<any> {
    return apiCall(`/api/user/preferences`, {
      method: 'GET',
    });
  },

  /**
   * Update user preferences
   */
  async updatePreferences(preferences: any): Promise<any> {
    return apiCall(`/api/user/preferences`, {
      method: 'PUT',
      body: JSON.stringify({ preferences }),
    });
  },

  /**
   * Reset preferences to default
   */
  async resetPreferences(): Promise<any> {
    return apiCall(`/api/user/preferences/reset`, {
      method: 'POST',
    });
  },

  /**
   * Get conversation history
   */
  async getHistory(params?: {
    page?: number;
    limit?: number;
    search?: string;
    favorite?: boolean;
    tags?: string;
  }): Promise<any> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.favorite !== undefined) queryParams.append('favorite', params.favorite.toString());
    if (params?.tags) queryParams.append('tags', params.tags);

    const query = queryParams.toString();
    return apiCall(`/api/user/history${query ? `?${query}` : ''}`, {
      method: 'GET',
    });
  },

  /**
   * Save conversation to history
   */
  async saveHistory(data: {
    input_text: string;
    results: any[];
    metadata?: any;
  }): Promise<any> {
    return apiCall(`/api/user/history`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Toggle favorite status
   */
  async toggleFavorite(historyId: string): Promise<any> {
    return apiCall(`/api/user/history/${historyId}/favorite`, {
      method: 'PUT',
    });
  },

  /**
   * Delete history entry
   */
  async deleteHistory(historyId: string): Promise<any> {
    return apiCall(`/api/user/history/${historyId}`, {
      method: 'DELETE',
    });
  },

  /**
   * Clear all history
   */
  async clearHistory(keepFavorites: boolean = true): Promise<any> {
    return apiCall(`/api/user/history/clear?keep_favorites=${keepFavorites}`, {
      method: 'DELETE',
    });
  },

  /**
   * Get favorites
   */
  async getFavorites(): Promise<any> {
    return apiCall(`/api/user/favorites`, {
      method: 'GET',
    });
  },
};

export { API_URL };
