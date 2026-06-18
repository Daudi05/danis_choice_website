from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.order import Order, OrderItem, CartItem
from app.models.product import Product
from app.models.user import User
from app.utils.helpers import success, error, created, paginate_query, generate_order_number
from app.utils.decorators import admin_required
import threading
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

orders_bp = Blueprint('orders', __name__)

ADMIN_EMAIL    = 'aluochberyl64@gmail.com'
GMAIL_USER     = 'aluochberyl64@gmail.com'
GMAIL_PASSWORD = 'qgns tohk nueb yicb'


def _send_order_notification(app, order_id):
    """Send order notification email to admin in a background thread."""
    with app.app_context():
        try:
            order = Order.query.get(order_id)
            if not order:
                return

            customer = User.query.get(order.user_id)
            customer_name  = customer.name  if customer else order.shipping_name
            customer_email = customer.email if customer else '—'

            # Build items rows
            items_rows = ''
            for item in order.items:
                product_name = item.product.name if item.product else f'Product #{item.product_id}'
                subtotal     = float(item.price) * item.quantity
                items_rows += f'''
                <tr>
                  <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;font-size:13px;color:#333;">{product_name}</td>
                  <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;font-size:13px;color:#333;text-align:center;">{item.quantity}</td>
                  <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;font-size:13px;color:#333;text-align:right;">KES {float(item.price):,.0f}</td>
                  <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;font-size:13px;font-weight:600;color:#1a1a1a;text-align:right;">KES {subtotal:,.0f}</td>
                </tr>'''

            html = f'''
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#f8f8f8;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f8f8;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;max-width:600px;width:100%;">

        <!-- Header -->
        <tr>
          <td style="background:#1a1a1a;padding:28px 40px;text-align:center;">
            <div style="font-size:24px;font-weight:700;letter-spacing:6px;color:#fff;">DANIS</div>
            <div style="font-size:10px;letter-spacing:8px;color:#c9867c;margin-top:2px;">CHOICE · ADMIN</div>
          </td>
        </tr>

        <!-- Alert bar -->
        <tr>
          <td style="background:#c9867c;padding:12px 40px;text-align:center;">
            <span style="font-size:13px;font-weight:700;letter-spacing:1px;color:white;">🛍️ New Order Received — {order.order_number}</span>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:36px 40px 28px;">

            <!-- Order meta -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
              <tr>
                <td width="50%" style="vertical-align:top;">
                  <div style="font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#c9867c;margin-bottom:6px;">Order Number</div>
                  <div style="font-size:15px;font-weight:700;color:#1a1a1a;">{order.order_number}</div>
                </td>
                <td width="50%" style="vertical-align:top;text-align:right;">
                  <div style="font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#c9867c;margin-bottom:6px;">Order Total</div>
                  <div style="font-size:18px;font-weight:700;color:#c9867c;">KES {float(order.total):,.0f}</div>
                </td>
              </tr>
            </table>

            <!-- Customer info -->
            <div style="background:#faf9f7;border-radius:12px;padding:20px 24px;margin-bottom:24px;">
              <div style="font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#888;margin-bottom:14px;">Customer Details</div>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="font-size:13px;color:#888;padding:4px 0;width:120px;">Name</td>
                  <td style="font-size:13px;color:#1a1a1a;font-weight:600;padding:4px 0;">{customer_name}</td>
                </tr>
                <tr>
                  <td style="font-size:13px;color:#888;padding:4px 0;">Email</td>
                  <td style="font-size:13px;color:#1a1a1a;padding:4px 0;">{customer_email}</td>
                </tr>
                <tr>
                  <td style="font-size:13px;color:#888;padding:4px 0;">Phone</td>
                  <td style="font-size:13px;color:#1a1a1a;font-weight:600;padding:4px 0;">{order.shipping_phone}</td>
                </tr>
                <tr>
                  <td style="font-size:13px;color:#888;padding:4px 0;">Address</td>
                  <td style="font-size:13px;color:#1a1a1a;padding:4px 0;">{order.shipping_address}{(', ' + order.shipping_city) if order.shipping_city else ''}</td>
                </tr>
                {('<tr><td style="font-size:13px;color:#888;padding:4px 0;">Notes</td><td style="font-size:13px;color:#1a1a1a;padding:4px 0;">' + order.notes + '</td></tr>') if order.notes else ''}
              </table>
            </div>

            <!-- Items table -->
            <div style="font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#888;margin-bottom:12px;">Items Ordered</div>
            <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #f0f0f0;border-radius:10px;overflow:hidden;margin-bottom:20px;">
              <thead>
                <tr style="background:#faf9f7;">
                  <th style="padding:10px 12px;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#888;text-align:left;">Product</th>
                  <th style="padding:10px 12px;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#888;text-align:center;">Qty</th>
                  <th style="padding:10px 12px;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#888;text-align:right;">Price</th>
                  <th style="padding:10px 12px;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#888;text-align:right;">Subtotal</th>
                </tr>
              </thead>
              <tbody>{items_rows}</tbody>
            </table>

            <!-- Totals -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
              <tr>
                <td style="font-size:13px;color:#888;padding:5px 0;">Subtotal</td>
                <td style="font-size:13px;color:#1a1a1a;text-align:right;padding:5px 0;">KES {float(order.subtotal):,.0f}</td>
              </tr>
              <tr>
                <td style="font-size:13px;color:#888;padding:5px 0;">Shipping</td>
                <td style="font-size:13px;color:#1a1a1a;text-align:right;padding:5px 0;">KES {float(order.shipping_fee):,.0f}</td>
              </tr>
              <tr style="border-top:2px solid #f0f0f0;">
                <td style="font-size:15px;font-weight:700;color:#1a1a1a;padding:10px 0 0;">Total</td>
                <td style="font-size:15px;font-weight:700;color:#c9867c;text-align:right;padding:10px 0 0;">KES {float(order.total):,.0f}</td>
              </tr>
            </table>

            <!-- CTA -->
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td style="background:#1a1a1a;border-radius:8px;">
                  <a href="https://danischoice.vercel.app/admin/orders"
                     style="display:inline-block;padding:12px 28px;color:#fff;font-size:13px;font-weight:700;text-decoration:none;letter-spacing:1px;">
                    VIEW IN ADMIN PANEL →
                  </a>
                </td>
              </tr>
            </table>

          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f8f8f8;padding:20px 40px;border-top:1px solid #eee;text-align:center;">
            <p style="margin:0;font-size:12px;color:#aaa;">© 2025 Danis Choice · Nairobi, Kenya</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>'''

            msg = MIMEMultipart('alternative')
            msg['Subject'] = f'🛍️ New Order #{order.order_number} — KES {float(order.total):,.0f}'
            msg['From']    = f'Danis Choice <{GMAIL_USER}>'
            msg['To']      = ADMIN_EMAIL
            msg.attach(MIMEText(html, 'html'))

            with smtplib.SMTP_SSL('smtp.gmail.com', 465) as server:
                server.login(GMAIL_USER, GMAIL_PASSWORD)
                server.sendmail(GMAIL_USER, ADMIN_EMAIL, msg.as_string())

            print(f'Order notification sent for {order.order_number}')

        except Exception as e:
            print(f'ORDER EMAIL ERROR: {e}')


def notify_admin_new_order(app, order_id):
    """Fire and forget — send admin notification in background thread."""
    thread = threading.Thread(target=_send_order_notification, args=(app, order_id))
    thread.daemon = True
    thread.start()


@orders_bp.post('')
@jwt_required()
def create_order():
    uid = get_jwt_identity()
    d   = request.get_json() or {}

    required = ['shipping_name', 'shipping_phone', 'shipping_address']
    missing  = [f for f in required if not d.get(f)]
    if missing:
        return error(f'Missing: {", ".join(missing)}')

    cart_items = CartItem.query.filter_by(user_id=uid).all()
    if not cart_items:
        return error('Your cart is empty')

    for item in cart_items:
        if not item.product:
            return error('Product not found')
        if item.product.stock < item.quantity:
            return error(f'"{item.product.name}" has only {item.product.stock} in stock')

    shipping_fee = 200.0
    subtotal = sum(
        float(item.product.sale_price or item.product.price) * item.quantity
        for item in cart_items
    )
    total = subtotal + shipping_fee

    order = Order(
        order_number     = generate_order_number(),
        user_id          = uid,
        status           = 'pending',
        subtotal         = subtotal,
        shipping_fee     = shipping_fee,
        total            = total,
        shipping_name    = d['shipping_name'],
        shipping_phone   = d['shipping_phone'],
        shipping_address = d['shipping_address'],
        shipping_city    = d.get('shipping_city', ''),
        notes            = d.get('notes', ''),
    )
    db.session.add(order)
    db.session.flush()

    for item in cart_items:
        price = float(item.product.sale_price or item.product.price)
        order_item = OrderItem(
            order_id   = order.id,
            product_id = item.product_id,
            quantity   = item.quantity,
            price      = price,
            size       = item.size,
            color      = item.color,
        )
        db.session.add(order_item)
        item.product.stock -= item.quantity

    CartItem.query.filter_by(user_id=uid).delete()
    db.session.commit()

    # ── Notify admin about the new order ──
    try:
        from flask import current_app
        notify_admin_new_order(current_app._get_current_object(), order.id)
    except Exception as e:
        print(f'Order notification error: {e}')

    return created(order.to_dict(), 'Order placed successfully')


@orders_bp.get('')
@jwt_required()
def my_orders():
    uid    = get_jwt_identity()
    page   = request.args.get('page', 1, type=int)
    result = paginate_query(
        Order.query.filter_by(user_id=uid).order_by(Order.created_at.desc()),
        page, 10
    )
    return success(
        [o.to_dict() for o in result['items']],
        pagination={'total': result['total'], 'page': result['page'], 'pages': result['pages']}
    )


@orders_bp.get('/<int:order_id>')
@jwt_required()
def get_order(order_id):
    uid   = get_jwt_identity()
    order = Order.query.filter_by(id=order_id, user_id=uid).first_or_404()
    return success(order.to_dict())


@orders_bp.get('/admin/all')
@admin_required
def all_orders():
    page   = request.args.get('page', 1, type=int)
    status = request.args.get('status')
    q      = Order.query.order_by(Order.created_at.desc())
    if status:
        q = q.filter_by(status=status)
    result = paginate_query(q, page, 20)
    return success(
        [o.to_dict() for o in result['items']],
        pagination={'total': result['total'], 'page': result['page'], 'pages': result['pages']}
    )


@orders_bp.patch('/<int:order_id>/status')
@admin_required
def update_status(order_id):
    order  = Order.query.get_or_404(order_id)
    d      = request.get_json() or {}
    status = d.get('status')
    if status not in Order.STATUS_CHOICES:
        return error(f'Invalid status. Choose from: {", ".join(Order.STATUS_CHOICES)}')
    order.status = status
    db.session.commit()
    return success(order.to_dict(), 'Status updated')