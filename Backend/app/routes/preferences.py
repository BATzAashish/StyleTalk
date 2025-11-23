"""
User Preferences Routes
Handle user preferences, history, and favorites
"""
from flask import Blueprint, request, jsonify
from app.utils.jwt_helper import token_required
from app.models.user import User
from app.models.conversation_history import ConversationHistory
from datetime import datetime
from bson import ObjectId

preferences_bp = Blueprint('preferences', __name__)

# ==================== USER PREFERENCES ====================

@preferences_bp.route('/preferences', methods=['GET'])
@token_required
def get_preferences(current_user):
    """Get user preferences"""
    try:
        return jsonify({
            'success': True,
            'preferences': current_user.get('preferences', {}),
            'statistics': current_user.get('statistics', {})
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@preferences_bp.route('/preferences', methods=['PUT'])
@token_required
def update_preferences(current_user):
    """Update user preferences"""
    try:
        from flask import current_app
        db = current_app.db
        
        data = request.json
        preferences = data.get('preferences', {})
        
        # Validate preferences
        valid_keys = [
            'default_tone', 'default_language', 'privacy_mode', 'theme',
            'enable_cache', 'enable_emojis', 'enable_gifs',
            'grammar_correction', 'rephrasing', 'translation',
            'relationship_default'
        ]
        
        # Filter to only valid preferences
        filtered_prefs = {k: v for k, v in preferences.items() if k in valid_keys}
        
        # Merge with existing preferences
        current_prefs = current_user.get('preferences', {})
        current_prefs.update(filtered_prefs)
        
        # Update in database
        db.users.update_one(
            {'_id': current_user['_id']},
            User.update_preferences(current_user['_id'], current_prefs)
        )
        
        return jsonify({
            'success': True,
            'message': 'Preferences updated successfully',
            'preferences': current_prefs
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@preferences_bp.route('/preferences/reset', methods=['POST'])
@token_required
def reset_preferences(current_user):
    """Reset preferences to default"""
    try:
        from flask import current_app
        db = current_app.db
        
        default_prefs = {
            'default_tone': 'neutral',
            'default_language': 'en',
            'privacy_mode': 'cloud',
            'theme': 'dark',
            'enable_cache': True,
            'enable_emojis': True,
            'enable_gifs': True,
            'grammar_correction': True,
            'rephrasing': True,
            'translation': False,
            'relationship_default': 'auto'
        }
        
        db.users.update_one(
            {'_id': current_user['_id']},
            User.update_preferences(current_user['_id'], default_prefs)
        )
        
        return jsonify({
            'success': True,
            'message': 'Preferences reset to default',
            'preferences': default_prefs
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


# ==================== CONVERSATION HISTORY ====================

@preferences_bp.route('/history', methods=['GET'])
@token_required
def get_history(current_user):
    """Get conversation history"""
    try:
        from flask import current_app
        db = current_app.db
        
        # Query parameters
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 20))
        search = request.args.get('search')
        is_favorite = request.args.get('favorite')
        tags = request.args.get('tags')
        
        if is_favorite:
            is_favorite = is_favorite.lower() == 'true'
        
        if tags:
            tags = tags.split(',')
        
        # Build query
        query = ConversationHistory.search_query(
            user_id=str(current_user['_id']),
            search_text=search,
            is_favorite=is_favorite,
            tags=tags
        )
        
        # Get total count
        total = db.conversation_history.count_documents(query)
        
        # Get paginated results
        skip = (page - 1) * limit
        history = list(db.conversation_history.find(query)
                      .sort('created_at', -1)
                      .skip(skip)
                      .limit(limit))
        
        # Convert to dict
        history_list = [ConversationHistory.to_dict(h) for h in history]
        
        return jsonify({
            'success': True,
            'history': history_list,
            'pagination': {
                'page': page,
                'limit': limit,
                'total': total,
                'pages': (total + limit - 1) // limit
            }
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@preferences_bp.route('/history', methods=['POST'])
@token_required
def save_history(current_user):
    """Save conversation to history"""
    try:
        from flask import current_app
        db = current_app.db
        
        data = request.json
        input_text = data.get('input_text')
        results = data.get('results', [])
        metadata = data.get('metadata', {})
        
        if not input_text or not results:
            return jsonify({
                'success': False,
                'error': 'input_text and results are required'
            }), 400
        
        # Create history entry
        history_doc = ConversationHistory.create(
            user_id=str(current_user['_id']),
            input_text=input_text,
            results=results,
            metadata=metadata
        )
        
        # Insert into database
        result = db.conversation_history.insert_one(history_doc)
        
        # Update user statistics
        db.users.update_one(
            {'_id': current_user['_id']},
            User.update_statistics(current_user['_id'], {
                'statistics.total_requests': 1
            })
        )
        
        return jsonify({
            'success': True,
            'message': 'Conversation saved to history',
            'history_id': str(result.inserted_id)
        }), 201
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@preferences_bp.route('/history/<history_id>/favorite', methods=['PUT'])
@token_required
def toggle_favorite(current_user, history_id):
    """Toggle favorite status of history entry"""
    try:
        from flask import current_app
        db = current_app.db
        
        # Find history entry
        history = db.conversation_history.find_one({
            '_id': ObjectId(history_id),
            'user_id': str(current_user['_id'])
        })
        
        if not history:
            return jsonify({
                'success': False,
                'error': 'History entry not found'
            }), 404
        
        # Toggle favorite
        new_status = not history.get('is_favorite', False)
        db.conversation_history.update_one(
            {'_id': ObjectId(history_id)},
            {'$set': {'is_favorite': new_status}}
        )
        
        return jsonify({
            'success': True,
            'message': 'Favorite status updated',
            'is_favorite': new_status
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@preferences_bp.route('/history/<history_id>', methods=['DELETE'])
@token_required
def delete_history(current_user, history_id):
    """Delete history entry"""
    try:
        from flask import current_app
        db = current_app.db
        
        result = db.conversation_history.delete_one({
            '_id': ObjectId(history_id),
            'user_id': str(current_user['_id'])
        })
        
        if result.deleted_count == 0:
            return jsonify({
                'success': False,
                'error': 'History entry not found'
            }), 404
        
        return jsonify({
            'success': True,
            'message': 'History entry deleted'
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@preferences_bp.route('/history/clear', methods=['DELETE'])
@token_required
def clear_history(current_user):
    """Clear all history (keep favorites if specified)"""
    try:
        from flask import current_app
        db = current_app.db
        
        keep_favorites = request.args.get('keep_favorites', 'true').lower() == 'true'
        
        query = {'user_id': str(current_user['_id'])}
        if keep_favorites:
            query['is_favorite'] = False
        
        result = db.conversation_history.delete_many(query)
        
        return jsonify({
            'success': True,
            'message': f'Deleted {result.deleted_count} history entries',
            'deleted_count': result.deleted_count
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


# ==================== FAVORITES ====================

@preferences_bp.route('/favorites', methods=['GET'])
@token_required
def get_favorites(current_user):
    """Get all favorite conversations"""
    try:
        from flask import current_app
        db = current_app.db
        
        favorites = list(db.conversation_history.find({
            'user_id': str(current_user['_id']),
            'is_favorite': True
        }).sort('created_at', -1))
        
        favorites_list = [ConversationHistory.to_dict(f) for f in favorites]
        
        return jsonify({
            'success': True,
            'favorites': favorites_list,
            'count': len(favorites_list)
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500
