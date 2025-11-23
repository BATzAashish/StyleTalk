"""
Tone Shifting API Routes
Real-time contextual tone transformation endpoints
"""
from flask import Blueprint, request, jsonify, current_app
from app.services.tone_shifter import ToneShifterService
from app.utils.jwt_helper import token_required
from app.models.tone_cache import ToneCache
from functools import wraps

tone_bp = Blueprint('tone', __name__)

def validate_request(*required_fields):
    """Decorator to validate required fields in request"""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            data = request.get_json()
            if not data:
                return jsonify({'error': 'No data provided'}), 400
            
            missing_fields = [field for field in required_fields if field not in data]
            if missing_fields:
                return jsonify({
                    'error': f'Missing required fields: {", ".join(missing_fields)}'
                }), 400
            
            return f(*args, **kwargs)
        return decorated_function
    return decorator

@tone_bp.route('/shift', methods=['POST'])
@token_required
@validate_request('text', 'target_tone')
def shift_tone(current_user):
    """
    Shift text tone
    
    Body:
    {
        "text": "Your input text here",
        "target_tone": "professional",
        "context": "optional context",
        "preserve_meaning": true,
        "temperature": 0.7
    }
    """
    try:
        data = request.get_json()
        
        tone_service = ToneShifterService(db=current_app.db)
        result = tone_service.shift_tone(
            text=data['text'],
            target_tone=data['target_tone'],
            context=data.get('context'),
            preserve_meaning=data.get('preserve_meaning', True),
            temperature=data.get('temperature', 0.7),
            user_id=current_user['id'],
            use_cache=data.get('use_cache', True)
        )
        
        if result['success']:
            return jsonify(result), 200
        else:
            return jsonify(result), 500
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@tone_bp.route('/batch-shift', methods=['POST'])
@token_required
@validate_request('texts', 'target_tone')
def batch_shift_tone(current_user):
    """
    Shift tone for multiple texts
    
    Body:
    {
        "texts": ["text1", "text2", "text3"],
        "target_tone": "professional",
        "context": "optional context"
    }
    """
    try:
        data = request.get_json()
        
        if not isinstance(data['texts'], list):
            return jsonify({'error': 'texts must be an array'}), 400
        
        tone_service = ToneShifterService(db=current_app.db)
        results = []
        for text in data['texts']:
            result = tone_service.shift_tone(
                text=text,
                target_tone=data['target_tone'],
                context=data.get('context'),
                user_id=current_user['id'],
                use_cache=data.get('use_cache', True)
            )
            results.append(result)
        
        return jsonify({
            'success': True,
            'results': results,
            'total_processed': len(results)
        }), 200
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@tone_bp.route('/suggest-improvements', methods=['POST'])
@token_required
@validate_request('text', 'current_tone')
def suggest_improvements(current_user):
    """
    Analyze text and suggest tone improvements
    
    Body:
    {
        "text": "Your input text here",
        "current_tone": "casual",
        "target_audience": "optional audience description"
    }
    """
    try:
        data = request.get_json()
        
        tone_service = ToneShifterService()
        result = tone_service.suggest_improvements(
            text=data['text'],
            current_tone=data['current_tone'],
            target_audience=data.get('target_audience')
        )
        
        if result['success']:
            return jsonify(result), 200
        else:
            return jsonify(result), 500
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@tone_bp.route('/tones', methods=['GET'])
def get_available_tones():
    """
    Get all available tone presets
    
    Response:
    {
        "professional": "professional and business-like",
        "casual": "casual and friendly",
        ...
    }
    """
    try:
        tones = ToneShifterService.get_available_tones()
        return jsonify({
            'success': True,
            'tones': tones,
            'total': len(tones)
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@tone_bp.route('/quick-shift', methods=['POST'])
@validate_request('text', 'target_tone')
def quick_shift_tone():
    """
    Quick tone shift without authentication (for testing/demo)
    
    Body:
    {
        "text": "Your input text here",
        "target_tone": "professional"
    }
    """
    try:
        data = request.get_json()
        print(f"[DEBUG] Received request: text='{data['text'][:50]}...', tone={data['target_tone']}")
        
        tone_service = ToneShifterService(db=current_app.db)
        result = tone_service.shift_tone(
            text=data['text'],
            target_tone=data['target_tone'],
            context=data.get('context'),
            temperature=data.get('temperature', 0.7),
            user_id=None,  # Global cache for unauthenticated requests
            use_cache=data.get('use_cache', True)
        )
        
        if result['success']:
            return jsonify(result), 200
        else:
            print(f"[ERROR] Tone shift failed: {result.get('error')}")
            return jsonify(result), 500
            
    except Exception as e:
        print(f"[ERROR] Exception in quick_shift: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@tone_bp.route('/cache/stats', methods=['GET'])
@token_required
def get_cache_stats(current_user):
    """
    Get cache statistics for the current user
    
    Response:
    {
        "success": true,
        "stats": {
            "total_entries": 42,
            "total_hits": 128,
            "estimated_api_calls_saved": 128
        }
    }
    """
    try:
        stats = ToneCache.get_cache_stats(current_app.db, current_user['id'])
        return jsonify({
            'success': True,
            'stats': stats
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@tone_bp.route('/cache/clear', methods=['DELETE'])
@token_required
def clear_user_cache(current_user):
    """
    Clear all cached responses for the current user
    
    Response:
    {
        "success": true,
        "deleted_count": 15
    }
    """
    try:
        result = current_app.db.tone_cache.delete_many({
            'user_id': current_user['id']
        })
        return jsonify({
            'success': True,
            'deleted_count': result.deleted_count
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@tone_bp.route('/cache/cleanup', methods=['POST'])
def cleanup_expired_cache():
    """
    Cleanup expired cache entries (admin/cron endpoint)
    
    Response:
    {
        "success": true,
        "deleted_count": 23
    }
    """
    try:
        deleted_count = ToneCache.cleanup_expired(current_app.db)
        return jsonify({
            'success': True,
            'deleted_count': deleted_count
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
