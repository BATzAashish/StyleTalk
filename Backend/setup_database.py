"""
Database setup script for creating indexes
Run this once to optimize database performance
"""
from pymongo import MongoClient, ASCENDING, DESCENDING
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

MONGODB_URI = os.getenv('MONGODB_URI')

def setup_database():
    """Create necessary indexes for optimal performance"""
    client = MongoClient(MONGODB_URI)
    db = client['styletalk']
    
    print("Setting up database indexes...")
    
    # User collection indexes
    print("\n1. Setting up user collection indexes...")
    db.users.create_index([('email', ASCENDING)], unique=True)
    print("   ✓ Created unique index on email")
    
    # Tone cache collection indexes
    print("\n2. Setting up tone_cache collection indexes...")
    
    # Primary cache key index (unique)
    db.tone_cache.create_index([('cache_key', ASCENDING)], unique=True)
    print("   ✓ Created unique index on cache_key")
    
    # User cache queries
    db.tone_cache.create_index([('user_id', ASCENDING), ('created_at', DESCENDING)])
    print("   ✓ Created compound index on user_id + created_at")
    
    # TTL index for automatic expiry (MongoDB will auto-delete expired documents)
    try:
        db.tone_cache.create_index([('expires_at', ASCENDING)], expireAfterSeconds=0)
        print("   ✓ Created TTL index for automatic expiry")
    except Exception as e:
        if 'IndexOptionsConflict' in str(e):
            # Drop and recreate with TTL
            db.tone_cache.drop_index('expires_at_1')
            db.tone_cache.create_index([('expires_at', ASCENDING)], expireAfterSeconds=0)
            print("   ✓ Updated TTL index for automatic expiry")
        else:
            raise
    
    # Cache hit tracking
    db.tone_cache.create_index([('hit_count', DESCENDING)])
    print("   ✓ Created index on hit_count")
    
    # Text search (optional - for analytics)
    db.tone_cache.create_index([('target_tone', ASCENDING), ('created_at', DESCENDING)])
    print("   ✓ Created compound index on target_tone + created_at")
    
    print("\n✅ Database setup complete!")
    print("\nCreated indexes:")
    print("  - users: email (unique)")
    print("  - tone_cache: cache_key (unique)")
    print("  - tone_cache: user_id + created_at")
    print("  - tone_cache: expires_at (TTL for auto-cleanup)")
    print("  - tone_cache: hit_count")
    print("  - tone_cache: target_tone + created_at")
    
    # Show statistics
    print("\n📊 Collection statistics:")
    print(f"  Users: {db.users.count_documents({})}")
    print(f"  Cache entries: {db.tone_cache.count_documents({})}")
    
    client.close()

if __name__ == '__main__':
    setup_database()
