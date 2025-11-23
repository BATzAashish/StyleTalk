# 🦁 StyleTalk Extension - Brave Browser Setup

## Your Current Issues:

1. ✅ Floating button appears (content script works!)
2. ❌ Clicking button doesn't open overlay
3. ❌ Extension popup buttons don't work
4. ✅ Backend running on port 5000
5. ✅ Frontend running on port 8080

---

## 🔧 Brave-Specific Fixes

### Issue 1: Brave Shields Blocking Extension

Brave's built-in shields might be blocking the extension's functionality.

**Fix:**
1. Click the **Brave lion icon** (top-right, next to address bar)
2. Click **"Advanced View"** or **"Advanced controls"**
3. Turn **Shields DOWN** for the website you're testing
4. Or set these:
   - Block cross-site cookies: **Disabled**
   - Block scripts: **Disabled**
   - Block fingerprinting: **Allow all**

**Test on:** `google.com` with Shields DOWN

---

### Issue 2: Overlay Not Opening (Click Event Not Firing)

**Diagnostic Steps:**

1. **Open Brave DevTools:**
   - Right-click anywhere → **Inspect**
   - Or press `F12`

2. **Go to Console tab**

3. **Look for these messages:**
   ```javascript
   [StyleTalk] Content script initialized  // Should appear on page load
   [StyleTalk] Floating button created     // When button appears
   [StyleTalk] Overlay toggled            // When button clicked
   ```

4. **If NO messages appear:**
   - Content script not loading
   - Check next section

5. **If messages appear but overlay doesn't open:**
   - Check for errors in red
   - Share the error message

---

### Issue 3: Content Script Not Loading

**Check if content script is injected:**

In Console, type:
```javascript
document.querySelector('#styletalk-floating-button')
```

Press Enter.

**Expected:** Should return `<div id="styletalk-floating-button"...>`  
**If null:** Content script failed to inject

**Fix:**
1. Go to `brave://extensions`
2. Find **StyleTalk**
3. Click **"Details"**
4. Scroll to **"Site access"**
5. Select **"On all sites"** (not "On click" or "On specific sites")

---

### Issue 4: Extension Popup Buttons Not Working

**Why:** Buttons try to open `http://localhost:8080/auth` and other local URLs

**Temporary Solution - Test Without Auth:**

The extension has **guest mode**! You can use all features without signing in:

1. Click extension icon
2. Ignore the "Sign In" buttons
3. Click **"Open Assistant"** button
4. Should send message to active tab to show overlay

**If "Open Assistant" doesn't work:**
- The extension is trying to message the active tab
- But the tab might not have the content script

**Fix:**
1. Open a simple page like `google.com`
2. Click the floating ✨ button on the page
3. Should open overlay directly

---

### Issue 5: Manually Test Overlay

**In Console on any webpage, run:**

```javascript
// Test if toggleOverlay function exists
typeof toggleOverlay

// If returns "function", manually trigger it:
toggleOverlay()
```

**Expected:** Overlay should appear

**If "undefined":**
- Content script not loaded
- Reload page after reloading extension

---

## 🎯 Step-by-Step Testing

### Step 1: Reload Extension

```
1. Open brave://extensions
2. Find "StyleTalk - AI Writing Assistant"
3. Click RELOAD button (↻ circular arrow)
4. Extension reloads with latest code
```

### Step 2: Check Extension Permissions

```
1. At brave://extensions
2. Click "Details" on StyleTalk
3. Scroll to "Site access"
4. Should be: "On all sites"
5. If not, change it
```

### Step 3: Open Simple Test Page

```
1. Open new tab
2. Go to: google.com
3. Wait 2-3 seconds
4. Look for purple ✨ button (bottom-right)
```

**If button appears:** Content script works! ✅  
**If not:** See "Content Script Not Loading" section above

### Step 4: Open DevTools BEFORE Clicking Button

```
1. On google.com (with ✨ button visible)
2. Press F12
3. Go to Console tab
4. Click the ✨ button
5. Watch console for messages
```

**Expected messages:**
```
[StyleTalk] Overlay toggled
[StyleTalk] Creating overlay iframe
```

**If errors appear:** Share them!

### Step 5: Check for Iframe Creation

In Console, after clicking button:

```javascript
document.querySelector('#styletalk-overlay')
```

**Expected:** Should return an iframe element  
**If null:** Overlay iframe not created (check for errors)

---

## 🐛 Common Brave-Specific Issues

### Issue: "Failed to load resource"

**Cause:** Brave blocking chrome-extension:// URLs

**Fix:**
1. Go to `brave://settings/shields`
2. Scroll to **"Advanced"**
3. Ensure these are enabled:
   - Allow extensions to access sites
   - Allow resource loading

### Issue: iframe Won't Load

**Cause:** Brave blocking iframe injection

**Fix:**
1. Disable Brave Shields on test page
2. Or whitelist your extension in Shields settings

### Issue: API Calls Blocked

**Cause:** Brave blocking localhost API calls

**Fix:**
1. Click Brave Shield icon
2. Advanced View
3. Allow all for the current site

---

## 🔍 Detailed Diagnostics

Run these commands in Console (F12) on any webpage:

### Check Content Script Loaded:
```javascript
console.log('Content script check:', !!window.StyleTalkContentScriptLoaded)
```

### Check Button Exists:
```javascript
console.log('Button:', document.querySelector('#styletalk-floating-button'))
```

### Check Overlay Exists:
```javascript
console.log('Overlay:', document.querySelector('#styletalk-overlay'))
```

### Manually Create Overlay:
```javascript
// This should work if content script is loaded
if (typeof showOverlay === 'function') {
    showOverlay('test');
} else {
    console.error('showOverlay function not found - content script not loaded');
}
```

---

## 📋 Checklist

Copy and check off:

- [ ] Extension loaded in brave://extensions
- [ ] Extension reloaded after any code changes
- [ ] Extension has "On all sites" permission
- [ ] Brave Shields turned DOWN on test page (google.com)
- [ ] Backend running (port 5000)
- [ ] Frontend running (port 8080)
- [ ] Opened google.com in new tab
- [ ] Floating ✨ button appears
- [ ] Opened DevTools (F12) → Console tab
- [ ] Clicked floating button
- [ ] Checked console for errors
- [ ] Checked if iframe created: `document.querySelector('#styletalk-overlay')`

---

## ✅ Expected Working State

When everything works:

1. **Open google.com**
2. **Purple ✨ button appears** (bottom-right)
3. **Click button**
4. **Overlay appears** (purple gradient header, centered on screen)
5. **Can type in text input**
6. **Can click tone buttons** (Formal, Casual, etc.)
7. **Backend API returns suggestions** (within 2-3 seconds)

---

## 🆘 If Still Not Working

### Get Detailed Logs:

1. **Content Script Console:**
   - F12 → Console tab on any webpage
   - Look for `[StyleTalk]` messages
   - Copy any errors (red text)

2. **Background Script Console:**
   - Go to brave://extensions
   - Find StyleTalk
   - Click "service worker" link
   - Copy any errors

3. **Extension Popup Console:**
   - Right-click extension icon
   - Select "Inspect popup"
   - Check console for errors

### Share These:

1. Console errors from webpage (F12)
2. Console errors from service worker
3. What happens when you click the floating button
4. Screenshot of brave://extensions showing StyleTalk

---

## 🎯 Quick Fix Commands

Run these in PowerShell:

```powershell
# Check services
cd D:\Projects\StyleTalk\Extension
python test_services.py

# Backend should show:
# ✅ Backend running on port 5000
# ✅ Frontend running on port 8080
```

If not running:

```powershell
# Start backend
cd D:\Projects\StyleTalk\Backend
python run.py

# In another terminal, start frontend
cd D:\Projects\StyleTalk\Frontend
npm run dev
```

---

## 📱 Test Without Authentication

The extension works in **guest mode**! All features available without login:

1. **Tone Shifting:** Click button → Type text → Click tone
2. **Context Menu:** Right-click selected text → StyleTalk menu
3. **Keyboard Shortcut:** Press Ctrl+Shift+T (if configured)
4. **Enhancement:** Full rewrite, grammar only, add emojis

Authentication only needed for:
- Syncing preferences across devices
- Saving history to cloud
- Viewing statistics

**So ignore the "Sign In" buttons for now and just test the core features!**

---

## 🎉 Next Steps After It Works

1. Test on different websites (gmail, twitter, facebook)
2. Try different tone buttons
3. Test context menu (right-click selected text)
4. Test keyboard shortcut (if configured)
5. Create account for cloud sync (optional)

---

**Most likely issue: Brave Shields blocking extension functionality. Turn them DOWN on test pages!** 🎯
