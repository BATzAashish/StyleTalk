/**
 * StyleTalk Extension - Popup Script
 */

// ==================== PORT CONFIGURATION ====================

// Try multiple ports for frontend (8080, 8081)
const FRONTEND_PORTS = [8081, 8080];
let ACTIVE_FRONTEND_PORT = null;

// Detect which frontend port is active
async function detectFrontendPort() {
  if (ACTIVE_FRONTEND_PORT) {
    return `http://localhost:${ACTIVE_FRONTEND_PORT}`;
  }
  
  for (const port of FRONTEND_PORTS) {
    try {
      const response = await fetch(`http://localhost:${port}/`, { 
        method: 'HEAD',
        mode: 'no-cors' // Avoid CORS issues
      });
      console.log(`[Port Detection] Found frontend on port ${port}`);
      ACTIVE_FRONTEND_PORT = port;
      return `http://localhost:${port}`;
    } catch (error) {
      console.log(`[Port Detection] Port ${port} not available`);
    }
  }
  
  // Default to 8081 if none found
  console.log('[Port Detection] Using default port 8081');
  ACTIVE_FRONTEND_PORT = 8081;
  return `http://localhost:${ACTIVE_FRONTEND_PORT}`;
}

// ==================== INITIALIZATION ====================

document.addEventListener('DOMContentLoaded', async () => {
  console.log('[Popup] Initialized');
  
  // Detect active frontend port
  await detectFrontendPort();
  
  // Check auth status
  await checkAuthStatus();
  
  // Load preferences
  await loadPreferences();
  
  // Setup event listeners
  setupEventListeners();
  
  // Load stats
  await loadStats();
});

// ==================== AUTH STATUS ====================

async function checkAuthStatus() {
  try {
    const response = await chrome.runtime.sendMessage({
      action: 'getAuthStatus'
    });
    
    if (response.isAuthenticated) {
      showUserSection();
      await loadUserInfo();
    } else {
      showAuthSection();
    }
  } catch (error) {
    console.error('[Auth Check Error]', error);
    showAuthSection();
  }
}

function showAuthSection() {
  document.getElementById('authSection').style.display = 'block';
  document.getElementById('userSection').style.display = 'none';
}

function showUserSection() {
  document.getElementById('authSection').style.display = 'none';
  document.getElementById('userSection').style.display = 'block';
}

async function loadUserInfo() {
  try {
    const response = await chrome.runtime.sendMessage({
      action: 'getPreferences'
    });
    
    if (response && response.user) {
      document.getElementById('userName').textContent = response.user.name || 'User';
      document.getElementById('userEmail').textContent = response.user.email || '';
    }
  } catch (error) {
    console.error('[Load User Error]', error);
  }
}

// ==================== PREFERENCES ====================

async function loadPreferences() {
  try {
    const response = await chrome.runtime.sendMessage({
      action: 'getPreferences'
    });
    
    if (response && response.preferences) {
      document.getElementById('enableEmojis').checked = response.preferences.enable_emojis !== false;
      document.getElementById('enableGifs').checked = response.preferences.enable_gifs !== false;
      document.getElementById('grammarCheck').checked = response.preferences.grammar_correction !== false;
    }
  } catch (error) {
    console.error('[Load Preferences Error]', error);
  }
}

async function savePreference(key, value) {
  try {
    await chrome.runtime.sendMessage({
      action: 'updatePreferences',
      preferences: {
        [key]: value
      }
    });
    console.log('[Preference Saved]', key, value);
  } catch (error) {
    console.error('[Save Preference Error]', error);
  }
}

// ==================== STATS ====================

async function loadStats() {
  try {
    const response = await chrome.runtime.sendMessage({
      action: 'getPreferences'
    });
    
    if (response && response.statistics) {
      document.getElementById('todayRequests').textContent = response.statistics.total_requests || 0;
      document.getElementById('cacheHits').textContent = response.statistics.cache_hits || 0;
    }
  } catch (error) {
    console.error('[Load Stats Error]', error);
  }
}

// ==================== EVENT LISTENERS ====================

function setupEventListeners() {
  // Auth buttons
  document.getElementById('loginBtn').addEventListener('click', handleLogin);
  document.getElementById('registerBtn').addEventListener('click', handleRegister);
  document.getElementById('logoutBtn').addEventListener('click', handleLogout);
  
  // Quick actions
  document.getElementById('openAssistant').addEventListener('click', openAssistant);
  document.getElementById('viewHistory').addEventListener('click', viewHistory);
  document.getElementById('openPreferences').addEventListener('click', openPreferences);
  
  // Settings toggles
  document.getElementById('enableEmojis').addEventListener('change', (e) => {
    savePreference('enable_emojis', e.target.checked);
  });
  
  document.getElementById('enableGifs').addEventListener('change', (e) => {
    savePreference('enable_gifs', e.target.checked);
  });
  
  document.getElementById('grammarCheck').addEventListener('change', (e) => {
    savePreference('grammar_correction', e.target.checked);
  });
  
  // Footer links
  document.getElementById('webAppLink').addEventListener('click', async (e) => {
    e.preventDefault();
    const baseUrl = await detectFrontendPort();
    chrome.tabs.create({ url: baseUrl });
  });
  
  document.getElementById('helpLink').addEventListener('click', async (e) => {
    e.preventDefault();
    const baseUrl = await detectFrontendPort();
    chrome.tabs.create({ url: `${baseUrl}/help` });
  });
  
  document.getElementById('feedbackLink').addEventListener('click', async (e) => {
    e.preventDefault();
    const baseUrl = await detectFrontendPort();
    chrome.tabs.create({ url: `${baseUrl}/feedback` });
  });
}

// ==================== AUTH ACTIONS ====================

async function handleLogin() {
  // Open web app login page
   const baseUrl = await detectFrontendPort();
  chrome.tabs.create({ url: `${baseUrl}/auth?mode=login&redirect=extension` });
  window.close();
}

async function handleRegister() {
  // Open web app register page
  const baseUrl = await detectFrontendPort();
  chrome.tabs.create({ url: `${baseUrl}/auth?mode=register&redirect=extension` });
  window.close();
}

async function handleLogout() {
  if (confirm('Are you sure you want to sign out?')) {
    try {
      await chrome.runtime.sendMessage({
        action: 'logout'
      });
      
      showAuthSection();
      
      // Show notification
      alert('Successfully signed out');
    } catch (error) {
      console.error('[Logout Error]', error);
      alert('Failed to sign out. Please try again.');
    }
  }
}

// ==================== QUICK ACTIONS ====================

async function openAssistant() {
  // Send message to active tab to show overlay
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  if (tab) {
    await chrome.tabs.sendMessage(tab.id, {
      action: 'showOverlay'
    });
    window.close();
  }
}

async function viewHistory() {
  const baseUrl = await detectFrontendPort();
  chrome.tabs.create({ url: `${baseUrl}/dashboard` });
  window.close();
}

async function openPreferences() {
  const baseUrl = await detectFrontendPort();
  chrome.tabs.create({ url: `${baseUrl}/preferences` });
  window.close();
}

console.log('[Popup] Script loaded');
