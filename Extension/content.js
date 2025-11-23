/**
 * StyleTalk Extension - Content Script
 * Detects text inputs and injects overlay on all websites
 */

// ==================== STATE ====================

let currentFocusedElement = null;
let overlayVisible = false;
let conversationHistory = [];
let pageContext = null;

// ==================== INITIALIZATION ====================

console.log('[StyleTalk] Content script loaded on:', window.location.href);

// Initialize on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize);
} else {
  initialize();
}

function initialize() {
  console.log('[StyleTalk] Initializing...');
  
  // Detect page context (Gmail, WhatsApp, etc.)
  detectPageContext();
  
  // Add floating button
  injectFloatingButton();
  
  // Monitor text inputs
  monitorTextInputs();
  
  // Listen for messages from background
  chrome.runtime.onMessage.addListener(handleMessage);
  
  console.log('[StyleTalk] Initialized successfully');
}

// ==================== PAGE CONTEXT DETECTION ====================

function detectPageContext() {
  const hostname = window.location.hostname;
  
  if (hostname.includes('mail.google.com')) {
    pageContext = {
      platform: 'gmail',
      type: 'email',
      selector: 'div[role="textbox"]'
    };
  } else if (hostname.includes('web.whatsapp.com')) {
    pageContext = {
      platform: 'whatsapp',
      type: 'chat',
      selector: 'div[contenteditable="true"]'
    };
  } else if (hostname.includes('slack.com')) {
    pageContext = {
      platform: 'slack',
      type: 'chat',
      selector: 'div[data-qa="message_input"]'
    };
  } else if (hostname.includes('discord.com')) {
    pageContext = {
      platform: 'discord',
      type: 'chat',
      selector: 'div[role="textbox"]'
    };
  } else if (hostname.includes('twitter.com') || hostname.includes('x.com')) {
    pageContext = {
      platform: 'twitter',
      type: 'social',
      selector: 'div[data-testid="tweetTextarea_0"]'
    };
  } else if (hostname.includes('linkedin.com')) {
    pageContext = {
      platform: 'linkedin',
      type: 'social',
      selector: 'div[contenteditable="true"]'
    };
  } else if (hostname.includes('messenger.com')) {
    pageContext = {
      platform: 'messenger',
      type: 'chat',
      selector: 'div[contenteditable="true"]'
    };
  } else {
    pageContext = {
      platform: 'generic',
      type: 'web',
      selector: 'textarea, input[type="text"], div[contenteditable="true"]'
    };
  }
  
  console.log('[StyleTalk] Page context:', pageContext);
}

// ==================== FLOATING BUTTON ====================

function injectFloatingButton() {
  console.log('[StyleTalk] injectFloatingButton called');
  
  // Check if button already exists
  const existing = document.getElementById('styletalk-floating-btn');
  if (existing) {
    console.log('[StyleTalk] Button already exists, skipping');
    return;
  }
  
  // Check if body exists
  if (!document.body) {
    console.log('[StyleTalk] document.body not ready, retrying...');
    setTimeout(injectFloatingButton, 100);
    return;
  }
  
  console.log('[StyleTalk] Creating floating button...');
  const button = document.createElement('div');
  button.id = 'styletalk-floating-btn';
  button.className = 'styletalk-floating-btn';
  button.innerHTML = `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M8 10h8M8 14h4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    </svg>
  `;
  button.title = 'Open StyleTalk Assistant (Ctrl+Shift+T)';
  
  button.addEventListener('click', () => {
    console.log('[StyleTalk] Floating button clicked!');
    toggleOverlay();
  });
  
  // Make draggable
  makeDraggable(button);
  
  document.body.appendChild(button);
  console.log('[StyleTalk] Floating button created and appended to body');
  
  // Verify it was added
  setTimeout(() => {
    const check = document.getElementById('styletalk-floating-btn');
    console.log('[StyleTalk] Button verification:', check ? 'SUCCESS' : 'FAILED - button removed or not added');
  }, 100);
}

function makeDraggable(element) {
  let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
  
  element.onmousedown = dragMouseDown;
  
  function dragMouseDown(e) {
    e.preventDefault();
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    document.onmousemove = elementDrag;
  }
  
  function elementDrag(e) {
    e.preventDefault();
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    element.style.top = (element.offsetTop - pos2) + 'px';
    element.style.right = 'auto';
    element.style.bottom = 'auto';
    element.style.left = (element.offsetLeft - pos1) + 'px';
  }
  
  function closeDragElement() {
    document.onmouseup = null;
    document.onmousemove = null;
  }
}

// ==================== TEXT INPUT MONITORING ====================

function monitorTextInputs() {
  // Monitor focus events
  document.addEventListener('focusin', handleFocusIn, true);
  document.addEventListener('focusout', handleFocusOut, true);
  
  // Monitor input events to track conversation
  document.addEventListener('input', handleInput, true);
  
  // Monitor selection changes
  document.addEventListener('selectionchange', handleSelectionChange);
}

function handleFocusIn(event) {
  const element = event.target;
  
  // Check if it's a text input
  if (isTextInput(element)) {
    currentFocusedElement = element;
    console.log('[StyleTalk] Text input focused:', element.tagName);
    
    // Show quick action button near input
    showQuickActionButton(element);
  }
}

function handleFocusOut(event) {
  const element = event.target;
  
  if (element === currentFocusedElement) {
    console.log('[StyleTalk] Text input unfocused');
    // Keep currentFocusedElement for a bit in case user wants to use overlay
    setTimeout(() => {
      if (document.activeElement !== element) {
        hideQuickActionButton();
      }
    }, 500);
  }
}

function handleInput(event) {
  const element = event.target;
  
  if (isTextInput(element)) {
    const text = getElementText(element);
    
    // Track conversation history (last 5 messages)
    if (text.length > 10) {
      conversationHistory.push({
        text,
        timestamp: Date.now(),
        platform: pageContext?.platform
      });
      
      // Keep only last 5
      if (conversationHistory.length > 5) {
        conversationHistory.shift();
      }
    }
  }
}

function handleSelectionChange() {
  const selection = window.getSelection();
  const selectedText = selection.toString().trim();
  
  if (selectedText.length > 0) {
    console.log('[StyleTalk] Text selected:', selectedText.substring(0, 50));
  }
}

function isTextInput(element) {
  if (!element) return false;
  
  const tagName = element.tagName?.toLowerCase();
  const contentEditable = element.contentEditable === 'true';
  const isTextArea = tagName === 'textarea';
  const isTextInput = tagName === 'input' && (
    element.type === 'text' ||
    element.type === 'email' ||
    element.type === 'search' ||
    element.type === 'url'
  );
  
  return contentEditable || isTextArea || isTextInput;
}

function getElementText(element) {
  if (element.tagName?.toLowerCase() === 'textarea' || element.tagName?.toLowerCase() === 'input') {
    return element.value;
  } else if (element.contentEditable === 'true') {
    return element.innerText || element.textContent;
  }
  return '';
}

function setElementText(element, text) {
  if (element.tagName?.toLowerCase() === 'textarea' || element.tagName?.toLowerCase() === 'input') {
    element.value = text;
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
  } else if (element.contentEditable === 'true') {
    element.innerText = text;
    element.dispatchEvent(new Event('input', { bubbles: true }));
  }
}

// ==================== QUICK ACTION BUTTON ====================

function showQuickActionButton(inputElement) {
  // Remove existing button
  hideQuickActionButton();
  
  const button = document.createElement('div');
  button.id = 'styletalk-quick-action';
  button.className = 'styletalk-quick-action';
  button.innerHTML = '✨ StyleTalk';
  button.title = 'Enhance with StyleTalk';
  
  button.addEventListener('click', () => {
    const text = getElementText(inputElement);
    if (text.trim()) {
      showOverlay(text);
    } else {
      showOverlay('');
    }
  });
  
  // Position near input
  const rect = inputElement.getBoundingClientRect();
  button.style.top = `${rect.top + window.scrollY - 40}px`;
  button.style.left = `${rect.left + window.scrollX}px`;
  
  document.body.appendChild(button);
}

function hideQuickActionButton() {
  const button = document.getElementById('styletalk-quick-action');
  if (button) {
    button.remove();
  }
}

// ==================== OVERLAY ====================

function toggleOverlay() {
  if (overlayVisible) {
    hideOverlay();
  } else {
    const text = currentFocusedElement ? getElementText(currentFocusedElement) : '';
    showOverlay(text);
  }
}

function showOverlay(initialText = '') {
  console.log('[StyleTalk] showOverlay called with text:', initialText?.substring(0, 50));
  
  // Check if overlay already exists
  let overlay = document.getElementById('styletalk-overlay');
  
  if (!overlay) {
    console.log('[StyleTalk] Creating new overlay iframe');
    // Create overlay iframe
    overlay = document.createElement('iframe');
    overlay.id = 'styletalk-overlay';
    overlay.src = chrome.runtime.getURL('overlay.html');
    overlay.className = 'styletalk-overlay';
    overlay.style.display = 'block';
    document.body.appendChild(overlay);
    
    console.log('[StyleTalk] Overlay iframe created and appended');
    
    // Wait for iframe to load before sending message
    overlay.onload = () => {
      console.log('[StyleTalk] Overlay iframe loaded');
      sendToOverlay({
        action: 'initialize',
        text: initialText,
        context: pageContext,
        conversationHistory: conversationHistory
      });
    };
  } else {
    console.log('[StyleTalk] Using existing overlay, making visible');
    // Show existing overlay
    overlay.style.display = 'block';
    sendToOverlay({
      action: 'updateText',
      text: initialText
    });
  }
  
  overlayVisible = true;
  console.log('[StyleTalk] overlayVisible set to true');
}

function hideOverlay() {
  console.log('[StyleTalk] hideOverlay called - Stack trace:');
  console.trace();
  
  const overlay = document.getElementById('styletalk-overlay');
  if (overlay) {
    overlay.style.display = 'none';
    console.log('[StyleTalk] Overlay display set to none');
  } else {
    console.log('[StyleTalk] No overlay found to hide');
  }
  overlayVisible = false;
  console.log('[StyleTalk] overlayVisible set to false');
}

function sendToOverlay(message) {
  const overlay = document.getElementById('styletalk-overlay');
  if (overlay && overlay.contentWindow) {
    overlay.contentWindow.postMessage(message, '*');
  }
}

// ==================== MESSAGE HANDLERS ====================

function handleMessage(message, sender, sendResponse) {
  console.log('[Content] Received message:', message.action);
  
  switch (message.action) {
    case 'showOverlay':
      showOverlay(message.text || '');
      sendResponse({ success: true });
      break;
      
    case 'toggleOverlay':
      toggleOverlay();
      sendResponse({ success: true });
      break;
      
    case 'replaceText':
      if (currentFocusedElement) {
        setElementText(currentFocusedElement, message.text);
        sendResponse({ success: true });
      } else {
        sendResponse({ success: false, error: 'No text input focused' });
      }
      break;
      
    case 'showResults':
      showOverlay();
      setTimeout(() => {
        sendToOverlay({
          action: 'displayResults',
          results: message.results
        });
      }, 100);
      sendResponse({ success: true });
      break;
      
    case 'rewriteSelection':
      handleRewriteSelection();
      sendResponse({ success: true });
      break;
      
    default:
      sendResponse({ success: false, error: 'Unknown action' });
  }
  
  return true;
}

async function handleRewriteSelection() {
  const selection = window.getSelection();
  const selectedText = selection.toString().trim();
  
  if (selectedText) {
    showOverlay(selectedText);
  } else if (currentFocusedElement) {
    const text = getElementText(currentFocusedElement);
    showOverlay(text);
  }
}

// ==================== LISTEN TO OVERLAY MESSAGES ====================

window.addEventListener('message', (event) => {
  // Only accept messages from our overlay
  if (event.source !== document.getElementById('styletalk-overlay')?.contentWindow) {
    return;
  }
  
  const message = event.data;
  
  switch (message.action) {
    case 'closeOverlay':
      hideOverlay();
      break;
      
    case 'insertText':
      if (currentFocusedElement) {
        setElementText(currentFocusedElement, message.text);
        hideOverlay();
      }
      break;
      
    case 'copyText':
      navigator.clipboard.writeText(message.text);
      break;
  }
});

console.log('[StyleTalk] Content script initialized');
