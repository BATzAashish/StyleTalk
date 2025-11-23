"""
Tone Cache Model for MongoDB
Stores AI-generated tone responses to reduce API calls
"""
from datetime import datetime, timedelta
import hashlib
import json

class ToneCache:
    """Cache model for storing tone shift responses"""
    
    @staticmethod
    def generate_cache_key(text: str, target_tone: str, context: str = None) -> str:
        """
        Generate a unique cache key based on input parameters
        
        Args:
            text: Original text
            target_tone: Target tone
            context: Optional context
            
        Returns:
            MD5 hash as cache key
        """
        cache_data = {
            'text': text.lower().strip(),
            'tone': target_tone.lower().strip(),
            'context': (context or '').lower().strip()
        }
        cache_string = json.dumps(cache_data, sort_keys=True)
        return hashlib.md5(cache_string.encode('utf-8')).hexdigest()
    
    @staticmethod
    def create(text: str, target_tone: str, response: dict, context: str = None, user_id: str = None):
        """
        Create a new cache entry
        
        Args:
            text: Original text
            target_tone: Target tone
            response: AI response data
            context: Optional context
            user_id: Optional user ID for personalized cache
            
        Returns:
            Cache document
        """
        cache_key = ToneCache.generate_cache_key(text, target_tone, context)
        
        return {
            'cache_key': cache_key,
            'text': text,
            'target_tone': target_tone,
            'context': context,
            'response': response,
            'user_id': user_id,  # None for global cache, user_id for personalized
            'hit_count': 0,
            'created_at': datetime.utcnow(),
            'last_accessed': datetime.utcnow(),
            'expires_at': datetime.utcnow() + timedelta(days=30)  # Cache for 30 days
        }
    
    @staticmethod
    def increment_hit_count(db, cache_key: str):
        """Increment the hit count for a cache entry"""
        db.tone_cache.update_one(
            {'cache_key': cache_key},
            {
                '$inc': {'hit_count': 1},
                '$set': {'last_accessed': datetime.utcnow()}
            }
        )
    
    @staticmethod
    def cleanup_expired(db):
        """Remove expired cache entries"""
        result = db.tone_cache.delete_many({
            'expires_at': {'$lt': datetime.utcnow()}
        })
        return result.deleted_count
    
    @staticmethod
    def get_cache_stats(db, user_id: str = None) -> dict:
        """Get cache statistics"""
        query = {'user_id': user_id} if user_id else {'user_id': None}
        
        total_entries = db.tone_cache.count_documents(query)
        total_hits = db.tone_cache.aggregate([
            {'$match': query},
            {'$group': {'_id': None, 'total': {'$sum': '$hit_count'}}}
        ])
        
        hits = list(total_hits)
        total_hit_count = hits[0]['total'] if hits else 0
        
        return {
            'total_entries': total_entries,
            'total_hits': total_hit_count,
            'estimated_api_calls_saved': total_hit_count
        }
