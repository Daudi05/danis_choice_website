from app import db
from datetime import datetime


class Order(db.Model):
    __tablename__ = 'orders'

    id              = db.Column(db.Integer, primary_key=True)
    order_number    = db.Column(db.String(30), unique=True, nullable=False, index=True)
    user_id         = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    status          = db.Column(db.String(30), nullable=False, default='pending')
    subtotal        = db.Column(db.Numeric(12, 2), nullable=False, default=0)
    shipping_fee    = db.Column(db.Numeric(12, 2), nullable=False, default=200)
    total           = db.Column(db.Numeric(12, 2), nullable=False, default=0)
    # Shipping
    shipping_name    = db.Column(db.String(150), nullable=False)
    shipping_phone   = db.Column(db.String(20), nullable=False)
    shipping_address = db.Column(db.Text, nullable=False)
    shipping_city    = db.Column(db.String(100))
    notes           = db.Column(db.Text)
    created_at      = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at      = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    items = db.relationship('OrderItem', backref='order', lazy='joined',
                            cascade='all, delete-orphan')

    STATUS_CHOICES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded']

    def to_dict(self):
        return {
            'id':               self.id,
            'order_number':     self.order_number,
            'status':           self.status,
            'subtotal':         float(self.subtotal),
            'shipping_fee':     float(self.shipping_fee),
            'total':            float(self.total),
            'shipping_name':    self.shipping_name,
            'shipping_phone':   self.shipping_phone,
            'shipping_address': self.shipping_address,
            'shipping_city':    self.shipping_city,
            'notes':            self.notes,
            'items':            [item.to_dict() for item in self.items],
            'customer':         {'id': self.customer.id, 'name': self.customer.name, 'email': self.customer.email} if self.customer else None,
            'created_at':       self.created_at.isoformat() if self.created_at else None,
            'updated_at':       self.updated_at.isoformat() if self.updated_at else None,
        }


class OrderItem(db.Model):
    __tablename__ = 'order_items'

    id         = db.Column(db.Integer, primary_key=True)
    order_id   = db.Column(db.Integer, db.ForeignKey('orders.id', ondelete='CASCADE'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    quantity   = db.Column(db.Integer, nullable=False, default=1)
    price      = db.Column(db.Numeric(10, 2), nullable=False)
    size       = db.Column(db.String(20))
    color      = db.Column(db.String(50))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id':         self.id,
            'product_id': self.product_id,
            'product':    self.product.to_dict() if self.product else None,
            'quantity':   self.quantity,
            'price':      float(self.price),
            'size':       self.size,
            'color':      self.color,
            'subtotal':   float(self.price) * self.quantity,
        }


class CartItem(db.Model):
    __tablename__ = 'cart_items'

    id         = db.Column(db.Integer, primary_key=True)
    user_id    = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    quantity   = db.Column(db.Integer, nullable=False, default=1)
    size       = db.Column(db.String(20))
    color      = db.Column(db.String(50))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    __table_args__ = (
        db.UniqueConstraint('user_id', 'product_id', 'size', 'color', name='uq_cart_user_product'),
    )

    def to_dict(self):
        return {
            'id':         self.id,
            'product_id': self.product_id,
            'product':    self.product.to_dict() if self.product else None,
            'quantity':   self.quantity,
            'size':       self.size,
            'color':      self.color,
            'subtotal':   float(self.product.sale_price or self.product.price) * self.quantity if self.product else 0,
        }
