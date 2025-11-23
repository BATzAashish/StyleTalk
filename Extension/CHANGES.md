# 🔄 Extension Updates - Auto Port Detection

## What Changed?

Added **automatic port detection** so the extension works with **both port 8080 and 8081** (or any configured ports).

## Files Modified

### 1. `popup/popup.js` ✅
**Changes:**
- Added `FRONTEND_PORTS` array: `[8081, 8080]`
- Added `detectFrontendPort()` function
- Updated all URL references to use dynamic port detection:
  - `handleLogin()` - Opens auth page on detected port
  - `handleRegister()` - Opens register page on detected port
  - `viewHistory()` - Opens dashboard on detected port
  - `openPreferences()` - Opens preferences on detected port
  - Footer links - Help and Feedback use detected port

**Result:** Extension now tries port 8081 first, falls back to 8080

### 2. `popup/popup.html` ✅
**Changes:**
- Changed `<a href="http://localhost:8081">` to `<a href="#" id="webAppLink">`
- Made "Open Web App" link dynamic (uses JS to detect port)

**Result:** Footer link adapts to whichever port is running

### 3. `lib/api.js` ✅
**Changes:**
- Added `BACKEND_PORTS` array: `[5000, 5001]`
- Added `detectBackendUrl()` function with health check
- Updated `makeRequest()` to detect backend URL before each API call
- Added 2-second timeout for port detection
- Caches working URL to avoid repeated checks

**Result:** Extension API automatically finds running backend

## How It Works

### Frontend Detection (popup.js)
```javascript
// Priority order: Try 8081 first, then 8080
const FRONTEND_PORTS = [8081, 8080];

async function detectFrontendPort() {
  // Try HEAD request to each port
  // Return first one that responds
  // Cache result for subsequent calls
}
```

### Backend Detection (lib/api.js)
```javascript
// Priority order: Try 5000 first, then 5001
const BACKEND_PORTS = [5000, 5001];

async function detectBackendUrl() {
  // Try GET /health on each port
  // 2-second timeout per attempt
  // Return first one that responds with 200 OK
  // Cache result for subsequent API calls
}
```

## Test Results ✅

Ran `test_services.py`:
```
✅ Backend: Running on port 5000
✅ Frontend: Running on port 8080
✅ All services running! Extension should work now.
```

## Current Configuration

Based on your setup:
- **Frontend**: Port **8080** (Vite running)
- **Backend**: Port **5000** (Flask running)

Extension will automatically detect and use these ports! 🎯

## Benefits

✅ **No manual configuration** - Works out of the box  
✅ **Flexible setup** - Supports both 8080 and 8081  
✅ **Auto-fallback** - Tries multiple ports automatically  
✅ **Future-proof** - Easy to add more ports if needed  
✅ **Error resilient** - Defaults to 8081/5000 if detection fails  

## User Action Required

### 1. Reload Extension (REQUIRED)
```
1. Go to chrome://extensions
2. Find "StyleTalk" card
3. Click the refresh/reload icon
```

### 2. Test on Website
```
1. Visit any website (google.com, gmail.com)
2. Look for purple ✨ button
3. Press Ctrl+Shift+T to open overlay
```

### 3. Test Popup Links
```
1. Click extension icon
2. Try "Sign In" button (should open localhost:8080/auth)
3. Try "Open Web App" link (should open localhost:8080)
```

## Adding More Ports (Optional)

If you want to support additional ports in the future:

**For Frontend:**
Edit `Extension/popup/popup.js`:
```javascript
const FRONTEND_PORTS = [8081, 8080, 3000]; // Add more ports
```

**For Backend:**
Edit `Extension/lib/api.js`:
```javascript
const BACKEND_PORTS = [5000, 5001, 8000]; // Add more ports
```

## Logs to Check

### Popup Console (Right-click extension icon → Inspect popup)
```javascript
[Port Detection] Found frontend on port 8080  // ✅ Success
[Port Detection] Port 8081 not available      // ⚠️ Tried but not running
[Port Detection] Using default port 8081      // ℹ️ Fallback
```

### Service Worker Console (chrome://extensions → "service worker" link)
```javascript
[API] Found backend on port 5000        // ✅ Success
[API] Port 5001 not available          // ⚠️ Tried but not running
[API] Using default backend port 5000  // ℹ️ Fallback
```

## Summary

✅ **Extension updated** - Auto port detection added  
✅ **Both 8080 and 8081 supported** - Works with either  
✅ **Backend auto-detection** - Finds Flask on 5000 or 5001  
✅ **Services running** - Backend (5000) + Frontend (8080)  
⚠️ **Action needed** - Reload extension in Chrome  

---

**After reloading, the extension will automatically detect and use port 8080!** 🎉
