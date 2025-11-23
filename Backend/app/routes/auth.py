from flask import Blueprint, request, jsonify
from app import mongo
from app.models.user import User
from app.utils import (
    validate_email_format,
    validate_password_strength,
    validate_name,
    generate_token
)

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    """
    Register a new user
    Expected JSON: {
        "email": "user@example.com",
        "password": "StrongPass123",
        "name": "John Doe"
    }
    """
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        email = data.get('email', '').strip()
        password = data.get('password', '')
        name = data.get('name', '').strip()
        
        if not all([email, password, name]):
            return jsonify({'error': 'Email, password, and name are required'}), 400
        
        # Validate email
        is_valid_email, email_result = validate_email_format(email)
        if not is_valid_email:
            return jsonify({'error': f'Invalid email: {email_result}'}), 400
        email = email_result  # Use normalized email
        
        # Validate password
        is_strong_password, password_msg = validate_password_strength(password)
        if not is_strong_password:
            return jsonify({'error': password_msg}), 400
        
        # Validate name
        is_valid_name, name_msg = validate_name(name)
        if not is_valid_name:
            return jsonify({'error': name_msg}), 400
        
        # Check if user already exists
        existing_user = mongo.db.users.find_one({'email': email.lower()})
        if existing_user:
            return jsonify({'error': 'User with this email already exists'}), 409
        
        # Create new user
        user_doc = User.create(email, password, name)
        result = mongo.db.users.insert_one(user_doc)
        
        # Generate token
        token = generate_token(str(result.inserted_id), email)
        
        # Get user data (without password)
        user_data = User.to_dict(mongo.db.users.find_one({'_id': result.inserted_id}))
        
        return jsonify({
            'message': 'User registered successfully',
            'token': token,
            'user': user_data
        }), 201
        
    except Exception as e:
        return jsonify({'error': f'Registration failed: {str(e)}'}), 500


@auth_bp.route('/login', methods=['POST'])
def login():
    """
    Login user
    Expected JSON: {
        "email": "user@example.com",
        "password": "StrongPass123"
    }
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        email = data.get('email', '').strip()
        password = data.get('password', '')
        
        if not all([email, password]):
            return jsonify({'error': 'Email and password are required'}), 400
        
        # Find user
        user_doc = mongo.db.users.find_one({'email': email.lower()})
        if not user_doc:
            return jsonify({'error': 'Invalid email or password'}), 401
        
        # Verify password
        if not User.verify_password(user_doc['password'], password):
            return jsonify({'error': 'Invalid email or password'}), 401
        
        # Check if user is active
        if not user_doc.get('is_active', True):
            return jsonify({'error': 'Account is deactivated'}), 403
        
        # Generate token
        token = generate_token(str(user_doc['_id']), user_doc['email'])
        
        # Get user data (without password)
        user_data = User.to_dict(user_doc)
        
        return jsonify({
            'message': 'Login successful',
            'token': token,
            'user': user_data
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Login failed: {str(e)}'}), 500


@auth_bp.route('/me', methods=['GET'])
def get_current_user():
    """
    Get current user info (requires JWT token in Authorization header)
    Header: Authorization: Bearer <token>
    """
    try:
        auth_header = request.headers.get('Authorization')
        
        if not auth_header:
            return jsonify({'error': 'No authorization token provided'}), 401
        
        # Extract token
        parts = auth_header.split()
        if len(parts) != 2 or parts[0].lower() != 'bearer':
            return jsonify({'error': 'Invalid authorization header format'}), 401
        
        token = parts[1]
        
        # Verify token
        from app.utils import verify_token
        is_valid, result = verify_token(token)
        
        if not is_valid:
            return jsonify({'error': result}), 401
        
        # Get user from database
        from bson import ObjectId
        user_doc = mongo.db.users.find_one({'_id': ObjectId(result['user_id'])})
        
        if not user_doc:
            return jsonify({'error': 'User not found'}), 404
        
        user_data = User.to_dict(user_doc)
        
        return jsonify({'user': user_data}), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to get user info: {str(e)}'}), 500
