from app import db
from datetime import datetime


class Category(db.Model):
    __tablename__ = 'categories'

    id          = db.Column(db.Integer, primary_key=True)
    name        = db.Column(db.String(100), unique=True, nullable=False)
    slug        = db.Column(db.String(100), unique=True, nullable=False)
    description = db.Column(db.Text)
    created_at  = db.Column(db.DateTime, default=datetime.utcnow)

    products    = db.relationship('Product', backref='category', lazy='dynamic')

    def to_dict(self):
        return {
            'id':          self.id,
            'name':        self.name,
            'slug':        self.slug,
            'description': self.description,
        }


class ProductImage(db.Model):
    __tablename__ = 'product_images'

    id         = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id', ondelete='CASCADE'), nullable=False)
    url        = db.Column(db.String(500), nullable=False)
    is_primary = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id':         self.id,
            'url':        self.url,
            'is_primary': self.is_primary,
        }


class Product(db.Model):
    __tablename__ = 'products'

    id          = db.Column(db.Integer, primary_key=True)
    name        = db.Column(db.String(255), nullable=False)
    slug        = db.Column(db.String(255), unique=True, nullable=False, index=True)
    description = db.Column(db.Text)
    price       = db.Column(db.Numeric(10, 2), nullable=False)
    sale_price  = db.Column(db.Numeric(10, 2))
    category_id = db.Column(db.Integer, db.ForeignKey('categories.id'), nullable=False, index=True)
    gender      = db.Column(db.String(20), default='ladies')
    stock       = db.Column(db.Integer, nullable=False, default=0)
    sizes       = db.Column(db.JSON)
    colors      = db.Column(db.JSON)
    is_featured = db.Column(db.Boolean, default=False)
    is_active   = db.Column(db.Boolean, default=True)
    created_at  = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at  = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    images      = db.relationship('ProductImage', backref='product', lazy='joined',
                                  cascade='all, delete-orphan',
                                  primaryjoin='Product.id == ProductImage.product_id')
    order_items = db.relationship('OrderItem', backref='product', lazy='dynamic')
    cart_items  = db.relationship('CartItem', backref='product', lazy='dynamic')

    def primary_image(self):
        primary = next((img for img in self.images if img.is_primary), None)
        return primary.url if primary else (self.images[0].url if self.images else None)

    def to_dict(self, detail=False):
        data = {
            'id':          self.id,
            'name':        self.name,
            'slug':        self.slug,
            'price':       float(self.price),
            'sale_price':  float(self.sale_price) if self.sale_price else None,
            'category_id': self.category_id,
            'category':    self.category.to_dict() if self.category else None,
            'gender':      self.gender,
            'stock':       self.stock,
            'sizes':       self.sizes or [],
            'colors':      self.colors or [],
            'is_featured': self.is_featured,
            'is_active':   self.is_active,
            'primary_image': self.primary_image(),
            'images':      [img.to_dict() for img in self.images],
            'created_at':  self.created_at.isoformat() if self.created_at else None,
        }
        if detail:
            data['description'] = self.description
        return data

    def __repr__(self):
        return f'<Product {self.name}>'
