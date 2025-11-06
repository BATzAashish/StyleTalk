"""
MongoDB Database Initialization Script for StyleTalk
Creates indexes and sets up the database structure
"""

from pymongo import MongoClient, ASCENDING, DESCENDING
import os
from dotenv import load_dotenv

load_dotenv()

# MongoDB connection
MONGO_URI = os.environ.get('MONGO_URI', 'mongodb://localhost:27017/styletalk')
client = MongoClient(MONGO_URI)

# Database
db = client.get_database()

print("🔧 Initializing StyleTalk Database...")

# ==================== Users Collection ====================
print("\n📦 Setting up 'users' collection...")
users = db.users

# Create indexes
users.create_index([('email', ASCENDING)], unique=True)
users.create_index([('created_at', DESCENDING)])

print("✅ Users collection configured")
print("   - Unique index on 'email'")
print("   - Index on 'created_at'")

# ==================== Reply History Collection ====================
print("\n📦 Setting up 'reply_history' collection...")
reply_history = db.reply_history

# Create indexes
reply_history.create_index([('user_id', ASCENDING)])
reply_history.create_index([('timestamp', DESCENDING)])
reply_history.create_index([('user_id', ASCENDING), ('timestamp', DESCENDING)])

print("✅ Reply history collection configured")
print("   - Index on 'user_id'")
print("   - Index on 'timestamp'")
print("   - Compound index on 'user_id' and 'timestamp'")

# ==================== Text Processing History Collection ====================
print("\n📦 Setting up 'text_processing_history' collection...")
text_processing_history = db.text_processing_history

# Create indexes
text_processing_history.create_index([('user_id', ASCENDING)])
text_processing_history.create_index([('timestamp', DESCENDING)])
text_processing_history.create_index([('user_id', ASCENDING), ('timestamp', DESCENDING)])

print("✅ Text processing history collection configured")
print("   - Index on 'user_id'")
print("   - Index on 'timestamp'")
print("   - Compound index on 'user_id' and 'timestamp'")

# ==================== Suggestion Feedback Collection ====================
print("\n📦 Setting up 'suggestion_feedback' collection...")
suggestion_feedback = db.suggestion_feedback

# Create indexes
suggestion_feedback.create_index([('user_id', ASCENDING)])
suggestion_feedback.create_index([('suggestion_id', ASCENDING)])
suggestion_feedback.create_index([('timestamp', DESCENDING)])
suggestion_feedback.create_index([('rating', DESCENDING)])

print("✅ Suggestion feedback collection configured")
print("   - Index on 'user_id'")
print("   - Index on 'suggestion_id'")
print("   - Index on 'timestamp'")
print("   - Index on 'rating'")

# ==================== Text Feedback Collection ====================
print("\n📦 Setting up 'text_feedback' collection...")
text_feedback = db.text_feedback

# Create indexes
text_feedback.create_index([('user_id', ASCENDING)])
text_feedback.create_index([('processing_id', ASCENDING)])
text_feedback.create_index([('timestamp', DESCENDING)])
text_feedback.create_index([('rating', DESCENDING)])

print("✅ Text feedback collection configured")
print("   - Index on 'user_id'")
print("   - Index on 'processing_id'")
print("   - Index on 'timestamp'")
print("   - Index on 'rating'")

# ==================== Database Statistics ====================
print("\n📊 Database Statistics:")
print(f"   - Database: {db.name}")
print(f"   - Collections: {db.list_collection_names()}")

for collection_name in ['users', 'reply_history', 'text_processing_history', 'suggestion_feedback', 'text_feedback']:
    count = db[collection_name].count_documents({})
    indexes = db[collection_name].list_indexes()
    print(f"\n   Collection: {collection_name}")
    print(f"   - Documents: {count}")
    print(f"   - Indexes: {len(list(indexes))}")

print("\n✨ Database initialization complete!")
print("\n🚀 You can now start the Flask application with: python app.py")

client.close()
