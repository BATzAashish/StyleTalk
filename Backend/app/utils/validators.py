import re
from email_validator import validate_email, EmailNotValidError

def validate_email_format(email):
    """Validate email format"""
    try:
        # Validate and get normalized email
        validated = validate_email(email, check_deliverability=False)
        return True, validated.email
    except EmailNotValidError as e:
        return False, str(e)

def validate_password_strength(password):
    """
    Validate password strength
    Requirements:
    - At least 8 characters
    - At least one uppercase letter
    - At least one lowercase letter
    - At least one number
    """
    if len(password) < 8:
        return False, "Password must be at least 8 characters long"
    
    if not re.search(r'[A-Z]', password):
        return False, "Password must contain at least one uppercase letter"
    
    if not re.search(r'[a-z]', password):
        return False, "Password must contain at least one lowercase letter"
    
    if not re.search(r'\d', password):
        return False, "Password must contain at least one number"
    
    return True, "Password is strong"

def validate_name(name):
    """Validate name format"""
    if not name or len(name.strip()) < 2:
        return False, "Name must be at least 2 characters long"
    
    if len(name) > 100:
        return False, "Name must be less than 100 characters"
    
    return True, "Valid name"
