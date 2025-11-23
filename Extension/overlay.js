/**
 * StyleTalk Extension - Overlay Script
 * Handles the floating assistant UI
 */

// ==================== STATE ====================

let currentText = '';
let currentContext = null;
let conversationHistory = [];

// ==================== INITIALIZATION ====================

document.addEventListener('DOMContentLoaded', () => {
  console.log('[Overlay] Initialized');
  
  // Setup event listeners
  setupEventListeners();
});

// Listen for messages from content script
window.addEventListener('message', (event) => {
  handleMessage(event.data);
});

function setupEventListeners() {
  // Close button
  document.getElementById('closeBtn').addEventListener('click', closeOverlay);
  
  // Escape key to close
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeOverlay();
    }
  });
  
  // Tone buttons
  document.querySelectorAll('.tone-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      handleQuickToneShift(btn.dataset.tone);
    });
  });
  
  // Action buttons
  document.getElementById('enhanceBtn').addEventListener('click', handleFullEnhancement);
  document.getElementById('grammarBtn').addEventListener('click', handleGrammarOnly);
  document.getElementById('emojiBtn').addEventListener('click', handleAddEmojis);
  
  // Text input
  document.getElementById('inputText').addEventListener('input', (e) => {
    currentText = e.target.value;
  });
}

// ==================== MESSAGE HANDLERS ====================

function handleMessage(message) {
  console.log('[Overlay] Received message:', message.action);
  
  switch (message.action) {
    case 'initialize':
      currentText = message.text || '';
      currentContext = message.context || null;
      conversationHistory = message.conversationHistory || [];
      document.getElementById('inputText').value = currentText;
      break;
      
    case 'updateText':
      currentText = message.text || '';
      document.getElementById('inputText').value = currentText;
      break;
      
    case 'displayResults':
      displayResults(message.results);
      break;
  }
}

// ==================== CLOSE ====================

function closeOverlay() {
  window.parent.postMessage({ action: 'closeOverlay' }, '*');
}

// ==================== QUICK TONE SHIFT ====================

async function handleQuickToneShift(tone) {
  const text = document.getElementById('inputText').value.trim();
  
  if (!text) {
    alert('Please enter some text first!');
    return;
  }
  
  showLoading();
  
  try {
    const response = await chrome.runtime.sendMessage({
      action: 'quickShift',
      text: text,
      targetTone: tone,
      context: currentContext
    });
    
    if (response.shifted_text) {
      displaySingleResult({
        title: `${getToneEmoji(tone)} ${capitalizeFirst(tone)} Tone`,
        text: response.shifted_text,
        type: 'tone_shift',
        tone: tone
      });
    }
  } catch (error) {
    console.error('[Tone Shift Error]', error);
    alert('Failed to shift tone. Please try again.');
  } finally {
    hideLoading();
  }
}

// ==================== FULL ENHANCEMENT ====================

async function handleFullEnhancement() {
  const text = document.getElementById('inputText').value.trim();
  
  if (!text) {
    alert('Please enter some text first!');
    return;
  }
  
  showLoading();
  
  try {
    const response = await chrome.runtime.sendMessage({
      action: 'rewriteText',
      text: text,
      options: {
        enableGrammar: true,
        enableRephrasing: true,
        enableEmojis: true,
        enableGifs: true
      }
    });
    
    displayResults(response);
  } catch (error) {
    console.error('[Full Enhancement Error]', error);
    alert('Failed to enhance text. Please try again.');
  } finally {
    hideLoading();
  }
}

// ==================== GRAMMAR ONLY ====================

async function handleGrammarOnly() {
  const text = document.getElementById('inputText').value.trim();
  
  if (!text) {
    alert('Please enter some text first!');
    return;
  }
  
  showLoading();
  
  try {
    const response = await chrome.runtime.sendMessage({
      action: 'rewriteText',
      text: text,
      options: {
        enableGrammar: true,
        enableRephrasing: false,
        enableEmojis: false,
        enableGifs: false
      }
    });
    
    if (response.grammar_correction) {
      displaySingleResult({
        title: '📝 Grammar Corrected',
        text: response.grammar_correction.corrected_text,
        issues: response.grammar_correction.errors,
        type: 'grammar'
      });
    }
  } catch (error) {
    console.error('[Grammar Error]', error);
    alert('Failed to check grammar. Please try again.');
  } finally {
    hideLoading();
  }
}

// ==================== ADD EMOJIS ====================

async function handleAddEmojis() {
  const text = document.getElementById('inputText').value.trim();
  
  if (!text) {
    alert('Please enter some text first!');
    return;
  }
  
  showLoading();
  
  try {
    const response = await chrome.runtime.sendMessage({
      action: 'rewriteText',
      text: text,
      options: {
        enableGrammar: false,
        enableRephrasing: false,
        enableEmojis: true,
        enableGifs: false
      }
    });
    
    if (response.emoji_suggestions) {
      displaySingleResult({
        title: '😀 With Emojis',
        text: response.emoji_suggestions.enhanced_text,
        emojis: response.emoji_suggestions.suggested_emojis,
        type: 'emoji'
      });
    }
  } catch (error) {
    console.error('[Emoji Error]', error);
    alert('Failed to add emojis. Please try again.');
  } finally {
    hideLoading();
  }
}

// ==================== DISPLAY RESULTS ====================

function displaySingleResult(result) {
  const resultsDiv = document.getElementById('results');
  resultsDiv.innerHTML = '';
  resultsDiv.classList.add('visible');
  
  const card = createResultCard(result);
  resultsDiv.appendChild(card);
}

function displayResults(data) {
  const resultsDiv = document.getElementById('results');
  resultsDiv.innerHTML = '';
  resultsDiv.classList.add('visible');
  
  // Grammar Correction
  if (data.grammar_correction) {
    resultsDiv.appendChild(createResultCard({
      title: '📝 Grammar Corrected',
      text: data.grammar_correction.corrected_text,
      issues: data.grammar_correction.errors,
      type: 'grammar'
    }));
  }
  
  // Tone Variations
  if (data.tone_variations && data.tone_variations.length > 0) {
    data.tone_variations.forEach(variation => {
      resultsDiv.appendChild(createResultCard({
        title: `${getToneEmoji(variation.tone)} ${capitalizeFirst(variation.tone)} Tone`,
        text: variation.text,
        type: 'tone_shift',
        tone: variation.tone
      }));
    });
  }
  
  // Emoji Suggestions
  if (data.emoji_suggestions) {
    resultsDiv.appendChild(createResultCard({
      title: '😀 With Emojis',
      text: data.emoji_suggestions.enhanced_text,
      emojis: data.emoji_suggestions.suggested_emojis,
      type: 'emoji'
    }));
  }
  
  // Translation
  if (data.translation) {
    resultsDiv.appendChild(createResultCard({
      title: `🌍 Translated (${data.translation.target_language})`,
      text: data.translation.translated_text,
      notes: data.translation.cultural_notes,
      type: 'translation'
    }));
  }
}

function createResultCard(result) {
  const card = document.createElement('div');
  card.className = 'result-card';
  
  // Title
  const title = document.createElement('h3');
  title.textContent = result.title;
  card.appendChild(title);
  
  // Text
  const text = document.createElement('p');
  text.textContent = result.text;
  card.appendChild(text);
  
  // Additional info (issues, emojis, notes)
  if (result.issues && result.issues.length > 0) {
    const issuesDiv = document.createElement('div');
    issuesDiv.style.fontSize = '12px';
    issuesDiv.style.color = '#ef4444';
    issuesDiv.style.marginBottom = '12px';
    issuesDiv.innerHTML = `<strong>Issues fixed:</strong> ${result.issues.length}`;
    card.appendChild(issuesDiv);
  }
  
  if (result.emojis && result.emojis.length > 0) {
    const emojisDiv = document.createElement('div');
    emojisDiv.style.fontSize = '12px';
    emojisDiv.style.color = '#666';
    emojisDiv.style.marginBottom = '12px';
    emojisDiv.innerHTML = `<strong>Emojis:</strong> ${result.emojis.join(' ')}`;
    card.appendChild(emojisDiv);
  }
  
  if (result.notes && result.notes.length > 0) {
    const notesDiv = document.createElement('div');
    notesDiv.style.fontSize = '12px';
    notesDiv.style.color = '#666';
    notesDiv.style.marginBottom = '12px';
    notesDiv.innerHTML = `<strong>Cultural Notes:</strong> ${result.notes.join('; ')}`;
    card.appendChild(notesDiv);
  }
  
  // Actions
  const actions = document.createElement('div');
  actions.className = 'result-actions';
  
  const insertBtn = document.createElement('button');
  insertBtn.className = 'btn-insert';
  insertBtn.textContent = '📝 Insert';
  insertBtn.onclick = () => insertText(result.text);
  actions.appendChild(insertBtn);
  
  const copyBtn = document.createElement('button');
  copyBtn.className = 'btn-copy';
  copyBtn.textContent = '📋 Copy';
  copyBtn.onclick = () => copyText(result.text);
  actions.appendChild(copyBtn);
  
  card.appendChild(actions);
  
  return card;
}

// ==================== ACTIONS ====================

function insertText(text) {
  window.parent.postMessage({
    action: 'insertText',
    text: text
  }, '*');
}

function copyText(text) {
  window.parent.postMessage({
    action: 'copyText',
    text: text
  }, '*');
  
  // Show temporary feedback
  const btn = event.target;
  const originalText = btn.textContent;
  btn.textContent = '✓ Copied!';
  btn.style.background = '#10b981';
  btn.style.color = 'white';
  
  setTimeout(() => {
    btn.textContent = originalText;
    btn.style.background = '';
    btn.style.color = '';
  }, 2000);
}

// ==================== LOADING ====================

function showLoading() {
  document.getElementById('loading').classList.add('visible');
  document.getElementById('results').classList.remove('visible');
}

function hideLoading() {
  document.getElementById('loading').classList.remove('visible');
}

// ==================== UTILITIES ====================

function getToneEmoji(tone) {
  const emojis = {
    formal: '✨',
    casual: '😊',
    professional: '💼',
    friendly: '🤗',
    genz: '🔥',
    romantic: '💕',
    authoritative: '👔',
    persuasive: '🎯',
    empathetic: '💙'
  };
  return emojis[tone] || '✨';
}

function capitalizeFirst(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

console.log('[Overlay] Script loaded');
