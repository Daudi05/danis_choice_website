import os, uuid
from flask import Blueprint, request, send_from_directory, current_app
from flask_jwt_extended import jwt_required
from app.utils.helpers import success, error
from app.utils.decorators import admin_required

uploads_bp = Blueprint('uploads', __name__)


@uploads_bp.post('')
@admin_required
def upload_image():
    if 'file' not in request.files:
        return error('No file provided')
    file = request.files['file']
    ext  = (file.filename or '').rsplit('.', 1)[-1].lower()
    if ext not in current_app.config['ALLOWED_EXTENSIONS']:
        return error(f'File type .{ext} not allowed')

    filename = f"{uuid.uuid4().hex}.{ext}"
    folder   = current_app.config['UPLOAD_FOLDER']
    os.makedirs(folder, exist_ok=True)
    file.save(os.path.join(folder, filename))

    url = f"/api/uploads/{filename}"
    return success({'url': url}, code=201)


@uploads_bp.get('/<filename>')
def serve(filename):
    filename = os.path.basename(filename)
    return send_from_directory(current_app.config['UPLOAD_FOLDER'], filename)
