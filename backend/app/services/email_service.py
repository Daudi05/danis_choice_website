import threading
from flask import current_app
from flask_mail import Message
from app import mail
from app.models.subscriber import Subscriber


def _build_html(product):
    """Build a beautiful HTML email for a new product."""
    price      = f"KES {float(product.price):,.0f}"
    sale_price = (
        f'<div style="font-size:13px;color:#888;text-decoration:line-through;margin-bottom:2px;">KES {float(product.price):,.0f}</div>'
        f'<div style="font-size:20px;font-weight:700;color:#c9867c;">KES {float(product.sale_price):,.0f}</div>'
        if getattr(product, 'sale_price', None) else
        f'<div style="font-size:20px;font-weight:700;color:#c9867c;">{price}</div>'
    )

    # Use primary image if available
    image_url = None
    if hasattr(product, 'images') and product.images:
        primary = next((img for img in product.images if img.is_primary), None)
        image_url = primary.url if primary else product.images[0].url

    image_html = (
        f'<img src="{image_url}" alt="{product.name}" style="width:100%;max-height:320px;object-fit:cover;display:block;"/>'
        if image_url else
        '<div style="width:100%;height:200px;background:#f5f5f5;display:flex;align-items:center;justify-content:center;font-size:48px;">🛍️</div>'
    )

    category = product.category.name if getattr(product, 'category', None) else 'New Arrival'

    return f'''
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>
<body style="margin:0;padding:0;background:#f8f8f8;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f8f8;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;max-width:600px;width:100%;">

        <!-- Header -->
        <tr>
          <td style="background:#1a1a1a;padding:28px 40px;text-align:center;">
            <div style="font-size:26px;font-weight:700;letter-spacing:6px;color:#ffffff;">DANIS</div>
            <div style="font-size:10px;letter-spacing:8px;color:#c9867c;margin-top:2px;">CHOICE</div>
          </td>
        </tr>

        <!-- Eyebrow -->
        <tr>
          <td style="background:#c9867c;padding:10px 40px;text-align:center;">
            <span style="font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:white;">✦ New Arrival Alert ✦</span>
          </td>
        </tr>

        <!-- Product Image -->
        <tr><td style="padding:0;">{image_html}</td></tr>

        <!-- Product Info -->
        <tr>
          <td style="padding:36px 40px 28px;">
            <div style="font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#c9867c;margin-bottom:8px;">{category}</div>
            <h1 style="margin:0 0 16px;font-size:22px;color:#1a1a1a;font-weight:700;line-height:1.3;">{product.name}</h1>
            <div style="margin-bottom:20px;">{sale_price}</div>

            {'<p style="margin:0 0 24px;font-size:14px;color:#666;line-height:1.7;">' + product.description[:200] + '…</p>' if getattr(product, 'description', None) else ''}

            <!-- CTA Button -->
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td style="background:#1a1a1a;border-radius:8px;">
                  <a href="https://danischoice.vercel.app/shop"
                     style="display:inline-block;padding:14px 32px;color:#ffffff;font-size:13px;font-weight:700;text-decoration:none;letter-spacing:1px;">
                    SHOP NOW →
                  </a>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Divider -->
        <tr><td style="padding:0 40px;"><div style="height:1px;background:#f0f0f0;"></div></td></tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f8f8f8;padding:24px 40px;text-align:center;">
            <p style="margin:0 0 6px;font-size:12px;color:#aaa;">
              You're receiving this because you subscribed to Danis Choice updates.
            </p>
            <p style="margin:0;font-size:12px;color:#aaa;">
              © 2025 Danis Choice · Nairobi, Kenya
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>
'''


def notify_subscribers_new_product(product):
    """
    Send a new product notification email to all active subscribers.
    Runs in a background thread so it doesn't slow down the API response.
    """
    app = current_app._get_current_object()

    def _send():
        with app.app_context():
            try:
                subscribers = Subscriber.query.filter_by(is_active=True).all()
                if not subscribers:
                    print('No active subscribers to notify.')
                    return

                recipients = [s.email for s in subscribers]
                print(f'Notifying {len(recipients)} subscribers about: {product.name}')

                msg = Message(
                    subject=f'✨ New Arrival: {product.name} — Danis Choice',
                    recipients=recipients,
                    html=_build_html(product),
                )
                mail.send(msg)
                print(f'Subscriber notification sent successfully.')
            except Exception as e:
                print(f'SUBSCRIBER EMAIL ERROR: {e}')

    thread = threading.Thread(target=_send)
    thread.daemon = True
    thread.start()


# Keep old function name working too (backwards compat)
def send_email_to_subscribers(product=None, subject=None, body=None):
    if product:
        notify_subscribers_new_product(product)