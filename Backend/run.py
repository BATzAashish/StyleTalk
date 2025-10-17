"""
Run script for the Flask application
"""
import os
from app import app
from config import config

if __name__ == '__main__':
    env = os.environ.get('FLASK_ENV', 'development')
    app.config.from_object(config.get(env, config['default']))
    
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
