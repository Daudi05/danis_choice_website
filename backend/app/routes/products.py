from flask import Blueprint, request, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity, verify_jwt_in_request
from sqlalchemy import or_, desc, asc
from app import db
from app.models.product import Product, ProductImage, Category
from app.models.user import User
from app.utils.helpers import success, error, created, paginate_query, slugify
from app.utils.decorators import admin_required
from app.models.subscriber import Subscriber
from app.services.email_service import notify_subscribers_new_product

products_bp = Blueprint('products', __name__)


@products_bp.get('/categories')
def get_categories():
    cats = Category.query.all()
    return success([c.to_dict() for c in cats])


@products_bp.get('')
def list_products():
    page        = request.args.get('page', 1, type=int)
    per_page    = min(request.args.get('per_page', 20, type=int), 100)
    category    = request.args.get('category')
    search      = request.args.get('search')
    sort        = request.args.get('sort', 'newest')
    featured    = request.args.get('featured')
    min_price   = request.args.get('min_price', type=float)
    max_price   = request.args.get('max_price', type=float)

    q = Product.query.filter_by(is_active=True)

    if category:
        cat = Category.query.filter_by(slug=category).first()
        if cat:
            q = q.filter_by(category_id=cat.id)

    if search:
        term = f'%{search}%'
        q = q.filter(or_(
            Product.name.ilike(term),
            Product.description.ilike(term)
        ))

    if featured:
        q = q.filter_by(is_featured=True)

    if min_price is not None:
        q = q.filter(Product.price >= min_price)
    if max_price is not None:
        q = q.filter(Product.price <= max_price)

    sort_map = {
        'newest':     desc(Product.created_at),
        'oldest':     asc(Product.created_at),
        'price_asc':  asc(Product.price),
        'price_desc': desc(Product.price),
        'name':       asc(Product.name),
    }
    q = q.order_by(sort_map.get(sort, desc(Product.created_at)))

    result = paginate_query(q, page, per_page)
    return success(
        [p.to_dict() for p in result['items']],
        pagination={
            'total':    result['total'],
            'page':     result['page'],
            'per_page': result['per_page'],
            'pages':    result['pages'],
            'has_next': result['has_next'],
            'has_prev': result['has_prev'],
        }
    )


@products_bp.get('/<int:product_id>')
def get_product(product_id):
    p = Product.query.filter_by(id=product_id, is_active=True).first_or_404()
    return success(p.to_dict(detail=True))


@products_bp.get('/slug/<slug>')
def get_by_slug(slug):
    p = Product.query.filter_by(slug=slug, is_active=True).first_or_404()
    return success(p.to_dict(detail=True))


@products_bp.post('')
@admin_required
def create_product():
    d = request.get_json() or {}
    required = ['name', 'price', 'category_id', 'stock']
    missing  = [f for f in required if not d.get(f)]
    if missing:
        return error(f'Missing required fields: {", ".join(missing)}')

    base_slug = slugify(d['name'])
    slug      = base_slug
    counter   = 1
    while Product.query.filter_by(slug=slug).first():
        slug = f'{base_slug}-{counter}'
        counter += 1

    product = Product(
        name        = d['name'],
        slug        = slug,
        description = d.get('description', ''),
        price       = float(d['price']),
        sale_price  = float(d['sale_price']) if d.get('sale_price') else None,
        category_id = d['category_id'],
        gender      = d.get('gender', 'ladies'),
        stock       = int(d['stock']),
        sizes       = d.get('sizes', []),
        colors      = d.get('colors', []),
        is_featured = d.get('is_featured', False),
    )

    db.session.add(product)
    db.session.flush()

    for i, url in enumerate(d.get('images', [])):
        img = ProductImage(
            product_id = product.id,
            url        = url,
            is_primary = (i == 0)
        )
        db.session.add(img)

    db.session.commit()

    # ── Notify all active subscribers about the new product ──
    try:
        notify_subscribers_new_product(product)
    except Exception as e:
        print(f'Subscriber notification error: {e}')

    return created(product.to_dict(detail=True), 'Product created')


@products_bp.put('/<int:product_id>')
@admin_required
def update_product(product_id):
    product = Product.query.get_or_404(product_id)
    d       = request.get_json() or {}

    for field in ['name', 'description', 'gender', 'is_featured', 'is_active', 'sizes', 'colors']:
        if field in d:
            setattr(product, field, d[field])

    if 'price' in d:
        product.price = float(d['price'])
    if 'sale_price' in d:
        product.sale_price = float(d['sale_price']) if d['sale_price'] else None
    if 'stock' in d:
        product.stock = int(d['stock'])
    if 'category_id' in d:
        product.category_id = d['category_id']
    if 'name' in d:
        base_slug = slugify(d['name'])
        slug      = base_slug
        counter   = 1
        while True:
            existing = Product.query.filter_by(slug=slug).first()
            if not existing or existing.id == product.id:
                break
            slug = f'{base_slug}-{counter}'
            counter += 1
        product.slug = slug

    if 'images' in d:
        ProductImage.query.filter_by(product_id=product.id).delete()
        for i, url in enumerate(d['images']):
            db.session.add(ProductImage(product_id=product.id, url=url, is_primary=(i == 0)))

    db.session.commit()
    return success(product.to_dict(detail=True), 'Product updated')


@products_bp.delete('/<int:product_id>')
@admin_required
def delete_product(product_id):
    product = Product.query.get_or_404(product_id)
    db.session.delete(product)
    db.session.commit()
    return success(message='Product deleted')