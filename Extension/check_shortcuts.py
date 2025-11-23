"""
Quick Diagnostic - Check Keyboard Shortcuts
"""

import os

print("\n" + "=" * 60)
print("CHECKING KEYBOARD SHORTCUTS IN FILES")
print("=" * 60)

files_to_check = {
    'popup/popup.html': 'Popup UI',
    'content.js': 'Content Script',
    'background.js': 'Background Script',
}

for file, desc in files_to_check.items():
    if not os.path.exists(file):
        print(f"\n❌ {file} not found!")
        continue
        
    with open(file, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    print(f"\n📄 {desc} ({file}):")
    
    found_old = False
    found_new = False
    
    for i, line in enumerate(lines, 1):
        # Check for old shortcut
        if 'Ctrl+Shift+S' in line:
            print(f"   ⚠️  Line {i}: Found OLD shortcut 'Ctrl+Shift+S'")
            print(f"      {line.strip()[:70]}")
            found_old = True
        
        # Check for new shortcut
        if 'Ctrl+Shift+T' in line:
            print(f"   ✅ Line {i}: Found NEW shortcut 'Ctrl+Shift+T'")
            found_new = True
    
    if not found_old and not found_new:
        print("   ℹ️  No keyboard shortcuts found in this file")
    elif found_new and not found_old:
        print("   ✅ All shortcuts updated correctly!")
    elif found_old:
        print("   ⚠️  NEEDS UPDATE: Still has old Ctrl+Shift+S")

print("\n" + "=" * 60)
print("MANIFEST.JSON COMMANDS")
print("=" * 60)

import json
with open('manifest.json', 'r') as f:
    manifest = json.load(f)

if 'commands' in manifest:
    for cmd, data in manifest['commands'].items():
        print(f"\n✅ Command: {cmd}")
        print(f"   Description: {data.get('description', 'N/A')}")
        if 'suggested_key' in data:
            print(f"   Default: {data['suggested_key'].get('default', 'N/A')}")
            print(f"   Mac: {data['suggested_key'].get('mac', 'N/A')}")
else:
    print("❌ No commands found in manifest!")

print("\n" + "=" * 60)
print("NEXT STEPS")
print("=" * 60)
print("""
1. Go to chrome://extensions
2. Find StyleTalk and click RELOAD button
3. Go to chrome://extensions/shortcuts
4. Verify shortcuts:
   • Toggle overlay: Ctrl+Shift+T
   • Rewrite text: Ctrl+Shift+R
5. If wrong, click edit and set manually
6. Test on google.com: Press Ctrl+Shift+T
""")
print("=" * 60 + "\n")
