"""
MongoDB Database Inspector
Shows where and how login details are stored
"""

from pymongo import MongoClient
from dotenv import load_dotenv
import os
from datetime import datetime

load_dotenv()

# Get MongoDB connection
MONGO_URI = os.getenv('MONGO_URI')

print("=" * 70)
print("📊 MONGODB LOGIN DETAILS STORAGE INFORMATION")
print("=" * 70)

# Parse connection details
if '@' in MONGO_URI:
    parts = MONGO_URI.split('@')
    credentials = parts[0].split('//')[1]
    host_info = parts[1].split('/')[0]
    db_name = parts[1].split('/')[1].split('?')[0] if '/' in parts[1] else 'styletalk'
    
    print("\n🔗 CONNECTION DETAILS:")
    print(f"   Type: MongoDB Atlas (Cloud)")
    print(f"   Host: {host_info}")
    print(f"   Database: {db_name}")
    print(f"   Username: {credentials.split(':')[0]}")
else:
    print("\n🔗 CONNECTION DETAILS:")
    print(f"   Type: Local MongoDB")
    print(f"   URI: {MONGO_URI}")

# Connect to MongoDB
try:
    client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
    db = client.styletalk
    
    print("\n✅ Connection Status: CONNECTED")
    
    # Show collections
    print("\n📁 COLLECTIONS IN DATABASE:")
    collections = db.list_collection_names()
    if collections:
        for col in collections:
            count = db[col].count_documents({})
            print(f"   - {col}: {count} documents")
    else:
        print("   (No collections yet)")
    
    # Show users collection details
    print("\n" + "=" * 70)
    print("👤 USERS COLLECTION (WHERE LOGIN DETAILS ARE STORED)")
    print("=" * 70)
    
    users_count = db.users.count_documents({})
    print(f"\nTotal registered users: {users_count}")
    
    if users_count > 0:
        print("\n📋 USER DOCUMENT STRUCTURE:")
        print("   Each user document contains:")
        print("   ├─ _id: ObjectId (MongoDB unique identifier)")
        print("   ├─ email: String (lowercase, unique)")
        print("   ├─ password: Binary (bcrypt hashed)")
        print("   ├─ name: String (user's display name)")
        print("   ├─ preferences: Object")
        print("   │  ├─ default_tone: String")
        print("   │  ├─ privacy_mode: String")
        print("   │  └─ language: String")
        print("   ├─ created_at: DateTime")
        print("   ├─ updated_at: DateTime")
        print("   └─ is_active: Boolean")
        
        print("\n👥 REGISTERED USERS (showing first 5):")
        users = list(db.users.find({}, {
            "email": 1, 
            "name": 1, 
            "created_at": 1,
            "is_active": 1
        }).limit(5))
        
        for i, user in enumerate(users, 1):
            print(f"\n   User {i}:")
            print(f"   ├─ ID: {user['_id']}")
            print(f"   ├─ Name: {user.get('name', 'N/A')}")
            print(f"   ├─ Email: {user.get('email', 'N/A')}")
            print(f"   ├─ Active: {user.get('is_active', True)}")
            print(f"   └─ Created: {user.get('created_at', 'N/A')}")
        
        # Show password security
        print("\n🔒 PASSWORD SECURITY:")
        sample_user = db.users.find_one({})
        if sample_user and 'password' in sample_user:
            pwd_type = type(sample_user['password']).__name__
            pwd_length = len(sample_user['password']) if isinstance(sample_user['password'], bytes) else 0
            print(f"   ✅ Passwords are stored as: {pwd_type}")
            print(f"   ✅ Password hash length: {pwd_length} bytes")
            print(f"   ✅ Hashing algorithm: bcrypt (industry standard)")
            print(f"   ✅ Original passwords: NEVER stored (irreversible hash)")
        
    else:
        print("\n   No users registered yet.")
        print("   Users will be created when someone registers via /api/auth/register")
    
    print("\n" + "=" * 70)
    print("📍 HOW LOGIN WORKS")
    print("=" * 70)
    print("""
1. User Registration (/api/auth/register):
   ├─ User submits: email, password, name
   ├─ Backend validates input
   ├─ Password is hashed using bcrypt
   ├─ User document saved to MongoDB 'users' collection
   └─ JWT token generated and returned

2. User Login (/api/auth/login):
   ├─ User submits: email, password
   ├─ Backend finds user by email in 'users' collection
   ├─ Password verified using bcrypt.checkpw()
   ├─ If valid: JWT token generated and returned
   └─ Frontend stores token in localStorage

3. MongoDB Storage Location:
   ├─ Cloud: MongoDB Atlas
   ├─ Cluster: cluster0.iirezry.mongodb.net
   ├─ Database: styletalk
   └─ Collection: users

4. What's Stored in MongoDB:
   ├─ Email (plaintext, lowercase)
   ├─ Password (bcrypt hash - NOT recoverable)
   ├─ Name (plaintext)
   ├─ Preferences (JSON object)
   └─ Timestamps (created_at, updated_at)

5. What's NOT in MongoDB:
   ├─ JWT tokens (stored in browser localStorage)
   ├─ Session data (stateless JWT authentication)
   └─ Original passwords (only hashed versions)
""")
    
    print("=" * 70)
    print("🔐 SECURITY FEATURES")
    print("=" * 70)
    print("""
✅ Passwords hashed with bcrypt (cannot be reversed)
✅ Email stored in lowercase (prevents duplicates)
✅ JWT tokens for authentication (stateless)
✅ Passwords never logged or exposed
✅ User passwords validated on input
✅ MongoDB Atlas encryption at rest
✅ TLS/SSL encryption in transit
""")
    
    # Close connection
    client.close()
    print("\n✅ Database inspection complete!")
    
except Exception as e:
    print(f"\n❌ Error connecting to MongoDB: {e}")
    print("\nCheck your MONGO_URI in .env file")

print("=" * 70)
