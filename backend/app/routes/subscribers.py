from flask import Blueprint, request, current_app
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from app import db
from app.models.subscriber import Subscriber
from app.utils.helpers import success, error

subscribers_bp = Blueprint('subscribers', __name__)

GMAIL_USER     = 'aluochberyl64@gmail.com'
GMAIL_PASSWORD = 'qgns tohk nueb yicb'
FROM_NAME      = 'Danis Choice'


def send_email(to_email, subject, html_body):
    """Send an email via Gmail SMTP."""
    try:
        msg = MIMEMultipart('alternative')
        msg['Subject'] = subject
        msg['From']    = f'{FROM_NAME} <{GMAIL_USER}>'
        msg['To']      = to_email
        msg.attach(MIMEText(html_body, 'html'))

        with smtplib.SMTP_SSL('smtp.gmail.com', 465) as server:
            server.login(GMAIL_USER, GMAIL_PASSWORD)
            server.sendmail(GMAIL_USER, to_email, msg.as_string())
        return True
    except Exception as e:
        print(f'Email send error: {e}')
        return False


def welcome_email_html(email, token, frontend_url):
    unsubscribe_url = f'{frontend_url}/unsubscribe?token={token}'
    return f'''
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Welcome to Danis Choice</title>
</head>
<body style="margin:0;padding:0;background:#f8f8f8;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f8f8;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background:#1a1a1a;padding:36px 40px;text-align:center;">
              <div style="font-size:28px;font-weight:700;letter-spacing:6px;color:#ffffff;">DANIS</div>
              <div style="font-size:11px;letter-spacing:8px;color:#c9867c;margin-top:2px;">CHOICE</div>
            </td>
          </tr>

          <!-- Hero image -->
          <tr>
            <td style="padding:0;">
              <img src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&q=80"
                   alt="Danis Choice Fashion"
                   style="width:100%;height:200px;object-fit:cover;display:block;"/>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 32px;">
              <h1 style="margin:0 0 16px;font-size:24px;color:#1a1a1a;font-weight:700;">
                Welcome to Danis Choice! 🎉
              </h1>
              <p style="margin:0 0 16px;font-size:15px;color:#555;line-height:1.7;">
                Thank you for subscribing to our newsletter. You're now part of a community
                of <strong>50,000+ stylish women</strong> who get first access to:
              </p>

              <!-- Benefits list -->
              <table cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
                <tr>
                  <td style="padding:8px 0;">
                    <span style="color:#c9867c;font-size:18px;">✦</span>
                    <span style="margin-left:10px;font-size:14px;color:#333;">New arrivals every week</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:8px 0;">
                    <span style="color:#c9867c;font-size:18px;">✦</span>
                    <span style="margin-left:10px;font-size:14px;color:#333;">Exclusive member-only discounts</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:8px 0;">
                    <span style="color:#c9867c;font-size:18px;">✦</span>
                    <span style="margin-left:10px;font-size:14px;color:#333;">Style tips and fashion guides</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:8px 0;">
                    <span style="color:#c9867c;font-size:18px;">✦</span>
                    <span style="margin-left:10px;font-size:14px;color:#333;">Early access to sales and promotions</span>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table cellpadding="0" cellspacing="0" style="margin:0 auto 32px;">
                <tr>
                  <td align="center" style="background:#1a1a1a;border-radius:8px;">
                    <a href="https://danischoice.vercel.app/shop"
                       style="display:inline-block;padding:14px 32px;color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;letter-spacing:1px;">
                      SHOP NOW →
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:0;font-size:14px;color:#888;line-height:1.7;">
                We're excited to have you with us. Expect your first newsletter soon!
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f8f8f8;padding:24px 40px;border-top:1px solid #eee;text-align:center;">
              <p style="margin:0 0 8px;font-size:12px;color:#aaa;">
                You're receiving this email because you subscribed at danischoice.vercel.app
              </p>
              <p style="margin:0;font-size:12px;color:#aaa;">
                Don't want updates?
                <a href="{unsubscribe_url}"
                   style="color:#c9867c;text-decoration:underline;">
                  Unsubscribe here
                </a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
'''


def unsubscribe_email_html():
    return '''
<!DOCTYPE html>
<html>
<body style="margin:0;padding:40px;background:#f8f8f8;font-family:Arial,sans-serif;text-align:center;">
  <div style="max-width:480px;margin:0 auto;background:white;border-radius:16px;padding:48px 40px;">
    <div style="font-size:24px;font-weight:700;letter-spacing:6px;color:#1a1a1a;">DANIS</div>
    <div style="font-size:11px;letter-spacing:8px;color:#c9867c;margin-bottom:28px;">CHOICE</div>
    <h2 style="color:#1a1a1a;margin:0 0 14px;">You have been unsubscribed</h2>
    <p style="color:#666;font-size:14px;line-height:1.7;margin:0 0 24px;">
      We're sorry to see you go. You will no longer receive newsletters from Danis Choice.
    </p>
    <a href="https://danischoice.vercel.app"
       style="display:inline-block;padding:12px 28px;background:#1a1a1a;color:white;border-radius:8px;text-decoration:none;font-size:13px;font-weight:700;">
      Visit Our Store
    </a>
  </div>
</body>
</html>
'''


@subscribers_bp.post('/subscribe')
def subscribe():
    d     = request.get_json() or {}
    email = (d.get('email') or '').strip().lower()

    if not email or '@' not in email:
        return error('Please enter a valid email address')

    existing = Subscriber.query.filter_by(email=email).first()

    if existing:
        if existing.is_active:
            return error('This email is already subscribed')
        # Re-subscribe
        existing.is_active = True
        db.session.commit()
        frontend_url = current_app.config.get('FRONTEND_URL', 'https://danischoice.vercel.app')
        send_email(email, 'Welcome back to Danis Choice! 🎉', welcome_email_html(email, existing.token, frontend_url))
        return success(message='Welcome back! Check your email.')

    subscriber = Subscriber(email=email)
    db.session.add(subscriber)
    db.session.commit()

    frontend_url = current_app.config.get('FRONTEND_URL', 'https://danischoice.vercel.app')
    send_email(email, 'Welcome to Danis Choice! 🎉', welcome_email_html(email, subscriber.token, frontend_url))

    return success(message='Subscribed! Check your email for a welcome message.')


@subscribers_bp.get('/unsubscribe')
def unsubscribe():
    token = request.args.get('token', '')
    if not token:
        return error('Invalid unsubscribe link', 400)

    subscriber = Subscriber.query.filter_by(token=token).first()
    if not subscriber:
        return error('Invalid or expired unsubscribe link', 404)

    subscriber.is_active = False
    db.session.commit()

    # Return a nice HTML page directly
    from flask import make_response
    response = make_response(unsubscribe_email_html(), 200)
    response.headers['Content-Type'] = 'text/html'
    return response