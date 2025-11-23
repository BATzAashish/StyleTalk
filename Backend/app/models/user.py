from datetime import datetime
from bson import ObjectId
import bcrypt

class User:
    """User model for MongoDB"""
    
    @staticmethod
    def create(email, password, name):
        """Create a new user document"""
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
        
        return {
            'email': email.lower(),
            'password': hashed_password,
            'name': name,
            'preferences': {
                'default_tone': 'neutral',
                'default_language': 'en',
                'privacy_mode': 'cloud',  # local or cloud
                'theme': 'dark',  # dark or light
                'enable_cache': True,
                'enable_emojis': True,
                'enable_gifs': True,
                'grammar_correction': True,
                'rephrasing': True,
                'translation': False,
                'relationship_default': 'auto'  # auto, professional, friend, family
            },
            'statistics': {
                'total_requests': 0,
                'cache_hits': 0,
                'favorite_tone': None,
                'last_active': datetime.utcnow()
            },
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow(),
            'is_active': True
        }
    
    @staticmethod
    def verify_password(stored_password, provided_password):
        """Verify password hash"""
        return bcrypt.checkpw(provided_password.encode('utf-8'), stored_password)
    
    @staticmethod
    def to_dict(user_doc):
        """Convert MongoDB document to dictionary (excluding password)"""
        if not user_doc:
            return None
        
        return {
            'id': str(user_doc['_id']),
            'email': user_doc['email'],
            'name': user_doc['name'],
            'preferences': user_doc.get('preferences', {}),
            'statistics': user_doc.get('statistics', {}),
            'created_at': user_doc['created_at'].isoformat(),
            'is_active': user_doc.get('is_active', True)
        }
    
    @staticmethod
    def update_preferences(user_id, preferences):
        """Update user preferences"""
        return {
            '$set': {
                'preferences': preferences,
                'updated_at': datetime.utcnow()
            }
        }
    
    @staticmethod
    def update_statistics(user_id, stats_update):
        """Update user statistics"""
        return {
            '$inc': stats_update,
            '$set': {
                'statistics.last_active': datetime.utcnow()
            }
        }
