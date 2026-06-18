import re, random, string
from datetime import datetime
from flask import jsonify


def success(data=None, message='Success', code=200, **kwargs):
    r = {'success': True, 'message': message}
    if data is not None:
        r['data'] = data
    r.update(kwargs)
    return jsonify(r), code


def error(message='Error', code=400, errors=None):
    r = {'success': False, 'message': message}
    if errors:
        r['errors'] = errors
    return jsonify(r), code


def created(data=None, message='Created'):
    return success(data, message, 201)


def paginate_query(query, page, per_page=20):
    paginated = query.paginate(page=page, per_page=per_page, error_out=False)
    return {
        'items':       paginated.items,
        'total':       paginated.total,
        'page':        paginated.page,
        'per_page':    paginated.per_page,
        'pages':       paginated.pages,
        'has_next':    paginated.has_next,
        'has_prev':    paginated.has_prev,
    }


def slugify(text):
    text = text.lower().strip()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[\s_-]+', '-', text)
    text = re.sub(r'^-+|-+$', '', text)
    return text


def generate_order_number():
    now = datetime.now()
    rand = ''.join(random.choices(string.ascii_uppercase + string.digits, k=5))
    return f"DC{now.strftime('%Y%m%d')}{rand}"


def allowed_file(filename, allowed_extensions):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in allowed_extensions
