import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_mail import Mail   # ✅ ADDED

db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()
bcrypt = Bcrypt()
limiter = Limiter(key_func=get_remote_address, storage_uri='memory://')
mail = Mail()   # ✅ ADDED


def create_app(config_name=None):
    app = Flask(__name__)

    env = config_name or os.getenv('FLASK_ENV', 'development')
    from app.config.settings import config
    app.config.from_object(config.get(env, config['default']))

    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

    # -----------------------
    # INIT EXTENSIONS
    # -----------------------
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    bcrypt.init_app(app)
    limiter.init_app(app)
    mail.init_app(app)   

    @jwt.invalid_token_loader
    def invalid_token(reason):
        print(f"INVALID TOKEN: {reason}")
        return {'success': False, 'message': f'Invalid token: {reason}'}, 422

    CORS(
        app,
        resources={r"/api/*": {
            "origins": [
                "https://danis-choice-website-ao9tfxhd6-daudi105.vercel.app/"
            ]
        }},
        supports_credentials=True,
        allow_headers=[
            "Content-Type",
            "Authorization"
        ],
        methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
    )

    # Security headers
    @app.after_request
    def security_headers(response):
        response.headers['X-Content-Type-Options'] = 'nosniff'
        response.headers['X-Frame-Options'] = 'DENY'
        response.headers['X-XSS-Protection'] = '1; mode=block'
        return response

    # Register blueprints
    from app.routes.auth import auth_bp
    from app.routes.products import products_bp
    from app.routes.cart import cart_bp
    from app.routes.orders import orders_bp
    from app.routes.admin import admin_bp
    from app.routes.uploads import uploads_bp
    from app.routes.subscribers import subscribers_bp
    from app.routes.portfolio import portfolio_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(products_bp, url_prefix='/api/products')
    app.register_blueprint(cart_bp, url_prefix='/api/cart')
    app.register_blueprint(orders_bp, url_prefix='/api/orders')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')
    app.register_blueprint(uploads_bp, url_prefix='/api/uploads')
    app.register_blueprint(subscribers_bp, url_prefix='/api/subscribers')
    app.register_blueprint(portfolio_bp, url_prefix="/api")

    @app.get('/api/health')
    def health():
        return {'status': 'ok', 'service': "Danis Choice API"}

    @app.errorhandler(500)
    def server_error(e):
        import traceback
        traceback.print_exc()
        return {
            "success": False,
            "error": str(e)
        }, 500


    return app