from functools import wraps
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
from app.models.user import User
from app.utils.helpers import error


def admin_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        verify_jwt_in_request()
        uid  = get_jwt_identity()
        user = User.query.get(uid)
        if not user or user.role != 'admin':
            return error('Admin access required', 403)
        return fn(*args, **kwargs)
    return wrapper


def login_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        verify_jwt_in_request()
        uid  = get_jwt_identity()
        user = User.query.get(uid)
        if not user or not user.is_active:
            return error('Authentication required', 401)
        return fn(*args, **kwargs)
    return wrapper
