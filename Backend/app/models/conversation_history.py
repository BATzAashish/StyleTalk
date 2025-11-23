"""
Conversation History Model
Stores user's text processing history
"""
from datetime import datetime, timedelta
from bson import ObjectId

class ConversationHistory:
    """Model for storing conversation history"""
    
    @staticmethod
    def create(user_id, input_text, results, metadata=None):
        """Create a new conversation history entry"""
        return {
            'user_id': user_id,
            'input_text': input_text,
            'results': results,  # Array of generated variations
            'metadata': metadata or {
                'source': 'web',  # web, plugin, api
                'features_used': [],
                'processing_time': 0
            },
            'is_favorite': False,
            'tags': [],
            'created_at': datetime.utcnow(),
            'expires_at': datetime.utcnow() + timedelta(days=90)  # Auto-delete after 90 days
        }
    
    @staticmethod
    def to_dict(history_doc):
        """Convert MongoDB document to dictionary"""
        if not history_doc:
            return None
        
        return {
            'id': str(history_doc['_id']),
            'user_id': str(history_doc['user_id']),
            'input_text': history_doc['input_text'],
            'results': history_doc['results'],
            'metadata': history_doc.get('metadata', {}),
            'is_favorite': history_doc.get('is_favorite', False),
            'tags': history_doc.get('tags', []),
            'created_at': history_doc['created_at'].isoformat()
        }
    
    @staticmethod
    def toggle_favorite(history_id):
        """Toggle favorite status"""
        return {
            'history_id': ObjectId(history_id)
        }
    
    @staticmethod
    def add_tags(history_id, tags):
        """Add tags to history entry"""
        return {
            '$addToSet': {
                'tags': {'$each': tags}
            }
        }
    
    @staticmethod
    def search_query(user_id, search_text=None, is_favorite=None, tags=None, limit=50):
        """Build search query for history"""
        query = {'user_id': user_id}
        
        if search_text:
            query['$or'] = [
                {'input_text': {'$regex': search_text, '$options': 'i'}},
                {'results.content': {'$regex': search_text, '$options': 'i'}}
            ]
        
        if is_favorite is not None:
            query['is_favorite'] = is_favorite
        
        if tags:
            query['tags'] = {'$in': tags}
        
        return query
