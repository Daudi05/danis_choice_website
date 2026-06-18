from flask import Blueprint, request
from sqlalchemy import func
from app import db
from app.models.user import User
from app.models.product import Product
from app.models.order import Order, OrderItem
from app.utils.helpers import success, error, paginate_query
from app.utils.decorators import admin_required

admin_bp = Blueprint('admin', __name__)


@admin_bp.get('/dashboard')
@admin_required
def dashboard():
    total_revenue = db.session.query(func.sum(Order.total)).filter(
        Order.status.notin_(['cancelled', 'refunded'])
    ).scalar() or 0

    total_orders    = Order.query.count()
    total_products  = Product.query.filter_by(is_active=True).count()
    total_customers = User.query.filter_by(role='customer').count()
    pending_orders  = Order.query.filter_by(status='pending').count()

    # Recent orders
    recent_orders = Order.query.order_by(Order.created_at.desc()).limit(8).all()

    # Top products
    top_products = db.session.query(
        Product, func.sum(OrderItem.quantity).label('total_sold')
    ).join(OrderItem).group_by(Product.id).order_by(
        func.sum(OrderItem.quantity).desc()
    ).limit(5).all()

    # Orders by status
    status_counts = db.session.query(
        Order.status, func.count(Order.id)
    ).group_by(Order.status).all()

    return success({
        'metrics': {
            'total_revenue':   float(total_revenue),
            'total_orders':    total_orders,
            'total_products':  total_products,
            'total_customers': total_customers,
            'pending_orders':  pending_orders,
        },
        'recent_orders': [o.to_dict() for o in recent_orders],
        'top_products': [
            {'product': p.to_dict(), 'total_sold': int(sold)}
            for p, sold in top_products
        ],
        'status_breakdown': [
            {'status': s, 'count': c} for s, c in status_counts
        ],
    })


@admin_bp.get('/customers')
@admin_required
def list_customers():
    page   = request.args.get('page', 1, type=int)
    search = request.args.get('search')
    q      = User.query.filter_by(role='customer')
    if search:
        term = f'%{search}%'
        q = q.filter(
            db.or_(User.name.ilike(term), User.email.ilike(term))
        )
    result = paginate_query(q.order_by(User.created_at.desc()), page, 20)
    return success(
        [u.to_dict() for u in result['items']],
        pagination={'total': result['total'], 'page': result['page'], 'pages': result['pages']}
    )


@admin_bp.patch('/customers/<int:uid>/toggle')
@admin_required
def toggle_customer(uid):
    user = User.query.get_or_404(uid)
    user.is_active = not user.is_active
    db.session.commit()
    return success(user.to_dict(), f"User {'activated' if user.is_active else 'deactivated'}")
