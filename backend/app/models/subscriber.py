from app import db
from datetime import datetime
import secrets


class Subscriber(db.Model):
    __tablename__ = 'subscribers'

    id           = db.Column(db.Integer, primary_key=True)
    email        = db.Column(db.String(255), unique=True, nullable=False, index=True)
    is_active    = db.Column(db.Boolean, default=True, nullable=False)
    token        = db.Column(db.String(64), unique=True, nullable=False)  # for unsubscribe link
    created_at   = db.Column(db.DateTime, default=datetime.utcnow)

    def __init__(self, email):
        self.email = email.lower().strip()
        self.token = secrets.token_urlsafe(32)

    def to_dict(self):
        return {
            'id':         self.id,
            'email':      self.email,
            'is_active':  self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }