/**
 * StyleTalk Extension API Client
 * Connects to backend Flask API
 */

// Try multiple backend ports (5000 is default Flask port)
const BACKEND_PORTS = [5000, 5001];
let ACTIVE_BACKEND_URL = null;

class StyleTalkAPI {
  constructor() {
    this.token = null;
    this.loadToken();
  }
  
  async detectBackendUrl() {
    if (ACTIVE_BACKEND_URL) {
      return ACTIVE_BACKEND_URL;
    }
    
    for (const port of BACKEND_PORTS) {
      try {
        const testUrl = `http://localhost:${port}`;
        const response = await fetch(`${testUrl}/health`, { 
          method: 'GET',
          signal: AbortSignal.timeout(2000) // 2 second timeout
        });
        if (response.ok) {
          console.log(`[API] Found backend on port ${port}`);
          ACTIVE_BACKEND_URL = testUrl;
          return testUrl;
        }
      } catch (error) {
        console.log(`[API] Port ${port} not available`);
      }
    }
    
    // Default to 5000 if none found
    console.log('[API] Using default backend port 5000');
    ACTIVE_BACKEND_URL = 'http://localhost:5000';
    return ACTIVE_BACKEND_URL;
  }

  async loadToken() {
    const result = await chrome.storage.local.get(['authToken']);
    this.token = result.authToken || null;
  }

  async setToken(token) {
    this.token = token;
    await chrome.storage.local.set({ authToken: token });
  }

  async clearToken() {
    this.token = null;
    await chrome.storage.local.remove('authToken');
  }

  async makeRequest(endpoint, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...(this.token && { 'Authorization': `Bearer ${this.token}` }),
      ...options.headers
    };

    try {
      const apiUrl = await this.detectBackendUrl();
      const response = await fetch(`${apiUrl}${endpoint}`, {
        ...options,
        headers
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error('[API Error]', error);
      throw error;
    }
  }

  // ==================== AUTH ====================

  async login(email, password) {
    const data = await this.makeRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    
    if (data.token) {
      await this.setToken(data.token);
    }
    
    return data;
  }

  async register(name, email, password) {
    return this.makeRequest('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password })
    });
  }

  async logout() {
    await this.clearToken();
  }

  // ==================== TEXT PROCESSING ====================

  async rewriteText(text, options = {}) {
    return this.makeRequest('/api/text/rewrite', {
      method: 'POST',
      body: JSON.stringify({
        text,
        enableGrammar: options.enableGrammar ?? true,
        enableRephrasing: options.enableRephrasing ?? true,
        enableEmojis: options.enableEmojis ?? true,
        enableGifs: options.enableGifs ?? true,
        targetLanguage: options.targetLanguage,
        useCache: options.useCache ?? true
      })
    });
  }

  async quickShift(text, targetTone, context = null) {
    return this.makeRequest('/api/tone/quick-shift', {
      method: 'POST',
      body: JSON.stringify({
        text,
        target_tone: targetTone,
        context,
        temperature: 0.7
      })
    });
  }

  async detectEmotion(text) {
    // TODO: Implement emotion detection endpoint
    // Temporary mock for now
    return {
      emotion: {
        primary: 'neutral',
        confidence: 0.75,
        all_emotions: { neutral: 0.75, joy: 0.15, surprise: 0.10 }
      },
      intent: {
        primary: 'information',
        confidence: 0.80
      }
    };
  }

  async analyzeContext(text, conversationHistory = []) {
    // TODO: Implement context analysis endpoint
    return {
      relationship: 'professional',
      formality: 0.7,
      sentiment: 'positive',
      topics: ['work', 'meeting']
    };
  }

  // ==================== USER PREFERENCES ====================

  async getPreferences() {
    return this.makeRequest('/api/user/preferences', {
      method: 'GET'
    });
  }

  async updatePreferences(preferences) {
    return this.makeRequest('/api/user/preferences', {
      method: 'PUT',
      body: JSON.stringify({ preferences })
    });
  }

  // ==================== HISTORY ====================

  async saveToHistory(data) {
    return this.makeRequest('/api/user/history', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async getHistory(params = {}) {
    const queryParams = new URLSearchParams(params);
    return this.makeRequest(`/api/user/history?${queryParams}`, {
      method: 'GET'
    });
  }

  // ==================== CULTURAL SENSITIVITY ====================

  async checkCulturalSensitivity(text, targetCulture = null) {
    // TODO: Implement cultural sensitivity endpoint
    // Mock for now
    return {
      is_sensitive: false,
      issues: [],
      suggestions: []
    };
  }

  // ==================== FEEDBACK ====================

  async submitFeedback(responseId, rating, responseType) {
    // TODO: Implement feedback endpoint
    console.log('[Feedback]', { responseId, rating, responseType });
    return { success: true };
  }
}

// Export singleton instance
const api = new StyleTalkAPI();
export default api;
