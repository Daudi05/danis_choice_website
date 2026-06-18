from app import db
from datetime import datetime


class User(db.Model):
    __tablename__ = 'users'

    id         = db.Column(db.Integer, primary_key=True)
    name       = db.Column(db.String(120), nullable=False)
    email      = db.Column(db.String(255), unique=True, nullable=False, index=True)
    password   = db.Column(db.String(255), nullable=False)
    role       = db.Column(db.String(20), nullable=False, default='customer')
    phone      = db.Column(db.String(20))
    address    = db.Column(db.Text)
    is_active  = db.Column(db.Boolean, default=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    orders     = db.relationship('Order', backref='customer', lazy='dynamic')
    cart_items = db.relationship('CartItem', backref='user', lazy='dynamic', cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'id':         self.id,
            'name':       self.name,
            'email':      self.email,
            'role':       self.role,
            'phone':      self.phone,
            'address':    self.address,
            'is_active':  self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }

    def __repr__(self):
        return f'<User {self.email}>'
