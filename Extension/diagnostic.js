// StyleTalk Extension Diagnostic Commands
// Copy and paste these into the browser console (F12) one by one

console.log('=== STYLETALK DIAGNOSTICS ===\n');

// 1. Check if content script loaded
console.log('1. Content script loaded:', typeof initialize !== 'undefined');

// 2. Check button with correct ID
const btnOld = document.querySelector('#styletalk-floating-btn');
const btnNew = document.querySelector('#styletalk-floating-button');
console.log('2. Button (#styletalk-floating-btn):', btnOld);
console.log('   Button (#styletalk-floating-button):', btnNew);

// 3. Check all StyleTalk elements
const allElements = document.querySelectorAll('[id*="styletalk"]');
console.log('3. All StyleTalk elements:', allElements.length);
allElements.forEach(el => console.log('   -', el.id, el.tagName));

// 4. Check overlay
const overlay = document.querySelector('#styletalk-overlay');
console.log('4. Overlay exists:', !!overlay);

// 5. Check if functions exist
console.log('5. Functions available:');
console.log('   - toggleOverlay:', typeof toggleOverlay !== 'undefined');
console.log('   - showOverlay:', typeof showOverlay !== 'undefined');
console.log('   - hideOverlay:', typeof hideOverlay !== 'undefined');

// 6. Manually create button for testing
console.log('\n6. Creating test button...');
const testBtn = document.createElement('div');
testBtn.id = 'styletalk-test-button';
testBtn.style.cssText = 'position:fixed;bottom:20px;right:20px;width:60px;height:60px;background:purple;border-radius:50%;cursor:pointer;z-index:999999;display:flex;align-items:center;justify-content:center;color:white;font-size:24px;';
testBtn.textContent = '✨';
testBtn.onclick = function() {
    console.log('Test button clicked!');
    if (typeof toggleOverlay === 'function') {
        toggleOverlay();
    } else {
        console.error('toggleOverlay function not found');
    }
};
document.body.appendChild(testBtn);
console.log('Test button created! Look for purple circle with ✨ in bottom-right');

console.log('\n=== END DIAGNOSTICS ===');
