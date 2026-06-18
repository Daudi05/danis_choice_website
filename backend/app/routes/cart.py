from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.order import CartItem
from app.models.product import Product
from app.utils.helpers import success, error, created

cart_bp = Blueprint('cart', __name__)


def get_cart_total(items):
    return sum(
        float(item.product.sale_price or item.product.price) * item.quantity
        for item in items if item.product
    )


@cart_bp.get('')
@jwt_required()
def get_cart():
    uid   = get_jwt_identity()
    items = CartItem.query.filter_by(user_id=uid).all()
    return success({
        'items': [i.to_dict() for i in items],
        'total': get_cart_total(items),
        'count': sum(i.quantity for i in items),
    })


@cart_bp.post('/add')
@jwt_required()
def add_to_cart():
    uid = get_jwt_identity()
    d   = request.get_json() or {}
    product_id = d.get('product_id')
    quantity   = int(d.get('quantity', 1))
    size       = d.get('size')
    color      = d.get('color')

    if not product_id:
        return error('product_id is required')
    if quantity < 1:
        return error('Quantity must be at least 1')

    product = Product.query.filter_by(id=product_id, is_active=True).first()
    if not product:
        return error('Product not found', 404)
    if product.stock < quantity:
        return error(f'Only {product.stock} items in stock')

    existing = CartItem.query.filter_by(
        user_id=uid, product_id=product_id,
        size=size, color=color
    ).first()

    if existing:
        new_qty = existing.quantity + quantity
        if product.stock < new_qty:
            return error(f'Only {product.stock} items available')
        existing.quantity = new_qty
    else:
        item = CartItem(user_id=uid, product_id=product_id,
                        quantity=quantity, size=size, color=color)
        db.session.add(item)

    db.session.commit()

    items = CartItem.query.filter_by(user_id=uid).all()
    return created({
        'items': [i.to_dict() for i in items],
        'total': get_cart_total(items),
        'count': sum(i.quantity for i in items),
    }, 'Added to cart')


@cart_bp.put('/update')
@jwt_required()
def update_cart():
    uid  = get_jwt_identity()
    d    = request.get_json() or {}
    item_id  = d.get('item_id')
    quantity = int(d.get('quantity', 1))

    item = CartItem.query.filter_by(id=item_id, user_id=uid).first()
    if not item:
        return error('Cart item not found', 404)
    if quantity < 1:
        return error('Quantity must be at least 1')
    if item.product and item.product.stock < quantity:
        return error(f'Only {item.product.stock} items in stock')

    item.quantity = quantity
    db.session.commit()

    items = CartItem.query.filter_by(user_id=uid).all()
    return success({
        'items': [i.to_dict() for i in items],
        'total': get_cart_total(items),
        'count': sum(i.quantity for i in items),
    }, 'Cart updated')


@cart_bp.delete('/remove')
@jwt_required()
def remove_from_cart():
    uid     = get_jwt_identity()
    item_id = request.args.get('item_id', type=int)

    item = CartItem.query.filter_by(id=item_id, user_id=uid).first()
    if not item:
        return error('Cart item not found', 404)

    db.session.delete(item)
    db.session.commit()

    items = CartItem.query.filter_by(user_id=uid).all()
    return success({
        'items': [i.to_dict() for i in items],
        'total': get_cart_total(items),
        'count': sum(i.quantity for i in items),
    }, 'Item removed')


@cart_bp.delete('/clear')
@jwt_required()
def clear_cart():
    uid = get_jwt_identity()
    CartItem.query.filter_by(user_id=uid).delete()
    db.session.commit()
    return success({'items': [], 'total': 0, 'count': 0}, 'Cart cleared')
