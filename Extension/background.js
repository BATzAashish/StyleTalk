/**
 * StyleTalk Extension - Background Service Worker
 * Handles API communication, authentication, and context menu
 */

importScripts('lib/api.js');

// ==================== INITIALIZATION ====================

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('[StyleTalk] Extension installed');
    // Open onboarding page
    chrome.tabs.create({ url: 'popup/popup.html' });
  } else if (details.reason === 'update') {
    console.log('[StyleTalk] Extension updated');
  }

  // Create context menus
  createContextMenus();
});

// ==================== CONTEXT MENUS ====================

function createContextMenus() {
  chrome.contextMenus.removeAll(() => {
    // Main menu
    chrome.contextMenus.create({
      id: 'styletalk-main',
      title: 'StyleTalk',
      contexts: ['selection', 'editable']
    });

    // Quick tone shift options
    const tones = [
      { id: 'tone-formal', title: '✨ Make Formal' },
      { id: 'tone-casual', title: '😊 Make Casual' },
      { id: 'tone-professional', title: '💼 Make Professional' },
      { id: 'tone-friendly', title: '🤗 Make Friendly' },
      { id: 'tone-genz', title: '🔥 Make Gen-Z' },
      { id: 'tone-romantic', title: '💕 Make Romantic' }
    ];

    tones.forEach(tone => {
      chrome.contextMenus.create({
        id: tone.id,
        parentId: 'styletalk-main',
        title: tone.title,
        contexts: ['selection', 'editable']
      });
    });

    // Separator
    chrome.contextMenus.create({
      id: 'separator-1',
      parentId: 'styletalk-main',
      type: 'separator',
      contexts: ['selection', 'editable']
    });

    // Other options
    chrome.contextMenus.create({
      id: 'rewrite-full',
      parentId: 'styletalk-main',
      title: '🎯 Full Rewrite (All Enhancements)',
      contexts: ['selection', 'editable']
    });

    chrome.contextMenus.create({
      id: 'grammar-only',
      parentId: 'styletalk-main',
      title: '📝 Fix Grammar Only',
      contexts: ['selection', 'editable']
    });

    chrome.contextMenus.create({
      id: 'add-emojis',
      parentId: 'styletalk-main',
      title: '😀 Add Emojis',
      contexts: ['selection', 'editable']
    });

    chrome.contextMenus.create({
      id: 'show-overlay',
      parentId: 'styletalk-main',
      title: '🚀 Open StyleTalk Assistant',
      contexts: ['all']
    });
  });
}

// ==================== CONTEXT MENU CLICK HANDLER ====================

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  const selectedText = info.selectionText || '';
  
  // Handle tone shifts
  if (info.menuItemId.startsWith('tone-')) {
    const tone = info.menuItemId.replace('tone-', '');
    await handleQuickToneShift(tab.id, selectedText, tone);
  }
  // Handle full rewrite
  else if (info.menuItemId === 'rewrite-full') {
    await handleFullRewrite(tab.id, selectedText);
  }
  // Handle grammar only
  else if (info.menuItemId === 'grammar-only') {
    await handleGrammarFix(tab.id, selectedText);
  }
  // Handle add emojis
  else if (info.menuItemId === 'add-emojis') {
    await handleAddEmojis(tab.id, selectedText);
  }
  // Show overlay
  else if (info.menuItemId === 'show-overlay') {
    await chrome.tabs.sendMessage(tab.id, {
      action: 'showOverlay',
      text: selectedText
    });
  }
});

// ==================== MESSAGE HANDLERS ====================

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('[Background] Received message:', message.action);

  // Handle async operations
  handleMessage(message, sender)
    .then(sendResponse)
    .catch(error => {
      console.error('[Background] Error:', error);
      sendResponse({ success: false, error: error.message });
    });

  return true; // Keep message channel open for async response
});

async function handleMessage(message, sender) {
  switch (message.action) {
    case 'rewriteText':
      return await api.rewriteText(message.text, message.options);

    case 'quickShift':
      return await api.quickShift(message.text, message.targetTone, message.context);

    case 'detectEmotion':
      return await api.detectEmotion(message.text);

    case 'analyzeContext':
      return await api.analyzeContext(message.text, message.conversationHistory);

    case 'getPreferences':
      return await api.getPreferences();

    case 'updatePreferences':
      return await api.updatePreferences(message.preferences);

    case 'saveToHistory':
      return await api.saveToHistory(message.data);

    case 'getHistory':
      return await api.getHistory(message.params);

    case 'checkCulturalSensitivity':
      return await api.checkCulturalSensitivity(message.text, message.targetCulture);

    case 'submitFeedback':
      return await api.submitFeedback(message.responseId, message.rating, message.responseType);

    case 'login':
      return await api.login(message.email, message.password);

    case 'register':
      return await api.register(message.name, message.email, message.password);

    case 'logout':
      await api.logout();
      return { success: true };

    case 'getAuthStatus':
      await api.loadToken();
      return { isAuthenticated: !!api.token };

    default:
      throw new Error(`Unknown action: ${message.action}`);
  }
}

// ==================== QUICK ACTIONS ====================

async function handleQuickToneShift(tabId, text, tone) {
  try {
    showNotification('Processing...', `Converting to ${tone} tone`);

    const result = await api.quickShift(text, tone);
    
    // Send result back to content script
    await chrome.tabs.sendMessage(tabId, {
      action: 'replaceText',
      text: result.shifted_text || result.text,
      original: text
    });

    showNotification('✅ Done!', `Text converted to ${tone} tone`);
  } catch (error) {
    console.error('[Quick Shift Error]', error);
    showNotification('❌ Error', error.message);
  }
}

async function handleFullRewrite(tabId, text) {
  try {
    showNotification('Processing...', 'Applying all enhancements');

    const result = await api.rewriteText(text, {
      enableGrammar: true,
      enableRephrasing: true,
      enableEmojis: true,
      enableGifs: false // GIFs handled in overlay
    });

    await chrome.tabs.sendMessage(tabId, {
      action: 'showResults',
      results: result
    });

    showNotification('✅ Done!', 'Text enhanced successfully');
  } catch (error) {
    console.error('[Full Rewrite Error]', error);
    showNotification('❌ Error', error.message);
  }
}

async function handleGrammarFix(tabId, text) {
  try {
    showNotification('Processing...', 'Fixing grammar');

    const result = await api.rewriteText(text, {
      enableGrammar: true,
      enableRephrasing: false,
      enableEmojis: false,
      enableGifs: false
    });

    const grammarFixed = result.grammar_correction?.corrected_text || text;

    await chrome.tabs.sendMessage(tabId, {
      action: 'replaceText',
      text: grammarFixed,
      original: text
    });

    showNotification('✅ Done!', 'Grammar corrected');
  } catch (error) {
    console.error('[Grammar Fix Error]', error);
    showNotification('❌ Error', error.message);
  }
}

async function handleAddEmojis(tabId, text) {
  try {
    showNotification('Processing...', 'Adding emojis');

    const result = await api.rewriteText(text, {
      enableGrammar: false,
      enableRephrasing: false,
      enableEmojis: true,
      enableGifs: false
    });

    const withEmojis = result.emoji_suggestions?.enhanced_text || text;

    await chrome.tabs.sendMessage(tabId, {
      action: 'replaceText',
      text: withEmojis,
      original: text
    });

    showNotification('✅ Done!', 'Emojis added');
  } catch (error) {
    console.error('[Add Emojis Error]', error);
    showNotification('❌ Error', error.message);
  }
}

// ==================== NOTIFICATIONS ====================

function showNotification(title, message) {
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icons/icon48.png',
    title,
    message,
    priority: 1
  });
}

// ==================== KEYBOARD SHORTCUTS ====================

chrome.commands.onCommand.addListener(async (command) => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (command === 'rewrite-text') {
    // Ctrl+Shift+R - Trigger rewrite on selected text
    await chrome.tabs.sendMessage(tab.id, {
      action: 'rewriteSelection'
    });
  } else if (command === 'toggle-overlay') {
    // Ctrl+Shift+T - Toggle overlay
    await chrome.tabs.sendMessage(tab.id, {
      action: 'toggleOverlay'
    });
  }
});

// ==================== LIFECYCLE ====================

console.log('[StyleTalk] Background service worker initialized');
