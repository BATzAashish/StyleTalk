"""
Text Processing API Routes
Single and multi-tone text rewriting with emotion detection
"""
from flask import Blueprint, request, jsonify, current_app
from app.services.tone_shifter import ToneShifterService
from app.utils.jwt_helper import token_required
from functools import wraps

text_bp = Blueprint('text', __name__)

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

def detect_emotion_and_intent(text: str) -> dict:
    """
    Detect emotion and intent from text using Groq AI
    
    Args:
        text: Input text to analyze
        
    Returns:
        Dict with emotion and intent
    """
    try:
        from groq import Groq
        
        client = Groq(api_key=current_app.config.get('GROQ_API_KEY'))
        
        prompt = f"""Analyze this text and provide:
1. Emotion (one word: positive, negative, neutral, urgent, apologetic, grateful, frustrated, excited)
2. Intent (one word: inform, request, apologize, thank, complain, celebrate, question, decline)

Text: "{text}"

Respond in this exact format:
Emotion: [emotion]
Intent: [intent]"""

        response = client.chat.completions.create(
            model=current_app.config.get('GROQ_MODEL', 'llama-3.3-70b-versatile'),
            messages=[
                {"role": "system", "content": "You are an expert at analyzing text emotion and intent. Always respond in the exact format requested."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            max_tokens=100
        )
        
        result = response.choices[0].message.content.strip()
        lines = result.split('\n')
        
        emotion = "neutral"
        intent = "inform"
        
        for line in lines:
            if line.startswith("Emotion:"):
                emotion = line.split(":", 1)[1].strip().lower()
            elif line.startswith("Intent:"):
                intent = line.split(":", 1)[1].strip().lower()
        
        return {
            'emotion': emotion,
            'intent': intent
        }
        
    except Exception as e:
        print(f"[ERROR] Emotion detection failed: {e}")
        return {
            'emotion': 'neutral',
            'intent': 'inform'
        }

@text_bp.route('/rewrite', methods=['POST'])
@validate_request('text', 'tone')
def rewrite_text():
    """
    Rewrite text in a single tone with emotion/intent detection
    
    Body:
    {
        "text": "Your text here",
        "tone": "formal",
        "use_cache": true (optional)
    }
    
    Response:
    {
        "success": true,
        "original": "...",
        "rewritten": "...",
        "tone": "formal",
        "emotion": "neutral",
        "intent": "inform",
        "cached": false
    }
    """
    try:
        data = request.get_json()
        text = data['text']
        tone = data['tone']
        use_cache = data.get('use_cache', True)
        
        # Validate tone
        valid_tones = ['formal', 'casual', 'friendly', 'professional', 
                      'empathetic', 'confident', 'apologetic', 'neutral',
                      'persuasive', 'concise', 'detailed', 'enthusiastic', 'humorous', 'genz']
        
        if tone.lower() not in valid_tones:
            return jsonify({
                'error': f'Invalid tone. Choose from: {", ".join(valid_tones)}'
            }), 400
        
        # Detect emotion and intent
        analysis = detect_emotion_and_intent(text)
        
        # Rewrite using tone shifter service
        tone_service = ToneShifterService(db=current_app.db)
        result = tone_service.shift_tone(
            text=text,
            target_tone=tone,
            context=None,
            preserve_meaning=True,
            temperature=0.7,
            user_id=None,
            use_cache=use_cache
        )
        
        if not result['success']:
            return jsonify(result), 500
        
        return jsonify({
            'success': True,
            'original': text,
            'rewritten': result['transformed_text'],
            'tone': tone,
            'emotion': analysis['emotion'],
            'intent': analysis['intent'],
            'cached': result.get('cached', False),
            'cache_hit_count': result.get('cache_hit_count', 0)
        }), 200
        
    except Exception as e:
        print(f"[ERROR] Text rewrite failed: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@text_bp.route('/rewrite-multiple', methods=['POST'])
@validate_request('text', 'tones')
def rewrite_multiple():
    """
    Rewrite text in multiple tones at once
    
    Body:
    {
        "text": "Your text here",
        "tones": ["formal", "casual", "friendly"],
        "use_cache": true (optional)
    }
    
    Response:
    {
        "success": true,
        "original": "...",
        "emotion": "neutral",
        "intent": "inform",
        "variations": [
            {
                "tone": "formal",
                "rewritten": "...",
                "cached": false
            },
            ...
        ]
    }
    """
    try:
        data = request.get_json()
        text = data['text']
        tones = data['tones']
        use_cache = data.get('use_cache', True)
        
        # Validate input
        if not isinstance(tones, list):
            return jsonify({'error': 'tones must be an array'}), 400
        
        if len(tones) == 0:
            return jsonify({'error': 'At least one tone is required'}), 400
        
        if len(tones) > 10:
            return jsonify({'error': 'Maximum 10 tones allowed'}), 400
        
        valid_tones = ['formal', 'casual', 'friendly', 'professional', 
                      'empathetic', 'confident', 'apologetic', 'neutral',
                      'persuasive', 'concise', 'detailed', 'enthusiastic', 'humorous', 'genz']
        
        invalid_tones = [t for t in tones if t.lower() not in valid_tones]
        if invalid_tones:
            return jsonify({
                'error': f'Invalid tones: {", ".join(invalid_tones)}. Choose from: {", ".join(valid_tones)}'
            }), 400
        
        # Detect emotion and intent once
        analysis = detect_emotion_and_intent(text)
        
        # Rewrite in all tones (parallel processing)
        tone_service = ToneShifterService(db=current_app.db)
        variations = []
        
        for tone in tones:
            result = tone_service.shift_tone(
                text=text,
                target_tone=tone,
                context=None,
                preserve_meaning=True,
                temperature=0.7,
                user_id=None,
                use_cache=use_cache
            )
            
            if result['success']:
                variations.append({
                    'tone': tone,
                    'rewritten': result['transformed_text'],
                    'cached': result.get('cached', False),
                    'cache_hit_count': result.get('cache_hit_count', 0)
                })
        
        if len(variations) == 0:
            return jsonify({
                'error': 'Failed to generate any variations'
            }), 500
        
        return jsonify({
            'success': True,
            'original': text,
            'emotion': analysis['emotion'],
            'intent': analysis['intent'],
            'total_variations': len(variations),
            'variations': variations
        }), 200
        
    except Exception as e:
        print(f"[ERROR] Multiple rewrite failed: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@text_bp.route('/available-tones', methods=['GET'])
def get_available_tones_for_text():
    """
    Get all available tones for text processing
    
    Response:
    {
        "success": true,
        "tones": ["formal", "casual", ...],
        "total": 13
    }
    """
    try:
        tones = ToneShifterService.get_available_tones()
        return jsonify({
            'success': True,
            'tones': list(tones.keys()),
            'descriptions': tones,
            'total': len(tones)
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
