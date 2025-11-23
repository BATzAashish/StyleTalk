"""
Plugin/Extension Download Route
Serves the browser extension for download
"""

from flask import Blueprint, jsonify, send_file, request
from functools import wraps
import os
import zipfile
import io

plugin_bp = Blueprint('plugin', __name__)

# Extension directory path
# __file__ is Backend/app/routes/plugin.py
# Go up 3 levels: plugin.py -> routes -> app -> Backend -> StyleTalk, then into Extension
current_dir = os.path.dirname(os.path.abspath(__file__))  # Backend/app/routes
app_dir = os.path.dirname(current_dir)  # Backend/app
backend_dir = os.path.dirname(app_dir)  # Backend
project_root = os.path.dirname(backend_dir)  # StyleTalk
EXTENSION_DIR = os.path.join(project_root, 'Extension')

@plugin_bp.route('/info', methods=['GET'])
def get_plugin_info():
    """Get information about the browser extension"""
    return jsonify({
        'name': 'StyleTalk',
        'version': '1.0.0',
        'description': 'AI-powered writing assistant that works universally across all websites',
        'features': [
            'Universal Overlay',
            'Real-Time Contextual Tone Shifting',
            'Relationship-Aware Messaging',
            'Conversational Memory',
            'Emotion & Intent Detection',
            'Multi-Modal Suggestions (Emoji/GIF)',
            'Privacy-First On-Device AI',
            'Cultural Sensitivity Detection',
            'Learning & Feedback Loop',
            'Instant Message Rewriting'
        ],
        'supported_browsers': ['Chrome', 'Edge', 'Brave', 'Opera'],
        'platforms': [
            'Gmail', 'WhatsApp Web', 'Slack', 'Discord',
            'Twitter/X', 'LinkedIn', 'Facebook Messenger'
        ],
        'size': '~500 KB',
        'last_updated': '2024-01-01',
        'download_url': '/api/plugin/download',
        'install_guide_url': '/api/plugin/guide',
        'support_url': 'http://localhost:8080/help'
    })

@plugin_bp.route('/download', methods=['GET'])
def download_plugin():
    """
    Create and serve a zip file of the extension for download
    """
    try:
        # Create in-memory zip file
        memory_file = io.BytesIO()
        
        with zipfile.ZipFile(memory_file, 'w', zipfile.ZIP_DEFLATED) as zf:
            # Walk through extension directory
            for root, dirs, files in os.walk(EXTENSION_DIR):
                # Skip __pycache__ and other unwanted directories
                dirs[:] = [d for d in dirs if not d.startswith('__') and d != 'node_modules']
                
                for file in files:
                    # Skip unwanted files
                    if file.endswith(('.pyc', '.git', '.DS_Store')):
                        continue
                    
                    file_path = os.path.join(root, file)
                    arcname = os.path.relpath(file_path, EXTENSION_DIR)
                    zf.write(file_path, arcname)
        
        memory_file.seek(0)
        
        return send_file(
            memory_file,
            mimetype='application/zip',
            as_attachment=True,
            download_name='styletalk-extension-v1.0.0.zip'
        )
    
    except Exception as e:
        return jsonify({
            'error': 'Failed to create extension package',
            'message': str(e)
        }), 500

@plugin_bp.route('/guide', methods=['GET'])
def get_installation_guide():
    """Get detailed installation instructions"""
    return jsonify({
        'chrome': {
            'steps': [
                'Download the StyleTalk extension zip file',
                'Extract the zip file to a folder on your computer',
                'Open Chrome and navigate to chrome://extensions/',
                'Enable "Developer mode" using the toggle in the top-right corner',
                'Click "Load unpacked" button',
                'Select the extracted StyleTalk folder',
                'The StyleTalk icon should appear in your browser toolbar!',
                'Pin the extension for easy access'
            ],
            'video_url': 'http://localhost:8080/videos/chrome-install.mp4',
            'troubleshooting': [
                {
                    'issue': 'Extension not loading',
                    'solution': 'Make sure you selected the folder containing manifest.json, not a parent folder'
                },
                {
                    'issue': 'Manifest errors',
                    'solution': 'Ensure all files were extracted properly and manifest.json is not corrupted'
                }
            ]
        },
        'edge': {
            'steps': [
                'Download the StyleTalk extension zip file',
                'Extract the zip file to a folder on your computer',
                'Open Edge and navigate to edge://extensions/',
                'Enable "Developer mode" using the toggle on the left sidebar',
                'Click "Load unpacked" button',
                'Select the extracted StyleTalk folder',
                'The StyleTalk icon should appear in your browser toolbar!',
                'Pin the extension for easy access'
            ],
            'video_url': 'http://localhost:8080/videos/edge-install.mp4'
        },
        'general_tips': [
            'Keep the extracted folder - don\'t delete it after installation',
            'The extension needs the backend running at localhost:5000',
            'Sign in to sync your preferences across devices',
            'Use Ctrl+Shift+S to quickly open the assistant',
            'Try the context menu (right-click) for quick actions'
        ]
    })

@plugin_bp.route('/verify', methods=['GET'])
def verify_plugin_files():
    """Verify that all required extension files exist"""
    required_files = [
        'manifest.json',
        'background.js',
        'content.js',
        'content.css',
        'overlay.html',
        'overlay.js',
        'lib/api.js',
        'popup/popup.html',
        'popup/popup.js',
        'popup/popup.css',
        'README.md'
    ]
    
    missing_files = []
    existing_files = []
    
    for file in required_files:
        file_path = os.path.join(EXTENSION_DIR, file)
        if os.path.exists(file_path):
            existing_files.append(file)
        else:
            missing_files.append(file)
    
    return jsonify({
        'status': 'complete' if not missing_files else 'incomplete',
        'total_files': len(required_files),
        'existing_files': len(existing_files),
        'missing_files': missing_files,
        'details': {
            'extension_dir': EXTENSION_DIR,
            'all_files': existing_files
        }
    })

@plugin_bp.route('/stats', methods=['GET'])
def get_plugin_stats():
    """Get extension download and usage statistics"""
    # TODO: Implement real statistics from database
    return jsonify({
        'total_downloads': 1247,
        'active_users': 892,
        'average_rating': 4.8,
        'total_reviews': 156,
        'supported_platforms': 8,
        'languages': 12,
        'last_update': '2024-01-01',
        'version': '1.0.0'
    })

@plugin_bp.route('/feedback', methods=['POST'])
def submit_plugin_feedback():
    """Submit feedback about the extension"""
    data = request.get_json()
    
    rating = data.get('rating')
    feedback = data.get('feedback')
    email = data.get('email')
    
    # TODO: Save to database
    print(f"[Plugin Feedback] Rating: {rating}, Feedback: {feedback}, Email: {email}")
    
    return jsonify({
        'success': True,
        'message': 'Thank you for your feedback!'
    })

@plugin_bp.route('/changelog', methods=['GET'])
def get_changelog():
    """Get extension version history and changelog"""
    return jsonify({
        'versions': [
            {
                'version': '1.0.0',
                'date': '2024-01-01',
                'changes': [
                    '🎉 Initial release',
                    '✨ Universal overlay with floating assistant',
                    '🔄 Real-time tone shifting (9 tones)',
                    '👥 Relationship-aware messaging',
                    '🧠 Conversational memory',
                    '🎭 Emotion & intent detection',
                    '🎨 Multi-modal suggestions (emoji/GIF)',
                    '🔒 Privacy-first on-device AI',
                    '🌍 Cultural sensitivity detection',
                    '📊 Learning & feedback loop',
                    '⚡ Instant message rewriting'
                ],
                'type': 'major'
            }
        ],
        'upcoming': [
            'Firefox support',
            'Safari support',
            'Offline mode',
            'Voice input',
            'Template library',
            'Team collaboration'
        ]
    })
