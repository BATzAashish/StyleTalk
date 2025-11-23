from flask import Flask
from flask_cors import CORS
from flask_pymongo import PyMongo
from config import config
import os

mongo = PyMongo()

def create_app(config_name=None):
    """Application factory pattern"""
    app = Flask(__name__)
    
    # Load config
    if config_name is None:
        config_name = os.getenv('FLASK_ENV', 'development')
    app.config.from_object(config[config_name])
    
    # Initialize extensions with proper CORS configuration
    CORS(app, resources={
        r"/api/*": {
            "origins": ["http://localhost:8080", "http://localhost:5173", "http://localhost:3000"],
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"],
            "supports_credentials": True
        }
    })
    mongo.init_app(app)
    
    # Add database instance to app for easy access
    app.db = mongo.db
    
    # Register blueprints
    from app.routes.auth import auth_bp
    from app.routes.tone import tone_bp
    from app.routes.text import text_bp
    from app.routes.preferences import preferences_bp
    from app.routes.plugin import plugin_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(tone_bp, url_prefix='/api/tone')
    app.register_blueprint(text_bp, url_prefix='/api/text')
    app.register_blueprint(preferences_bp, url_prefix='/api/user')
    app.register_blueprint(plugin_bp, url_prefix='/api/plugin')
    
    # Health check route
    @app.route('/health')
    def health_check():
        return {'status': 'ok', 'message': 'StyleTalk API is running'}, 200
    
    return app
