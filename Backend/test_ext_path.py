"""Test Extension directory path"""
import os
import sys

# Add current directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Simulate the path calculation from plugin.py
current_file = os.path.abspath(__file__)
print(f"Current file: {current_file}")

# From Backend/test_ext_path.py
backend_dir = os.path.dirname(current_file)
print(f"Backend dir: {backend_dir}")

# Up to StyleTalk
styletalk_dir = os.path.dirname(backend_dir)
print(f"StyleTalk dir: {styletalk_dir}")

# Into Extension
extension_dir = os.path.join(styletalk_dir, 'Extension')
print(f"Extension dir: {extension_dir}")
print(f"Exists: {os.path.exists(extension_dir)}")

if os.path.exists(extension_dir):
    files = os.listdir(extension_dir)
    print(f"Files ({len(files)}): {files[:5]}...")  # Show first 5
else:
    print("ERROR: Extension directory not found!")
