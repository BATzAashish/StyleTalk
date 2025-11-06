from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_pymongo import PyMongo
from bson.objectid import ObjectId
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
import os
import jwt
from functools import wraps
from nlp_service import NLPService

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

# Configuration
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production')
app.config['JSON_SORT_KEYS'] = False
app.config['MONGO_URI'] = os.environ.get('MONGO_URI', 'mongodb://localhost:27017/styletalk')

# Initialize MongoDB
mongo = PyMongo(app)

# Initialize NLP Service
nlp_service = NLPService()

# Auth decorator
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        
        if not token:
            return jsonify({'error': 'Token is missing'}), 401
        
        try:
            if token.startswith('Bearer '):
                token = token[7:]
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
            current_user = mongo.db.users.find_one({'_id': ObjectId(data['user_id'])})
            if not current_user:
                return jsonify({'error': 'User not found'}), 401
        except Exception as e:
            return jsonify({'error': 'Token is invalid', 'details': str(e)}), 401
        
        return f(current_user, *args, **kwargs)
    
    return decorated

# Helper function to serialize MongoDB documents
def serialize_doc(doc):
    if doc is None:
        return None
    doc['_id'] = str(doc['_id'])
    return doc

# Health check endpoint
@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.utcnow().isoformat(),
        'version': '2.0.0',
        'database': 'connected' if mongo.db else 'disconnected'
    }), 200

# ==================== Authentication Endpoints ====================

@app.route('/api/auth/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        
        if not data or 'email' not in data or 'password' not in data:
            return jsonify({'error': 'Email and password are required'}), 400
        
        email = data['email']
        
        # Check if user exists
        if mongo.db.users.find_one({'email': email}):
            return jsonify({'error': 'User already exists'}), 409
        
        # Create new user
        user_data = {
            'email': email,
            'password': generate_password_hash(data['password']),
            'name': data.get('name', ''),
            'created_at': datetime.utcnow(),
            'preferences': {
                'auto_detect': True,
                'show_emojis': True,
                'show_gifs': True,
                'privacy_mode': False,
                'default_style': 'auto',
                'default_language': 'en'
            }
        }
        
        result = mongo.db.users.insert_one(user_data)
        user_id = str(result.inserted_id)
        
        # Generate token
        token = jwt.encode({
            'user_id': user_id,
            'exp': datetime.utcnow().timestamp() + 86400  # 24 hours
        }, app.config['SECRET_KEY'], algorithm="HS256")
        
        return jsonify({
            'message': 'User registered successfully',
            'token': token,
            'user': {
                'id': user_id,
                'email': email,
                'name': data.get('name', '')
            }
        }), 201
    except Exception as e:
        return jsonify({'error': 'Registration failed', 'details': str(e)}), 500

@app.route('/api/auth/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        
        if not data or 'email' not in data or 'password' not in data:
            return jsonify({'error': 'Email and password are required'}), 400
        
        email = data['email']
        password = data['password']
        
        # Find user
        user = mongo.db.users.find_one({'email': email})
        
        if not user or not check_password_hash(user['password'], password):
            return jsonify({'error': 'Invalid credentials'}), 401
        
        # Generate token
        token = jwt.encode({
            'user_id': str(user['_id']),
            'exp': datetime.utcnow().timestamp() + 86400  # 24 hours
        }, app.config['SECRET_KEY'], algorithm="HS256")
        
        return jsonify({
            'message': 'Login successful',
            'token': token,
            'user': {
                'id': str(user['_id']),
                'email': email,
                'name': user.get('name', '')
            }
        }), 200
    except Exception as e:
        return jsonify({'error': 'Login failed', 'details': str(e)}), 500

@app.route('/api/auth/logout', methods=['POST'])
@token_required
def logout(current_user):
    return jsonify({'message': 'Logout successful'}), 200

# ==================== Reply Suggestions Endpoint ====================

@app.route('/api/suggestions/generate', methods=['POST'])
@token_required
def generate_suggestions(current_user):
    """
    Generate AI-powered reply suggestions based on message context
    Analyzes emotion, intent, relationship, and generates multiple style variations
    """
    try:
        data = request.get_json()
        
        if not data or 'message' not in data:
            return jsonify({'error': 'Message is required'}), 400
        
        message = data['message']
        relationship = data.get('relationship', 'professional')
        
        # Analyze message context using NLP
        analysis = nlp_service.analyze_message(message)
        
        # Generate style-based responses
        responses = nlp_service.generate_styled_responses(message, relationship)
        
        # Save to history
        history_entry = {
            'user_id': str(current_user['_id']),
            'input_message': message,
            'relationship': relationship,
            'analysis': analysis,
            'responses': responses,
            'timestamp': datetime.utcnow()
        }
        
        mongo.db.reply_history.insert_one(history_entry)
        
        return jsonify({
            'message': message,
            'analysis': analysis,
            'responses': responses,
            'timestamp': history_entry['timestamp'].isoformat()
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to generate suggestions', 'details': str(e)}), 500

# ==================== Text Processing Endpoints ====================

@app.route('/api/text/process', methods=['POST'])
@token_required
def process_text(current_user):
    """
    Process text with grammar correction, rephrasing, and translation
    """
    try:
        data = request.get_json()
        
        if not data or 'text' not in data:
            return jsonify({'error': 'Text is required'}), 400
        
        text = data['text']
        grammar_correction = data.get('grammarCorrection', False)
        rephrasing = data.get('rephrasing', False)
        translation = data.get('translation', False)
        target_language = data.get('targetLanguage', 'es')
        
        results = []
        
        # Grammar Correction
        if grammar_correction:
            corrected = nlp_service.correct_grammar(text)
            results.append({
                'type': 'grammar',
                'title': 'Grammar Corrected',
                'content': corrected['text'],
                'corrections': corrected.get('corrections', [])
            })
        
        # Rephrasing (Concise, Expanded, Paraphrased)
        if rephrasing:
            rephrased = nlp_service.rephrase_text(text)
            results.extend([
                {
                    'type': 'concise',
                    'title': 'Concise Version',
                    'content': rephrased['concise']
                },
                {
                    'type': 'expanded',
                    'title': 'Expanded Version',
                    'content': rephrased['expanded']
                },
                {
                    'type': 'paraphrased',
                    'title': 'Paraphrased Version',
                    'content': rephrased['paraphrased']
                }
            ])
        
        # Translation
        if translation:
            translated = nlp_service.translate_text(text, target_language)
            results.append({
                'type': 'translation',
                'title': f'Translated to {translated["language_name"]}',
                'content': translated['text'],
                'target_language': target_language
            })
            
            # Add cultural note if available
            cultural_note = nlp_service.get_cultural_note(target_language)
            if cultural_note:
                results.append({
                    'type': 'cultural',
                    'title': 'Cultural Sensitivity Note',
                    'content': cultural_note
                })
        
        # Save to history
        processing_entry = {
            'user_id': str(current_user['_id']),
            'input_text': text,
            'operations': {
                'grammar': grammar_correction,
                'rephrasing': rephrasing,
                'translation': translation,
                'target_language': target_language
            },
            'results': results,
            'timestamp': datetime.utcnow()
        }
        
        mongo.db.text_processing_history.insert_one(processing_entry)
        
        return jsonify({
            'text': text,
            'results': results,
            'timestamp': processing_entry['timestamp'].isoformat()
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Text processing failed', 'details': str(e)}), 500

# ==================== Multi-modal Suggestions Endpoints ====================

@app.route('/api/suggestions/emojis', methods=['POST'])
@token_required
def suggest_emojis(current_user):
    """
    Suggest relevant emojis based on message text, emotion, and context
    """
    try:
        data = request.get_json()
        
        if not data or 'text' not in data:
            return jsonify({'error': 'Text is required'}), 400
        
        text = data['text']
        emotion = data.get('emotion')
        context = data.get('context')
        
        # Get emoji suggestions
        emojis = nlp_service.suggest_emojis(text, emotion, context)
        
        return jsonify({
            'text': text,
            'emojis': emojis,
            'emotion': emotion,
            'context': context
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to suggest emojis', 'details': str(e)}), 500

@app.route('/api/suggestions/gifs', methods=['POST'])
@token_required
def suggest_gifs(current_user):
    """
    Suggest relevant GIF search queries based on message text, emotion, and context
    Returns GIF search queries that can be used with Giphy/Tenor APIs
    """
    try:
        data = request.get_json()
        
        if not data or 'text' not in data:
            return jsonify({'error': 'Text is required'}), 400
        
        text = data['text']
        emotion = data.get('emotion')
        context = data.get('context')
        
        # Get GIF search queries
        gif_queries = nlp_service.suggest_gifs(text, emotion, context)
        
        return jsonify({
            'text': text,
            'gif_queries': gif_queries,
            'emotion': emotion,
            'context': context
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to suggest GIFs', 'details': str(e)}), 500

# ==================== Cultural Etiquette Endpoints ====================

@app.route('/api/cultural/etiquette', methods=['GET'])
@token_required
def get_cultural_etiquette(current_user):
    """
    Get cultural etiquette tips for a specific language/culture
    Query params: language (es, fr, de, ja, zh, ko, it, pt), context (general, business)
    """
    try:
        language = request.args.get('language', 'es')
        context = request.args.get('context', 'general')
        
        # Get cultural etiquette
        etiquette = nlp_service.get_cultural_etiquette(language, context)
        
        return jsonify(etiquette), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to fetch cultural etiquette', 'details': str(e)}), 500

@app.route('/api/cultural/note', methods=['GET'])
@token_required
def get_cultural_note(current_user):
    """
    Get a brief cultural sensitivity note for a language
    Query params: language (es, fr, de, ja, zh, ko)
    """
    try:
        language = request.args.get('language', 'es')
        
        # Get cultural note
        note = nlp_service.get_cultural_note(language)
        
        if note:
            return jsonify({
                'language': language,
                'note': note
            }), 200
        else:
            return jsonify({
                'language': language,
                'note': 'No cultural note available for this language.'
            }), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to fetch cultural note', 'details': str(e)}), 500

# ==================== Feedback Endpoints ====================

@app.route('/api/feedback/suggestion', methods=['POST'])
@token_required
def submit_suggestion_feedback(current_user):
    """
    Submit feedback on a reply suggestion
    Used for improving AI responses and personalization
    """
    try:
        data = request.get_json()
        
        if not data or 'suggestion_id' not in data or 'rating' not in data:
            return jsonify({'error': 'Suggestion ID and rating are required'}), 400
        
        suggestion_id = data['suggestion_id']
        rating = data['rating']  # 1-5 stars or thumbs up/down
        selected = data.get('selected', False)  # Was this suggestion used?
        feedback_text = data.get('feedback_text', '')
        
        # Validate rating
        if not isinstance(rating, (int, float)) or rating < 1 or rating > 5:
            return jsonify({'error': 'Rating must be between 1 and 5'}), 400
        
        # Create feedback entry
        feedback_entry = {
            'user_id': str(current_user['_id']),
            'suggestion_id': suggestion_id,
            'rating': rating,
            'selected': selected,
            'feedback_text': feedback_text,
            'timestamp': datetime.utcnow()
        }
        
        # Store feedback
        result = mongo.db.suggestion_feedback.insert_one(feedback_entry)
        
        # Update user preferences based on feedback (personalization)
        if rating >= 4 and selected:
            # This suggestion was highly rated and used
            # Update user's style preferences
            mongo.db.reply_history.update_one(
                {'_id': suggestion_id},
                {'$set': {'user_liked': True, 'rating': rating}}
            )
        
        return jsonify({
            'message': 'Feedback submitted successfully',
            'feedback_id': str(result.inserted_id)
        }), 201
        
    except Exception as e:
        return jsonify({'error': 'Failed to submit feedback', 'details': str(e)}), 500

@app.route('/api/feedback/text-processing', methods=['POST'])
@token_required
def submit_text_feedback(current_user):
    """
    Submit feedback on text processing results
    """
    try:
        data = request.get_json()
        
        if not data or 'processing_id' not in data or 'rating' not in data:
            return jsonify({'error': 'Processing ID and rating are required'}), 400
        
        processing_id = data['processing_id']
        rating = data['rating']
        helpful = data.get('helpful', True)
        feedback_text = data.get('feedback_text', '')
        
        # Validate rating
        if not isinstance(rating, (int, float)) or rating < 1 or rating > 5:
            return jsonify({'error': 'Rating must be between 1 and 5'}), 400
        
        # Create feedback entry
        feedback_entry = {
            'user_id': str(current_user['_id']),
            'processing_id': processing_id,
            'rating': rating,
            'helpful': helpful,
            'feedback_text': feedback_text,
            'timestamp': datetime.utcnow()
        }
        
        # Store feedback
        result = mongo.db.text_feedback.insert_one(feedback_entry)
        
        # Update the processing history entry
        mongo.db.text_processing_history.update_one(
            {'_id': processing_id},
            {'$set': {'user_rating': rating, 'helpful': helpful}}
        )
        
        return jsonify({
            'message': 'Feedback submitted successfully',
            'feedback_id': str(result.inserted_id)
        }), 201
        
    except Exception as e:
        return jsonify({'error': 'Failed to submit feedback', 'details': str(e)}), 500

@app.route('/api/feedback/stats', methods=['GET'])
@token_required
def get_feedback_stats(current_user):
    """
    Get user's feedback statistics and preferences
    Used for personalization insights
    """
    try:
        user_id = str(current_user['_id'])
        
        # Get average ratings
        suggestion_pipeline = [
            {'$match': {'user_id': user_id}},
            {'$group': {
                '_id': None,
                'avg_rating': {'$avg': '$rating'},
                'total_feedback': {'$sum': 1},
                'selected_count': {'$sum': {'$cond': ['$selected', 1, 0]}}
            }}
        ]
        
        suggestion_stats = list(mongo.db.suggestion_feedback.aggregate(suggestion_pipeline))
        
        text_pipeline = [
            {'$match': {'user_id': user_id}},
            {'$group': {
                '_id': None,
                'avg_rating': {'$avg': '$rating'},
                'total_feedback': {'$sum': 1},
                'helpful_count': {'$sum': {'$cond': ['$helpful', 1, 0]}}
            }}
        ]
        
        text_stats = list(mongo.db.text_feedback.aggregate(text_pipeline))
        
        # Get most liked styles
        style_pipeline = [
            {'$match': {'user_id': user_id, 'user_liked': True}},
            {'$group': {'_id': '$relationship', 'count': {'$sum': 1}}},
            {'$sort': {'count': -1}},
            {'$limit': 5}
        ]
        
        preferred_styles = list(mongo.db.reply_history.aggregate(style_pipeline))
        
        stats = {
            'suggestion_feedback': suggestion_stats[0] if suggestion_stats else {},
            'text_feedback': text_stats[0] if text_stats else {},
            'preferred_styles': [{'style': s['_id'], 'count': s['count']} for s in preferred_styles]
        }
        
        return jsonify({'stats': stats}), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to fetch feedback stats', 'details': str(e)}), 500

# ==================== User Preferences Endpoints ====================

@app.route('/api/preferences', methods=['GET'])
@token_required
def get_preferences(current_user):
    """Get user preferences"""
    try:
        preferences = current_user.get('preferences', {})
        return jsonify({'preferences': preferences}), 200
    except Exception as e:
        return jsonify({'error': 'Failed to fetch preferences', 'details': str(e)}), 500

@app.route('/api/preferences', methods=['PUT'])
@token_required
def update_preferences(current_user):
    """Update user preferences"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'Preferences data is required'}), 400
        
        # Update preferences
        mongo.db.users.update_one(
            {'_id': current_user['_id']},
            {'$set': {'preferences': data}}
        )
        
        return jsonify({
            'message': 'Preferences updated successfully',
            'preferences': data
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to update preferences', 'details': str(e)}), 500

# ==================== History Endpoints ====================

@app.route('/api/history/replies', methods=['GET'])
@token_required
def get_reply_history(current_user):
    """Get user's reply suggestion history"""
    try:
        limit = request.args.get('limit', 50, type=int)
        
        history = list(mongo.db.reply_history.find(
            {'user_id': str(current_user['_id'])}
        ).sort('timestamp', -1).limit(limit))
        
        # Serialize documents
        for item in history:
            item['_id'] = str(item['_id'])
            item['timestamp'] = item['timestamp'].isoformat()
        
        return jsonify({'history': history, 'count': len(history)}), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to fetch history', 'details': str(e)}), 500

@app.route('/api/history/text-processing', methods=['GET'])
@token_required
def get_text_processing_history(current_user):
    """Get user's text processing history"""
    try:
        limit = request.args.get('limit', 50, type=int)
        
        history = list(mongo.db.text_processing_history.find(
            {'user_id': str(current_user['_id'])}
        ).sort('timestamp', -1).limit(limit))
        
        # Serialize documents
        for item in history:
            item['_id'] = str(item['_id'])
            item['timestamp'] = item['timestamp'].isoformat()
        
        return jsonify({'history': history, 'count': len(history)}), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to fetch history', 'details': str(e)}), 500

@app.route('/api/history/clear', methods=['DELETE'])
@token_required
def clear_history(current_user):
    """Clear user's history"""
    try:
        history_type = request.args.get('type', 'all')
        
        if history_type == 'replies' or history_type == 'all':
            mongo.db.reply_history.delete_many({'user_id': str(current_user['_id'])})
        
        if history_type == 'text-processing' or history_type == 'all':
            mongo.db.text_processing_history.delete_many({'user_id': str(current_user['_id'])})
        
        return jsonify({'message': 'History cleared successfully'}), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to clear history', 'details': str(e)}), 500

# ==================== Analytics Endpoint ====================

@app.route('/api/analytics/stats', methods=['GET'])
@token_required
def get_user_stats(current_user):
    """Get user analytics and statistics"""
    try:
        user_id = str(current_user['_id'])
        
        # Count total interactions
        reply_count = mongo.db.reply_history.count_documents({'user_id': user_id})
        text_processing_count = mongo.db.text_processing_history.count_documents({'user_id': user_id})
        
        # Get most used styles
        pipeline = [
            {'$match': {'user_id': user_id}},
            {'$group': {'_id': '$relationship', 'count': {'$sum': 1}}},
            {'$sort': {'count': -1}},
            {'$limit': 5}
        ]
        top_relationships = list(mongo.db.reply_history.aggregate(pipeline))
        
        stats = {
            'total_replies_generated': reply_count,
            'total_text_processed': text_processing_count,
            'total_interactions': reply_count + text_processing_count,
            'top_relationships': [{'type': r['_id'], 'count': r['count']} for r in top_relationships],
            'member_since': current_user['created_at'].isoformat()
        }
        
        return jsonify({'stats': stats}), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to fetch stats', 'details': str(e)}), 500
    
    try:
        sentiment = nlp_service.analyze_sentiment(input_text)
        return jsonify({
            'text': input_text,
            'sentiment': sentiment
        }), 200
    except Exception as e:
        return jsonify({'error': f'Sentiment analysis error: {str(e)}'}), 500

@app.route('/api/detect-emotion', methods=['POST'])
def detect_emotion():
    """
    Dedicated endpoint for emotion detection
    """
    data = request.get_json()
    
    if not data or 'text' not in data:
        return jsonify({'error': 'Text is required'}), 400
    
    input_text = data['text']
    
    try:
        emotions = nlp_service.detect_emotions(input_text)
        return jsonify({
            'text': input_text,
            'emotions': emotions
        }), 200
    except Exception as e:
        return jsonify({'error': f'Emotion detection error: {str(e)}'}), 500

# ==================== User Profile Endpoints ====================

@app.route('/api/user/profile', methods=['GET'])
@token_required
def get_profile(current_user):
    """Get user profile"""
    try:
        profile = {
            'id': str(current_user['_id']),
            'email': current_user['email'],
            'name': current_user.get('name', ''),
            'created_at': current_user['created_at'].isoformat()
        }
        return jsonify({'profile': profile}), 200
    except Exception as e:
        return jsonify({'error': 'Failed to fetch profile', 'details': str(e)}), 500

@app.route('/api/user/profile', methods=['PUT'])
@token_required
def update_profile(current_user):
    """Update user profile"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'Profile data is required'}), 400
        
        # Update allowed fields
        update_fields = {}
        if 'name' in data:
            update_fields['name'] = data['name']
        
        if update_fields:
            mongo.db.users.update_one(
                {'_id': current_user['_id']},
                {'$set': update_fields}
            )
        
        return jsonify({
            'message': 'Profile updated successfully',
            'profile': {
                'email': current_user['email'],
                'name': data.get('name', current_user.get('name', ''))
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to update profile', 'details': str(e)}), 500

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Not found', 'message': str(error)}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error', 'message': str(error)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_ENV') == 'development'
    
    print(f"🚀 StyleTalk API Server starting...")
    print(f"📍 Port: {port}")
    print(f"🔧 Debug Mode: {debug}")
    print(f"🗄️  MongoDB: {app.config['MONGO_URI']}")
    
    app.run(host='0.0.0.0', port=port, debug=debug)
