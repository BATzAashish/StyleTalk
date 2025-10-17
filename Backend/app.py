from flask import Flask, jsonify, request
from flask_cors import CORS
from datetime import datetime
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

# Configuration
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production')
app.config['JSON_SORT_KEYS'] = False

# In-memory storage (replace with database in production)
users = {}
history = []

# Health check endpoint
@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.utcnow().isoformat(),
        'version': '1.0.0'
    }), 200

# Authentication endpoints
@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.get_json()
    
    if not data or 'email' not in data or 'password' not in data:
        return jsonify({'error': 'Email and password are required'}), 400
    
    email = data['email']
    
    if email in users:
        return jsonify({'error': 'User already exists'}), 409
    
    users[email] = {
        'email': email,
        'password': data['password'],  # In production, hash the password!
        'name': data.get('name', ''),
        'created_at': datetime.utcnow().isoformat()
    }
    
    return jsonify({
        'message': 'User registered successfully',
        'user': {
            'email': email,
            'name': data.get('name', '')
        }
    }), 201

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    
    if not data or 'email' not in data or 'password' not in data:
        return jsonify({'error': 'Email and password are required'}), 400
    
    email = data['email']
    password = data['password']
    
    if email not in users or users[email]['password'] != password:
        return jsonify({'error': 'Invalid credentials'}), 401
    
    return jsonify({
        'message': 'Login successful',
        'user': {
            'email': email,
            'name': users[email].get('name', '')
        },
        'token': f'mock-token-{email}'  # In production, use JWT
    }), 200

@app.route('/api/auth/logout', methods=['POST'])
def logout():
    return jsonify({'message': 'Logout successful'}), 200

# Text processing endpoints
@app.route('/api/process', methods=['POST'])
def process_text():
    data = request.get_json()
    
    if not data or 'text' not in data:
        return jsonify({'error': 'Text is required'}), 400
    
    input_text = data['text']
    enhancement_type = data.get('type', 'improve')
    
    # Mock processing - replace with actual AI/ML processing
    processed_text = f"Processed ({enhancement_type}): {input_text}"
    
    # Save to history
    history_entry = {
        'id': len(history) + 1,
        'input': input_text,
        'output': processed_text,
        'type': enhancement_type,
        'timestamp': datetime.utcnow().isoformat()
    }
    history.append(history_entry)
    
    return jsonify({
        'original': input_text,
        'processed': processed_text,
        'type': enhancement_type,
        'timestamp': history_entry['timestamp']
    }), 200

@app.route('/api/enhance', methods=['POST'])
def enhance_text():
    data = request.get_json()
    
    if not data or 'text' not in data:
        return jsonify({'error': 'Text is required'}), 400
    
    input_text = data['text']
    style = data.get('style', 'professional')
    
    # Mock enhancement - replace with actual AI/ML processing
    enhancements = {
        'professional': f"Enhanced (Professional): {input_text}",
        'casual': f"Enhanced (Casual): {input_text}",
        'formal': f"Enhanced (Formal): {input_text}",
        'creative': f"Enhanced (Creative): {input_text}"
    }
    
    enhanced_text = enhancements.get(style, f"Enhanced: {input_text}")
    
    return jsonify({
        'original': input_text,
        'enhanced': enhanced_text,
        'style': style
    }), 200

# History endpoints
@app.route('/api/history', methods=['GET'])
def get_history():
    # Get query parameters for pagination
    page = request.args.get('page', 1, type=int)
    limit = request.args.get('limit', 10, type=int)
    
    start = (page - 1) * limit
    end = start + limit
    
    paginated_history = history[start:end]
    
    return jsonify({
        'history': paginated_history,
        'total': len(history),
        'page': page,
        'limit': limit
    }), 200

@app.route('/api/history/<int:history_id>', methods=['GET'])
def get_history_item(history_id):
    for item in history:
        if item['id'] == history_id:
            return jsonify(item), 200
    
    return jsonify({'error': 'History item not found'}), 404

@app.route('/api/history/<int:history_id>', methods=['DELETE'])
def delete_history_item(history_id):
    global history
    
    history = [item for item in history if item['id'] != history_id]
    
    return jsonify({'message': 'History item deleted'}), 200

@app.route('/api/history', methods=['DELETE'])
def clear_history():
    global history
    history = []
    
    return jsonify({'message': 'History cleared'}), 200

# User profile endpoints
@app.route('/api/user/profile', methods=['GET'])
def get_profile():
    # Mock user - in production, get from auth token
    email = request.args.get('email')
    
    if not email or email not in users:
        return jsonify({'error': 'User not found'}), 404
    
    user = users[email]
    return jsonify({
        'email': user['email'],
        'name': user.get('name', ''),
        'created_at': user.get('created_at', '')
    }), 200

@app.route('/api/user/profile', methods=['PUT'])
def update_profile():
    data = request.get_json()
    email = data.get('email')
    
    if not email or email not in users:
        return jsonify({'error': 'User not found'}), 404
    
    if 'name' in data:
        users[email]['name'] = data['name']
    
    return jsonify({
        'message': 'Profile updated successfully',
        'user': {
            'email': users[email]['email'],
            'name': users[email].get('name', '')
        }
    }), 200

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_ENV') == 'development'
    app.run(host='0.0.0.0', port=port, debug=debug)
