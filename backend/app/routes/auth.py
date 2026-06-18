from flask import Blueprint, request
from flask_jwt_extended import (
    create_access_token, create_refresh_token,
    jwt_required, get_jwt_identity
)
from app import db, bcrypt, limiter
from app.models.user import User
from app.utils.helpers import success, error, created

auth_bp = Blueprint('auth', __name__)


@auth_bp.post('/register')
@limiter.limit('10 per hour')
def register():
    d = request.get_json() or {}
    name     = (d.get('name') or '').strip()
    email    = (d.get('email') or '').strip().lower()
    password = d.get('password') or ''

    if not all([name, email, password]):
        return error('Name, email and password are required')
    if len(password) < 8:
        return error('Password must be at least 8 characters')
    if User.query.filter_by(email=email).first():
        return error('Email already registered', 409)

    hashed = bcrypt.generate_password_hash(password).decode('utf-8')
    user   = User(name=name, email=email, password=hashed)
    db.session.add(user)
    db.session.commit()

    access  = create_access_token(identity=str(user.id))   # ← str()
    refresh = create_refresh_token(identity=str(user.id))  # ← str()
    return created({
        'access_token':  access,
        'refresh_token': refresh,
        'user':          user.to_dict()
    }, 'Account created successfully')


@auth_bp.post('/login')
@limiter.limit('10 per minute')
def login():
    d = request.get_json() or {}
    email    = (d.get('email') or '').strip().lower()
    password = d.get('password') or ''

    user = User.query.filter_by(email=email).first()
    if not user or not bcrypt.check_password_hash(user.password, password):
        return error('Invalid email or password', 401)
    if not user.is_active:
        return error('Account is deactivated', 403)

    access  = create_access_token(identity=str(user.id))   # ← str()
    refresh = create_refresh_token(identity=str(user.id))  # ← str()
    return success({
        'access_token':  access,
        'refresh_token': refresh,
        'user':          user.to_dict()
    }, 'Login successful')


@auth_bp.post('/refresh')
@jwt_required(refresh=True)
def refresh():
    uid   = get_jwt_identity()
    user  = User.query.get(int(uid))  # ← convert back to int for DB lookup
    if not user or not user.is_active:
        return error('User not found', 401)
    token = create_access_token(identity=str(uid))  # ← str()
    return success({'access_token': token})


@auth_bp.get('/me')
@jwt_required()
def me():
    uid  = get_jwt_identity()
    user = User.query.get(int(uid))  # ← convert back to int for DB lookup
    if not user:
        return error('User not found', 404)
    return success(user.to_dict())


@auth_bp.put('/profile')
@jwt_required()
def update_profile():
    uid  = get_jwt_identity()
    user = User.query.get_or_404(int(uid))  # ← convert back to int for DB lookup
    d    = request.get_json() or {}
    for field in ['name', 'phone', 'address']:
        if field in d:
            setattr(user, field, d[field])
    db.session.commit()
    return success(user.to_dict(), 'Profile updated')