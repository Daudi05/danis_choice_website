from flask import Blueprint, request, jsonify
from flask_mail import Message
from app import mail

portfolio_bp = Blueprint("portfolio", __name__)

@portfolio_bp.route("/portfolio/contact", methods=["POST"])
def contact():
    data = request.get_json()

    name = data.get("name")
    email = data.get("email")
    subject = data.get("subject", "No subject")
    message = data.get("message")

    if not name or not email or not message:
        return jsonify({"message": "Missing fields"}), 400

    try:
        msg = Message(
            subject=f"Portfolio Contact: {subject or 'No Subject'}",
            sender=email,
            recipients=["aluochberyl64@gmail.com"]
        )

        msg.body = f"""
New message from portfolio:

Name: {name}
Email: {email}

Message:
{message}
        """

        mail.send(msg)

        return jsonify({"message": "Email sent successfully"}), 200

    except Exception as e:
        return jsonify({"message": str(e)}), 500