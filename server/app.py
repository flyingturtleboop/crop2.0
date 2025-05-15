# app.py
import json
import os
from flask import Flask, request, jsonify, send_from_directory
from datetime import datetime, timedelta, timezone
from flask_jwt_extended import (
    create_access_token, get_jwt, get_jwt_identity, unset_jwt_cookies, 
    jwt_required, JWTManager
)
from flask_bcrypt import Bcrypt
from flask_cors import CORS
from werkzeug.utils import secure_filename
from models import db, User, Crop, Finance, Reminder, get_uuid
import traceback

app = Flask(__name__)
@app.after_request
def apply_cors(response):
    # Allow your Vite origin
    response.headers["Access-Control-Allow-Origin"] = "http://localhost:5173"
    # Allow the headers your frontend needs
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    # Allow these HTTP methods
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
    # If you ever send cookies, you’d also need this:
    response.headers["Access-Control-Allow-Credentials"] = "true"
    return response

# If you’re using fetch() with a preflight OPTIONS, you can short-circuit it:
@app.route("/api/<path:unused>", methods=["OPTIONS"])
def handle_options(unused):
    resp = make_response()
    resp.status_code = 204
    return resp

# --- File Upload Configuration ---
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

app.config['SECRET_KEY'] = 'fduinaslfndajfnsdiaofbdjhiofbdsoi'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///flaskdb.db'
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=1)
jwt = JWTManager(app)

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_ECHO'] = True

bcrypt = Bcrypt(app)
db.init_app(app)

with app.app_context():
    db.create_all()

# Serve uploaded files
@app.route('/uploads/<path:filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.route("/")
def hello_world():
    return "<p>Hello, World!</p>"

@app.route('/logintoken', methods=["POST"])
def create_token():
    email = request.json.get("email", None)
    password = request.json.get("password", None)
    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400
    user = User.query.filter_by(email=email).first()
    if user is None or not bcrypt.check_password_hash(user.password, password):
        return jsonify({"error": "Wrong email or password"}), 401
    access_token = create_access_token(identity=email)
    return jsonify({"email": email, "access_token": access_token})

@app.route("/signup", methods=["POST"])
def signup():
    try:
        name = request.json.get("name")
        email = request.json.get("email")
        password = request.json.get("password")
        occupation = request.json.get("occupation")
        if not name or not email or not password or not occupation:
            return jsonify({"error": "Name, email, password, and occupation are required"}), 400
        if User.query.filter_by(email=email).first() or User.query.filter_by(name=name).first():
            return jsonify({"error": "Email or username already exists"}), 409
        hashed_password = bcrypt.generate_password_hash(password)
        new_user = User(name=name, email=email, password=hashed_password, occupation=occupation)
        db.session.add(new_user)
        db.session.commit()
        return jsonify({"id": new_user.id, "email": new_user.email})
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@app.after_request
def refresh_expiring_jwts(response):
    try:
        exp_timestamp = get_jwt()["exp"]
        now = datetime.now(timezone.utc)
        target_timestamp = datetime.timestamp(now + timedelta(minutes=30))
        if target_timestamp > exp_timestamp:
            access_token = create_access_token(identity=get_jwt_identity())
            data = response.get_json()
            if isinstance(data, dict):
                data["access_token"] = access_token
                response.data = json.dumps(data)
        return response
    except (RuntimeError, KeyError):
        return response

@app.route("/logout", methods=["POST"])
def logout():
    response = jsonify({"msg": "logout successful"})
    unset_jwt_cookies(response)
    return response

@app.route('/profile/<getemail>')
@jwt_required()
def my_profile(getemail):
    current_user = get_jwt_identity()
    if current_user != getemail:
        return jsonify({"error": "Unauthorized Access"}), 403
    user = User.query.filter_by(email=getemail).first()
    if not user:
        return jsonify({"error": "User not found"}), 404
    return jsonify({
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "occupation": user.occupation
    })

def get_current_user():
    email = get_jwt_identity()
    return User.query.filter_by(email=email).first()

# ----------------------------
# Crop Tracker CRUD Endpoints
# ----------------------------

@app.route('/crops', methods=["POST"])
@jwt_required()
def create_crop():
    try:
        data = request.form if request.content_type.startswith("multipart/form-data") else request.json
        current_user = get_current_user()
        if not current_user:
            return jsonify({"error": "User not found"}), 404
        required_fields = ["crop_type", "variety", "growth_stage", "amount_sown", "location"]
        for field in required_fields:
            if not data.get(field):
                return jsonify({"error": f"{field} is required"}), 400
        try:
            amount_sown = float(data.get("amount_sown"))
        except (ValueError, TypeError):
            return jsonify({"error": "amount_sown must be a valid number"}), 400
        crop_image_path = None
        if 'crop_image' in request.files:
            file = request.files['crop_image']
            if file and allowed_file(file.filename):
                filename = get_uuid() + "_" + secure_filename(file.filename)
                filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
                file.save(filepath)
                crop_image_path = filepath
        crop = Crop(
            crop_type=data.get("crop_type"),
            variety=data.get("variety"),
            growth_stage=data.get("growth_stage"),
            amount_sown=amount_sown,
            extra_notes=data.get("extra_notes", ""),
            location=data.get("location"),
            user_id=current_user.id,
            crop_image=crop_image_path
        )
        db.session.add(crop)
        db.session.commit()
        return jsonify({
            "id": crop.id,
            "crop_type": crop.crop_type,
            "variety": crop.variety,
            "growth_stage": crop.growth_stage,
            "amount_sown": crop.amount_sown,
            "extra_notes": crop.extra_notes,
            "location": crop.location,
            "crop_image": (request.host_url.rstrip("/") + "/" + crop.crop_image) if crop.crop_image else None
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@app.route('/crops', methods=["GET"])
@jwt_required()
def get_crops():
    try:
        current_user = get_current_user()
        if not current_user:
            return jsonify({"error": "User not found"}), 404
        crops = Crop.query.filter_by(user_id=current_user.id).all()
        result = []
        for crop in crops:
            result.append({
                "id": crop.id,
                "crop_type": crop.crop_type,
                "variety": crop.variety,
                "growth_stage": crop.growth_stage,
                "amount_sown": crop.amount_sown,
                "extra_notes": crop.extra_notes,
                "location": crop.location,
                "crop_image": (request.host_url.rstrip("/") + "/" + crop.crop_image) if crop.crop_image else None
            })
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/crops/<crop_id>', methods=["GET"])
@jwt_required()
def get_crop(crop_id):
    try:
        current_user = get_current_user()
        if not current_user:
            return jsonify({"error": "User not found"}), 404
        crop = Crop.query.get(crop_id)
        if crop is None:
            return jsonify({"error": "Crop not found"}), 404
        if crop.user_id != current_user.id:
            return jsonify({"error": "Unauthorized access"}), 403
        return jsonify({
            "id": crop.id,
            "crop_type": crop.crop_type,
            "variety": crop.variety,
            "growth_stage": crop.growth_stage,
            "amount_sown": crop.amount_sown,
            "extra_notes": crop.extra_notes,
            "location": crop.location,
            "crop_image": (request.host_url.rstrip("/") + "/" + crop.crop_image) if crop.crop_image else None
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/crops/<crop_id>', methods=["PUT"])
@jwt_required()
def update_crop(crop_id):
    try:
        current_user = get_current_user()
        if not current_user:
            return jsonify({"error": "User not found"}), 404
        crop = Crop.query.get(crop_id)
        if crop is None:
            return jsonify({"error": "Crop not found"}), 404
        if crop.user_id != current_user.id:
            return jsonify({"error": "Unauthorized access"}), 403
        data = request.form if request.content_type.startswith("multipart/form-data") else request.json
        if "crop_type" in data:
            crop.crop_type = data["crop_type"]
        if "variety" in data:
            crop.variety = data["variety"]
        if "growth_stage" in data:
            crop.growth_stage = data["growth_stage"]
        if "amount_sown" in data:
            try:
                crop.amount_sown = float(data["amount_sown"])
            except (ValueError, TypeError):
                return jsonify({"error": "amount_sown must be a valid number"}), 400
        if "extra_notes" in data:
            crop.extra_notes = data["extra_notes"]
        if "location" in data:
            crop.location = data["location"]
        if 'crop_image' in request.files:
            file = request.files['crop_image']
            if file and allowed_file(file.filename):
                filename = get_uuid() + "_" + secure_filename(file.filename)
                filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
                file.save(filepath)
                crop.crop_image = filepath
        db.session.commit()
        return jsonify({
            "id": crop.id,
            "crop_type": crop.crop_type,
            "variety": crop.variety,
            "growth_stage": crop.growth_stage,
            "amount_sown": crop.amount_sown,
            "extra_notes": crop.extra_notes,
            "location": crop.location,
            "crop_image": (request.host_url.rstrip("/") + "/" + crop.crop_image) if crop.crop_image else None
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@app.route('/crops/<crop_id>', methods=["DELETE"])
@jwt_required()
def delete_crop(crop_id):
    try:
        current_user = get_current_user()
        if not current_user:
            return jsonify({"error": "User not found"}), 404
        crop = Crop.query.get(crop_id)
        if crop is None:
            return jsonify({"error": "Crop not found"}), 404
        if crop.user_id != current_user.id:
            return jsonify({"error": "Unauthorized access"}), 403
        db.session.delete(crop)
        db.session.commit()
        return jsonify({"msg": "Crop deleted successfully"})
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

# -----------------------------
# Finance Tracker CRUD Endpoints
# -----------------------------

@app.route('/finances', methods=["POST"])
@jwt_required()
def create_finance():
    try:
        data = request.form if request.content_type.startswith("multipart/form-data") else request.json
        required_fields = ["amount", "currency", "status"]
        for field in required_fields:
            if not data.get(field):
                return jsonify({"error": f"{field} is required"}), 400
        try:
            amount = float(data.get("amount"))
        except (ValueError, TypeError):
            return jsonify({"error": "amount must be a valid number"}), 400
        if data.get("status").lower() not in ["received", "sent"]:
            return jsonify({"error": "status must be either 'Received' or 'Sent'"}), 400
        current_user = get_current_user()
        if not current_user:
            return jsonify({"error": "User not found"}), 404
        receipt_image_path = None
        if 'receipt_image' in request.files:
            file = request.files['receipt_image']
            if file and allowed_file(file.filename):
                filename = get_uuid() + "_" + secure_filename(file.filename)
                filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
                file.save(filepath)
                receipt_image_path = filepath
        finance = Finance(
            amount=amount,
            currency=data.get("currency"),
            status=data.get("status"),
            notes=data.get("notes", ""),
            user_id=current_user.id,
            receipt_image=receipt_image_path
        )
        db.session.add(finance)
        db.session.commit()
        return jsonify({
            "id": finance.id,
            "amount": finance.amount,
            "currency": finance.currency,
            "status": finance.status,
            "notes": finance.notes,
            "receipt_image": (request.host_url.rstrip("/") + "/" + finance.receipt_image) if finance.receipt_image else None,
            "total": finance.total,
            "timestamp": finance.timestamp.isoformat()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@app.route('/finances', methods=["GET"])
@jwt_required()
def get_finances():
    try:
        current_user = get_current_user()
        if not current_user:
            return jsonify({"error": "User not found"}), 404
        finances = Finance.query.filter_by(user_id=current_user.id).order_by(Finance.timestamp.desc()).all()
        result = []
        for finance in finances:
            result.append({
                "id": finance.id,
                "amount": finance.amount,
                "currency": finance.currency,
                "status": finance.status,
                "notes": finance.notes,
                "receipt_image": (request.host_url.rstrip("/") + "/" + finance.receipt_image) if finance.receipt_image else None,
                "total": finance.total,
                "timestamp": finance.timestamp.isoformat()
            })
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/finances/<finance_id>', methods=["PUT"])
@jwt_required()
def update_finance(finance_id):
    try:
        current_user = get_current_user()
        if not current_user:
            return jsonify({"error": "User not found"}), 404
        finance = Finance.query.get(finance_id)
        if finance is None:
            return jsonify({"error": "Finance record not found"}), 404
        if finance.user_id != current_user.id:
            return jsonify({"error": "Unauthorized access"}), 403
        data = request.form if request.content_type.startswith("multipart/form-data") else request.json
        if "amount" in data:
            try:
                finance.amount = float(data["amount"])
            except (ValueError, TypeError):
                return jsonify({"error": "amount must be a valid number"}), 400
        if "currency" in data:
            finance.currency = data["currency"]
        if "status" in data:
            if data["status"].lower() not in ["received", "sent"]:
                return jsonify({"error": "status must be either 'Received' or 'Sent'"}), 400
            finance.status = data["status"]
        if "notes" in data:
            finance.notes = data["notes"]
        if 'receipt_image' in request.files:
            file = request.files['receipt_image']
            if file and allowed_file(file.filename):
                filename = get_uuid() + "_" + secure_filename(file.filename)
                filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
                file.save(filepath)
                finance.receipt_image = filepath
        db.session.commit()
        return jsonify({
            "id": finance.id,
            "amount": finance.amount,
            "currency": finance.currency,
            "status": finance.status,
            "notes": finance.notes,
            "receipt_image": (request.host_url.rstrip("/") + "/" + finance.receipt_image) if finance.receipt_image else None,
            "total": finance.total,
            "timestamp": finance.timestamp.isoformat()
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@app.route('/finances/<finance_id>', methods=["DELETE"])
@jwt_required()
def delete_finance(finance_id):
    try:
        current_user = get_current_user()
        if not current_user:
            return jsonify({"error": "User not found"}), 404
        finance = Finance.query.get(finance_id)
        if finance is None:
            return jsonify({"error": "Finance record not found"}), 404
        if finance.user_id != current_user.id:
            return jsonify({"error": "Unauthorized access"}), 403
        db.session.delete(finance)
        db.session.commit()
        return jsonify({"msg": "Finance record deleted successfully"})
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@app.route('/api/reminders', methods=['GET'])
@jwt_required()
def get_reminders():
    try:
        user = get_current_user()
        if not user:
            return jsonify({'error': 'User not found'}), 404

        items = Reminder.query.filter_by(user_id=user.id).order_by(Reminder.date).all()
        return jsonify([
            {'id': r.id, 'date': r.date.isoformat(), 'content': r.content}
            for r in items
        ]), 200

    except Exception as e:
        # Print full traceback to your Flask console
        traceback.print_exc()
        # Also send it back in JSON so you can read it in DevTools
        return jsonify({
            'error': 'Server error in get_reminders',
            'details': str(e)
        }), 500

@app.route('/api/reminders', methods=['POST'])
@jwt_required()
def add_reminder():
    user = get_current_user()
    if not user:
        return jsonify({'error': 'User not found'}), 404

    data = request.get_json() or {}
    date_str = (data.get('date') or "").strip()
    content  = (data.get('content') or "").strip()
    if not date_str or not content:
        return jsonify({'error': 'Missing date or content'}), 400

    try:
        rem_date = datetime.strptime(date_str, '%Y-%m-%d').date()
    except ValueError:
        return jsonify({'error': 'Invalid date format'}), 400

    rem = Reminder(date=rem_date, content=content, user_id=user.id)
    db.session.add(rem)
    db.session.commit()

    return jsonify({
        'id': rem.id,
        'date': rem.date.isoformat(),
        'content': rem.content
    }), 201

@app.route('/api/reminders/<string:reminder_id>', methods=['PUT'])
@jwt_required()
def update_reminder(reminder_id):
    user = get_current_user()
    if not user:
        return jsonify({'error': 'User not found'}), 404

    data = request.get_json() or {}
    content = (data.get('content') or "").strip()
    if not content:
        return jsonify({'error': 'Missing content'}), 400

    rem = Reminder.query.filter_by(id=reminder_id, user_id=user.id).first()
    if not rem:
        return jsonify({'error': 'Reminder not found'}), 404

    rem.content = content
    db.session.commit()

    return jsonify({
        'id': rem.id,
        'date': rem.date.isoformat(),
        'content': rem.content
    }), 200

@app.route('/api/reminders/<string:reminder_id>', methods=['DELETE'])
@jwt_required()
def delete_reminder(reminder_id):
    user = get_current_user()
    if not user:
        return jsonify({'error': 'User not found'}), 404

    rem = Reminder.query.filter_by(id=reminder_id, user_id=user.id).first()
    if not rem:
        return jsonify({'error': 'Reminder not found'}), 404

    try:
        db.session.delete(rem)
        db.session.commit()
        return jsonify({'msg': 'Reminder deleted'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'error': 'Server error in delete_reminder',
            'details': str(e)
        }), 500

if __name__ == '__main__':
    app.run(debug=True, use_reloader=True)
