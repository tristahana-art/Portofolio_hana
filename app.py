# ==============================================================================
# PORTOFOLIO TRISTA HANA QONITA RAHMAWATI
# Flask Backend - PythonAnywhere Compatible
# Anti-Slop Compliant (R-02: Zero em dash)
# ==============================================================================

import os
import json
import uuid
import base64
from flask import (
    Flask, send_from_directory, jsonify, request, abort, send_file
)

# ---------------------------------------------------------------------------
# App Setup
# ---------------------------------------------------------------------------
BASE_DIR   = os.path.dirname(os.path.abspath(__file__))
DATA_FILE  = os.path.join(BASE_DIR, 'data', 'portfolio.json')
UPLOAD_DIR = os.path.join(BASE_DIR, 'uploads')

app = Flask(__name__, static_folder=None)

os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(os.path.join(BASE_DIR, 'data'), exist_ok=True)

# ---------------------------------------------------------------------------
# Helper
# ---------------------------------------------------------------------------
def load_portfolio():
    with open(DATA_FILE, 'r', encoding='utf-8') as f:
        return json.load(f)

def save_portfolio(data):
    with open(DATA_FILE, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

ALLOWED_EXT = {'.jpg', '.jpeg', '.png', '.gif', '.webp'}

def allowed_image(filename):
    ext = os.path.splitext(filename)[1].lower()
    return ext in ALLOWED_EXT

# ---------------------------------------------------------------------------
# Static Files (HTML, CSS, JS, assets)
# ---------------------------------------------------------------------------
@app.route('/')
def index():
    return send_from_directory(BASE_DIR, 'index.html')

@app.route('/admin')
@app.route('/admin/')
@app.route('/cms')
def admin():
    return send_from_directory(BASE_DIR, 'admin.html')

@app.route('/styles.css')
def styles():
    return send_from_directory(BASE_DIR, 'styles.css')

@app.route('/app.js')
def appjs():
    return send_from_directory(BASE_DIR, 'app.js')

@app.route('/admin.js')
def adminjs():
    return send_from_directory(BASE_DIR, 'admin.js')

@app.route('/assets/<path:filename>')
def assets(filename):
    return send_from_directory(os.path.join(BASE_DIR, 'assets'), filename)

@app.route('/uploads/<path:filename>')
def uploads(filename):
    return send_from_directory(UPLOAD_DIR, filename)

@app.route('/data/<path:filename>')
def data_static(filename):
    return send_from_directory(os.path.join(BASE_DIR, 'data'), filename)

# ---------------------------------------------------------------------------
# API: Portfolio Data
# ---------------------------------------------------------------------------
@app.route('/api/data', methods=['GET'])
def api_get_data():
    try:
        data = load_portfolio()
        return jsonify(data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/data', methods=['POST'])
def api_save_data():
    try:
        payload = request.get_json(force=True)
        if not payload:
            return jsonify({'error': 'No JSON payload'}), 400
        save_portfolio(payload)
        return jsonify({'status': 'ok', 'message': 'Data saved successfully'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ---------------------------------------------------------------------------
# API: Image Upload (base64 or multipart)
# ---------------------------------------------------------------------------
@app.route('/api/upload', methods=['POST'])
def api_upload():
    try:
        # Multipart form upload
        if 'file' in request.files:
            file = request.files['file']
            if file.filename == '':
                return jsonify({'error': 'No file selected'}), 400
            if not allowed_image(file.filename):
                return jsonify({'error': 'File type not allowed'}), 400
            ext      = os.path.splitext(file.filename)[1].lower()
            filename = f"{uuid.uuid4().hex}{ext}"
            file.save(os.path.join(UPLOAD_DIR, filename))
            return jsonify({'status': 'ok', 'url': f'/uploads/{filename}'})

        # Base64 JSON upload (from admin.js)
        body = request.get_json(force=True)
        if body and 'image' in body:
            img_data = body['image']
            # Strip data URI header if present
            if ',' in img_data:
                header, img_data = img_data.split(',', 1)
                # Detect extension from header
                if 'png' in header:
                    ext = '.png'
                elif 'gif' in header:
                    ext = '.gif'
                elif 'webp' in header:
                    ext = '.webp'
                else:
                    ext = '.jpg'
            else:
                ext = '.jpg'

            filename = f"{uuid.uuid4().hex}{ext}"
            filepath = os.path.join(UPLOAD_DIR, filename)
            with open(filepath, 'wb') as f:
                f.write(base64.b64decode(img_data))
            return jsonify({'status': 'ok', 'url': f'/uploads/{filename}'})

        return jsonify({'error': 'No image data provided'}), 400

    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ---------------------------------------------------------------------------
# 404 Fallback
# ---------------------------------------------------------------------------
@app.errorhandler(404)
def not_found(e):
    return jsonify({'error': 'Not found'}), 404

# ---------------------------------------------------------------------------
# Local Dev Entry Point
# ---------------------------------------------------------------------------
if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print(f"\n{'='*58}")
    print(f"  Portofolio Trista Hana - Flask Dev Server")
    print(f"  Alamat: http://localhost:{port}")
    print(f"  Admin:  http://localhost:{port}/admin")
    print(f"{'='*58}\n")
    app.run(host='0.0.0.0', port=port, debug=False)

