import os
from dotenv import load_dotenv
load_dotenv()

from app import create_app, db, bcrypt
from app.models.user import User
from app.models.product import Category, Product, ProductImage
from app.models.order import Order, OrderItem

app = create_app()

CATEGORIES = [
    {'name': 'Clothes', 'slug': 'clothes', 'description': "Women's clothing — dresses, tops, trousers and more"},
    {'name': 'Shoes',   'slug': 'shoes',   'description': "Women's shoes — heels, flats, sneakers and boots"},
    {'name': 'Bags',    'slug': 'bags',    'description': "Women's bags — handbags, clutches, totes and backpacks"},
]

PRODUCTS = [
    # CLOTHES
    {
        'name': 'Floral Wrap Midi Dress', 'category_slug': 'clothes',
        'description': 'A stunning floral wrap midi dress crafted from flowing chiffon. Features adjustable tie waist and V-neckline. Perfect for garden parties, brunches and date nights.',
        'price': 4500, 'sale_price': 3800,
        'stock': 50, 'sizes': ['XS','S','M','L','XL'], 'colors': ['Rose','Navy','Ivory'],
        'is_featured': True,
        'images': [
            'https://images.unsplash.com/photo-1572804013427-4d7ca7268217?w=600',
            'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600',
        ],
    },
    {
        'name': 'Classic White Blazer', 'category_slug': 'clothes',
        'description': 'A tailored white blazer that transitions effortlessly from office to evening. Structured shoulders and a relaxed fit make this a wardrobe essential.',
        'price': 6800,
        'stock': 30, 'sizes': ['S','M','L','XL'], 'colors': ['White','Beige','Black'],
        'is_featured': True,
        'images': [
            'https://images.unsplash.com/photo-1594938298603-c8148c4b2efe?w=600',
            'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=600',
        ],
    },
    {
        'name': 'Satin Slip Dress', 'category_slug': 'clothes',
        'description': 'Luxurious satin slip dress with adjustable spaghetti straps and a flowing bias cut. Elegant enough for evening events.',
        'price': 3900, 'sale_price': 3200,
        'stock': 40, 'sizes': ['XS','S','M','L'], 'colors': ['Champagne','Black','Dusty Pink'],
        'is_featured': True,
        'images': [
            'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=600',
            'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=600',
        ],
    },
    {
        'name': 'High-Waist Linen Trousers', 'category_slug': 'clothes',
        'description': 'Breathable linen high-waist trousers with a wide leg cut. Comfortable and chic for both work and weekend wear.',
        'price': 3500,
        'stock': 60, 'sizes': ['XS','S','M','L','XL'], 'colors': ['Sand','Black','Sage'],
        'images': [
            'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600',
        ],
    },
    {
        'name': 'Off-Shoulder Ruffle Top', 'category_slug': 'clothes',
        'description': 'Romantic off-shoulder ruffled top in lightweight fabric. Pairs beautifully with high-waist skirts or jeans.',
        'price': 2800,
        'stock': 45, 'sizes': ['S','M','L'], 'colors': ['White','Black','Blush'],
        'images': [
            'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=600',
        ],
    },
    {
        'name': 'Bodycon Bandage Dress', 'category_slug': 'clothes',
        'description': 'Figure-flattering bandage dress that hugs all the right curves. Perfect for a night out.',
        'price': 5200, 'sale_price': 4500,
        'stock': 25, 'sizes': ['XS','S','M','L'], 'colors': ['Red','Black','Forest Green'],
        'is_featured': True,
        'images': [
            'https://images.unsplash.com/photo-1617922001439-4a2e6562f328?w=600',
        ],
    },
    # SHOES
    {
        'name': 'Strappy Block Heel Sandals', 'category_slug': 'shoes',
        'description': 'Elegant strappy sandals with a comfortable block heel. Gold-tone hardware adds a luxurious touch. Perfect for summer events.',
        'price': 4200,
        'stock': 35, 'sizes': ['36','37','38','39','40'], 'colors': ['Nude','Black','Gold'],
        'is_featured': True,
        'images': [
            'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600',
            'https://images.unsplash.com/photo-1518049362265-d5b2a6467637?w=600',
        ],
    },
    {
        'name': 'Pointed Toe Stiletto Heels', 'category_slug': 'shoes',
        'description': 'Classic pointed toe stilettos that elongate the leg. A power shoe for the modern woman.',
        'price': 5500,
        'stock': 20, 'sizes': ['35','36','37','38','39','40'], 'colors': ['Black','Red','Nude'],
        'images': [
            'https://images.unsplash.com/photo-1596703263926-eb0762ee17e4?w=600',
        ],
    },
    {
        'name': 'White Leather Sneakers', 'category_slug': 'shoes',
        'description': 'Minimalist white leather sneakers with cushioned insoles. The perfect everyday casual shoe.',
        'price': 3800, 'sale_price': 3200,
        'stock': 50, 'sizes': ['36','37','38','39','40','41'], 'colors': ['White','White/Gold'],
        'is_featured': True,
        'images': [
            'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600',
        ],
    },
    {
        'name': 'Chelsea Ankle Boots', 'category_slug': 'shoes',
        'description': 'Smooth leather Chelsea boots with elastic side panels. A wardrobe staple that goes with everything.',
        'price': 7500,
        'stock': 18, 'sizes': ['36','37','38','39','40'], 'colors': ['Black','Tan','Burgundy'],
        'images': [
            'https://images.unsplash.com/photo-1605812860427-4024433a70fd?w=600',
        ],
    },
    # BAGS
    {
        'name': 'Mini Quilted Chain Bag', 'category_slug': 'bags',
        'description': 'Iconic quilted mini bag with gold chain strap. Fits your essentials and elevates any outfit from casual to chic.',
        'price': 8900, 'sale_price': 7500,
        'stock': 15, 'sizes': [], 'colors': ['Black','Beige','Pink','Navy'],
        'is_featured': True,
        'images': [
            'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600',
            'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600',
        ],
    },
    {
        'name': 'Oversized Leather Tote', 'category_slug': 'bags',
        'description': 'Spacious genuine leather tote bag perfect for work and travel. Sturdy handles and magnetic closure.',
        'price': 12000,
        'stock': 10, 'sizes': [], 'colors': ['Tan','Black','Chocolate'],
        'is_featured': True,
        'images': [
            'https://images.unsplash.com/photo-1591561954557-26941169b49e?w=600',
        ],
    },
    {
        'name': 'Velvet Evening Clutch', 'category_slug': 'bags',
        'description': 'Luxurious velvet clutch with crystal embellishment. The perfect companion for formal events and evening outings.',
        'price': 3200,
        'stock': 25, 'sizes': [], 'colors': ['Emerald','Burgundy','Black','Champagne'],
        'images': [
            'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=600',
        ],
    },
    {
        'name': 'Rattan Woven Bucket Bag', 'category_slug': 'bags',
        'description': 'Artisan woven rattan bucket bag with leather trim. A summer essential that adds texture to any look.',
        'price': 4800, 'sale_price': 4000,
        'stock': 22, 'sizes': [], 'colors': ['Natural','Black Trim'],
        'images': [
            'https://images.unsplash.com/photo-1513267048331-5611cad62e41?w=600',
        ],
    },
]


def seed():
    with app.app_context():
        db.create_all()

        # Admin
        if not User.query.filter_by(email='admin@danischoice.com').first():
            pw = bcrypt.generate_password_hash('Admin@2025!').decode('utf-8')
            db.session.add(User(name='Danis Admin', email='admin@danischoice.com', password=pw, role='admin', is_active=True))

        # Demo customer
        if not User.query.filter_by(email='customer@danischoice.com').first():
            pw2 = bcrypt.generate_password_hash('Customer@2025!').decode('utf-8')
            db.session.add(User(name='Jane Doe', email='customer@danischoice.com', password=pw2, role='customer'))

        db.session.flush()

        cat_map = {}
        for c in CATEGORIES:
            cat = Category.query.filter_by(slug=c['slug']).first()
            if not cat:
                cat = Category(name=c['name'], slug=c['slug'], description=c['description'])
                db.session.add(cat)
                db.session.flush()
            cat_map[c['slug']] = cat.id

        for pd in PRODUCTS:
            if not Product.query.filter_by(name=pd['name']).first():
                from app.utils.helpers import slugify
                slug = slugify(pd['name'])
                p = Product(
                    name        = pd['name'],
                    slug        = slug,
                    description = pd['description'],
                    price       = pd['price'],
                    sale_price  = pd.get('sale_price'),
                    category_id = cat_map[pd['category_slug']],
                    stock       = pd['stock'],
                    sizes       = pd['sizes'],
                    colors      = pd['colors'],
                    is_featured = pd.get('is_featured', False),
                )
                db.session.add(p)
                db.session.flush()
                for i, url in enumerate(pd['images']):
                    db.session.add(ProductImage(product_id=p.id, url=url, is_primary=(i == 0)))

        db.session.commit()
        print('✅ Seed complete')
        print('  Admin    → admin@danischoice.com    / Admin@2025!')
        print('  Customer → customer@danischoice.com / Customer@2025!')


if __name__ == '__main__':
    seed()
