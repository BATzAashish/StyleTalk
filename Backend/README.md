# GenZ Backend API

Flask backend for the GenZ application.

## Features

- RESTful API endpoints
- User authentication (register, login, logout)
- Text processing and enhancement
- History management
- CORS enabled for React frontend
- Error handling

## Setup

### Prerequisites

- Python 3.8 or higher
- pip

### Installation

1. Create a virtual environment:
```bash
python -m venv venv
```

2. Activate the virtual environment:
- Windows:
  ```bash
  venv\Scripts\activate
  ```
- Mac/Linux:
  ```bash
  source venv/bin/activate
  ```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create a `.env` file:
```bash
copy .env.example .env
```

5. Update the `.env` file with your configuration.

### Running the Server

Development mode:
```bash
python app.py
```

Or with Flask CLI:
```bash
flask run
```

The server will start on `http://localhost:5000`

### Production

For production, use Gunicorn:
```bash
gunicorn app:app
```

## API Endpoints

### Health Check
- `GET /api/health` - Check API health status

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user

### Text Processing
- `POST /api/process` - Process text with enhancement type
- `POST /api/enhance` - Enhance text with specific style

### History
- `GET /api/history` - Get all history (with pagination)
- `GET /api/history/<id>` - Get specific history item
- `DELETE /api/history/<id>` - Delete specific history item
- `DELETE /api/history` - Clear all history

### User Profile
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile

## Request Examples

### Register User
```json
POST /api/auth/register
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

### Process Text
```json
POST /api/process
{
  "text": "Your text here",
  "type": "improve"
}
```

### Enhance Text
```json
POST /api/enhance
{
  "text": "Your text here",
  "style": "professional"
}
```

## Environment Variables

- `FLASK_APP` - Flask application entry point
- `FLASK_ENV` - Environment (development/production)
- `SECRET_KEY` - Secret key for sessions
- `PORT` - Server port (default: 5000)

## Notes

⚠️ **Important for Production:**
- Replace in-memory storage with a proper database (PostgreSQL, MongoDB, etc.)
- Implement proper password hashing (bcrypt, Argon2)
- Use JWT or session-based authentication
- Add request validation and sanitization
- Implement rate limiting
- Add proper logging
- Use environment-specific configurations
- Add API documentation (Swagger/OpenAPI)
- Implement proper error tracking

## Development Tips

- Use a proper ORM like SQLAlchemy for database operations
- Add input validation with libraries like Marshmallow or Pydantic
- Implement middleware for authentication
- Add unit and integration tests
- Use blueprints to organize routes
- Add API versioning
