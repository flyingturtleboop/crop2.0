import json
import os
from datetime import datetime, timedelta, timezone
import base64
import numpy as np

# Optional TensorFlow import
try:
    import tensorflow as tf
    TENSORFLOW_AVAILABLE = True
    print(f"✅ TensorFlow loaded successfully! Version: {tf.__version__}")
except ImportError as e:
    print(f"⚠️ TensorFlow not available: {e}")
    print("🔧 Install with: pip install tensorflow")
    TENSORFLOW_AVAILABLE = False
    tf = None

# Try to import Keras (could be standalone or from TensorFlow)
try:
    if TENSORFLOW_AVAILABLE:
        if hasattr(tf, 'keras'):
            keras = tf.keras
            print("✅ Using TensorFlow Keras")
        else:
            import keras
            print("✅ Using standalone Keras")
    else:
        import keras
        print("✅ Using standalone Keras")
        TENSORFLOW_AVAILABLE = True  # Keras can work standalone
except ImportError:
    keras = None
    if TENSORFLOW_AVAILABLE:
        print("⚠️ Keras not available")

from PIL import Image
import io

from dotenv import load_dotenv
load_dotenv()   

from flask import (
    Flask, request, jsonify, send_from_directory,
    make_response, redirect, session, url_for
)
from flask_bcrypt import Bcrypt
from flask_cors import CORS
from flask_jwt_extended import (
    JWTManager, create_access_token, get_jwt, get_jwt_identity,
    unset_jwt_cookies, jwt_required
)
from flask_migrate import Migrate
from werkzeug.utils import secure_filename
from authlib.integrations.flask_client import OAuth
from models import db, User, Crop, Finance, Reminder, get_uuid, CropPlot

# App Initialization 
app = Flask(__name__)
# Use a stable secret from the environment so sessions/OAuth state survive
# restarts; fall back to a random key only if none is configured.
app.secret_key = os.getenv('SECRET_KEY') or os.urandom(24)
FRONTEND_URL = os.getenv('FRONTEND_URL', 'http://localhost:5173')
# Restrict CORS to the configured frontend origin instead of allowing any origin.
CORS(app, supports_credentials=True, origins=[FRONTEND_URL])

# OAuth via Authlib with OIDC discovery
oauth = OAuth(app)
app.config['GOOGLE_CLIENT_ID']     = os.getenv('GOOGLE_CLIENT_ID')
app.config['GOOGLE_CLIENT_SECRET'] = os.getenv('GOOGLE_CLIENT_SECRET')

oauth.register(
    name='google',
    client_id=app.config['GOOGLE_CLIENT_ID'],
    client_secret=app.config['GOOGLE_CLIENT_SECRET'],
    server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
    client_kwargs={'scope': 'openid email profile'}
)

@app.route('/api/login')
def login():
    redirect_uri = url_for('google_callback', _external=True)
    return oauth.google.authorize_redirect(redirect_uri)

@app.route('/api/auth/google/callback')
def google_callback():
    try:
        # Exchange code for tokens
        token = oauth.google.authorize_access_token()

        # Pull user data from the ID token
        user_info = oauth.google.parse_id_token(token, None)
        email     = user_info.get('email')
        name      = user_info.get('name', '')

        # Create user if new
        user = User.query.filter_by(email=email).first()
        if not user:
            user = User(name=name, email=email, password='oauth', occupation='')
            db.session.add(user)
            db.session.commit()

        # Make your own JWT
        jwt_token = create_access_token(identity=email)

        # Redirect back into React with token in the URL
        return redirect(
            f"{FRONTEND_URL}/oauth2-callback"
            f"?token={jwt_token}"
            f"&email={email}"
        )

    except Exception as e:
        import traceback; traceback.print_exc()
        return jsonify({
            'error':   'Google OAuth failed',
            'message': str(e)
        }), 500

# CORS preflight
@app.after_request
def apply_cors(response):
    response.headers["Access-Control-Allow-Origin"]  = FRONTEND_URL
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
    response.headers["Access-Control-Allow-Credentials"] = "true"
    return response

@app.route('/api/<path:unused>', methods=['OPTIONS'])
def handle_options(unused):
    resp = make_response()
    resp.status_code = 204
    return resp

# Flask & DB Config
app.config['SQLALCHEMY_DATABASE_URI']     = 'sqlite:///flaskdb.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS']= False
app.config['SQLALCHEMY_ECHO']             = True
app.config['JWT_ACCESS_TOKEN_EXPIRES']    = timedelta(hours=1)

bcrypt = Bcrypt(app)
db.init_app(app)
migrate = Migrate(app, db)
jwt = JWTManager(app)

with app.app_context():
    db.create_all()

# File upload config
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png','jpg','jpeg','gif'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def allowed_file(fname):
    return '.' in fname and fname.rsplit('.',1)[1].lower() in ALLOWED_EXTENSIONS

# Model Configuration - Updated to use plant_disease_model_v3.keras
MODEL = None
CLASS_NAMES = ['Apple___Apple_scab', 'Apple___Black_rot', 'Apple___Cedar_apple_rust', 'Apple___healthy', 'Blueberry___healthy', 'Cherry_(including_sour)___Powdery_mildew', 'Cherry_(including_sour)___healthy', 'Grape___Black_rot', 'Grape___Esca_(Black_Measles)', 'Grape___Leaf_blight_(Isariopsis_Leaf_Spot)', 'Grape___healthy', 'Orange___Haunglongbing_(Citrus_greening)', 'Peach___Bacterial_spot', 'Peach___healthy', 'Pepper,_bell___Bacterial_spot', 'Pepper,_bell___healthy', 'Potato___Early_blight', 'Potato___Late_blight', 'Potato___healthy', 'Raspberry___healthy', 'Soybean___healthy', 'Squash___Powdery_mildew', 'Strawberry___Leaf_scorch', 'Strawberry___healthy', 'Tomato___Bacterial_spot', 'Tomato___Early_blight', 'Tomato___Late_blight', 'Tomato___Leaf_Mold', 'Tomato___Septoria_leaf_spot', 'Tomato___Spider_mites Two-spotted_spider_mite', 'Tomato___Target_Spot', 'Tomato___Tomato_Yellow_Leaf_Curl_Virus', 'Tomato___Tomato_mosaic_virus', 'Tomato___healthy']

def load_model():
    global MODEL
    
    # Updated model path to use plant_disease_model_v3.keras
    possible_paths = [
        os.path.join(os.path.dirname(__file__), 'AI_Model', 'plant_disease_model_v3.keras'),
        os.path.join(os.path.dirname(__file__), 'plant_disease_model_v3.keras'),
        os.path.join(os.path.dirname(__file__), 'AI_Model', 'AI_Model', 'plant_disease_model_v3.keras'),
        'plant_disease_model_v3.keras',
        './plant_disease_model_v3.keras'
    ]
    
    print("🔍 Searching for plant_disease_model_v3.keras...")
    
    for model_path in possible_paths:
        print(f"  Checking: {model_path}")
        if os.path.exists(model_path):
            try:
                print(f"🔄 Found model file! Loading from: {model_path}")
                
                if TENSORFLOW_AVAILABLE and hasattr(tf, 'keras'):
                    MODEL = tf.keras.models.load_model(model_path)
                elif keras is not None:
                    MODEL = keras.models.load_model(model_path)
                else:
                    print("❌ No Keras available for loading model")
                    return create_mock_model()
                
                print(f"✅ Model loaded successfully from: {model_path}")
                print(f"📊 Model input shape: {MODEL.input_shape}")
                print(f"🏷️ Number of classes: {len(CLASS_NAMES)}")
                return True
                
            except Exception as e:
                print(f"❌ Failed to load model from {model_path}: {e}")
                continue
    
    print("❌ Model file 'plant_disease_model_v3.keras' not found in any expected location")
    print("📁 Please ensure the model file is in one of these locations:")
    for path in possible_paths:
        print(f"   - {path}")
    
    print("🔧 Loading mock model instead (dev fallback)...")
    return create_mock_model()

def create_mock_model():
    """Create a simple mock model for development/testing"""
    global MODEL
    try:
        if TENSORFLOW_AVAILABLE and hasattr(tf, 'keras'):
            MODEL = tf.keras.Sequential([
                tf.keras.layers.Input(shape=(128, 128, 3)),
                tf.keras.layers.Conv2D(32, 3, activation='relu'),
                tf.keras.layers.GlobalAveragePooling2D(),
                tf.keras.layers.Dense(len(CLASS_NAMES), activation='softmax')
            ])
        elif keras is not None:
            MODEL = keras.Sequential([
                keras.layers.Input(shape=(128, 128, 3)),
                keras.layers.Conv2D(32, 3, activation='relu'),
                keras.layers.GlobalAveragePooling2D(),
                keras.layers.Dense(len(CLASS_NAMES), activation='softmax')
            ])
        else:
            return False
            
        print("✅ Mock model created for development")
        print("⚠️ This is a placeholder model - predictions will be random!")
        return True
    except Exception as e:
        print(f"❌ Failed to create mock model: {e}")
        return False

# Load the model when the app starts
model_loaded = load_model()

# Helper to fetch current user
def get_current_user():
    email = get_jwt_identity()
    return User.query.filter_by(email=email).first()

@app.after_request
def refresh_expiring_jwts(response):
    try:
        exp = get_jwt()["exp"]
        now = datetime.now(timezone.utc)
        if datetime.timestamp(now + timedelta(minutes=30)) > exp:
            new_token = create_access_token(identity=get_jwt_identity())
            data = response.get_json()
            if isinstance(data, dict):
                data["access_token"] = new_token
                response.data = json.dumps(data)
        return response
    except (RuntimeError, KeyError):
        return response

# Static & Root
@app.route('/uploads/<path:fn>')
def uploaded_file(fn):
    return send_from_directory(app.config['UPLOAD_FOLDER'], fn)

@app.route('/')
def hello():
    return '<p>Hello, World!</p>'

#  Auth Endpoints 
@app.route('/signup', methods=['POST'])
def signup():
    try:
        p = request.json or {}
        name, email, pw, occ = p.get('name'), p.get('email'), p.get('password'), p.get('occupation')
        if not all([name,email,pw,occ]):
            return jsonify({'error':'All fields required'}), 400
        if User.query.filter((User.email==email)|(User.name==name)).first():
            return jsonify({'error':'Email or username exists'}), 409

        hashed = bcrypt.generate_password_hash(pw)
        u = User(name=name, email=email, password=hashed, occupation=occ)
        db.session.add(u); db.session.commit()
        return jsonify({'id':u.id,'email':u.email}), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error':str(e)}), 500

@app.route('/logintoken', methods=['POST'])
def create_token():
    p = request.json or {}
    email, pw = p.get('email'), p.get('password')
    if not all([email,pw]):
        return jsonify({'error':'Email & password required'}), 400

    user = User.query.filter_by(email=email).first()
    if not user or not bcrypt.check_password_hash(user.password, pw):
        return jsonify({'error':'Wrong email or password'}), 401

    t = create_access_token(identity=email)
    return jsonify({'email':email,'access_token':t})

@app.route('/logout', methods=['POST'])
def logout():
    resp = jsonify({'msg':'logout successful'})
    unset_jwt_cookies(resp)
    return resp

@app.route('/profile/<string:getemail>')
@jwt_required()
def my_profile(getemail):
    if get_jwt_identity() != getemail:
        return jsonify({'error':'Unauthorized'}), 403
    u = User.query.filter_by(email=getemail).first()
    if not u: return jsonify({'error':'User not found'}), 404
    return jsonify({'id':u.id,'name':u.name,'email':u.email,'occupation':u.occupation})

@app.route('/profile/<string:getemail>', methods=['PUT'])
@jwt_required()
def update_profile(getemail):
    current = get_jwt_identity()
    if current != getemail:
        return jsonify({'error': 'Unauthorized Access'}), 403

    user = User.query.filter_by(email=getemail).first()
    if not user:
        return jsonify({'error': 'User not found'}), 404

    data = request.json or {}
    name     = data.get('name', '').strip()
    email    = data.get('email', '').strip()
    password = data.get('password', '').strip()

    # Validate
    if name:
        user.name = name

    if email and email != user.email:
        # ensure no one else has that email
        if User.query.filter(User.email==email, User.id!=user.id).first():
            return jsonify({'error': 'Email already in use'}), 400
        user.email = email

    if password:
        user.password = bcrypt.generate_password_hash(password)

    db.session.commit()

    return jsonify({
        'id':         user.id,
        'name':       user.name,
        'email':      user.email,
        'occupation': user.occupation
    })

#  Crop Tracker CRUD 
@app.route('/crops', methods=['POST'])
@jwt_required()
def create_crop():
    data = request.form if request.content_type.startswith('multipart/') else request.json or {}
    user = get_current_user()
    if not user: return jsonify({'error':'User not found'}),404

    for f in ['crop_type','variety','growth_stage','amount_sown']:
        if not data.get(f):
            return jsonify({'error':f'{f} required'}),400
    try:
        amt = float(data['amount_sown'])
    except:
        return jsonify({'error':'amount_sown must be number'}),400

    lat,lng=data.get('latitude'),data.get('longitude')
    img = None
    if 'crop_image' in request.files:
        f = request.files['crop_image']
        if allowed_file(f.filename):
            fn = get_uuid()+'_'+secure_filename(f.filename)
            f.save(os.path.join(UPLOAD_FOLDER,fn))
            img=fn

    c = Crop(
        crop_type    = data['crop_type'],
        variety      = data['variety'],
        growth_stage = data['growth_stage'],
        amount_sown  = amt,
        extra_notes  = data.get('extra_notes',''),
        location     = data.get('location',''),
        latitude     = float(lat) if lat else None,
        longitude    = float(lng) if lng else None,
        crop_image   = img,
        user_id      = user.id
    )
    db.session.add(c); db.session.commit()
    return jsonify({
        'id':c.id,'crop_type':c.crop_type,'variety':c.variety,'growth_stage':c.growth_stage,
        'amount_sown':c.amount_sown,'extra_notes':c.extra_notes,'location':c.location,
        'latitude':c.latitude,'longitude':c.longitude,
        'crop_image':img and request.host_url.rstrip('/')+'/uploads/'+img
    }),201

@app.route('/crops', methods=['GET'])
@jwt_required()
def get_crops():
    user = get_current_user()
    if not user: return jsonify({'error':'User not found'}),404
    crops = Crop.query.filter_by(user_id=user.id).all()
    return jsonify([{
        'id':c.id,'crop_type':c.crop_type,'variety':c.variety,'growth_stage':c.growth_stage,
        'amount_sown':c.amount_sown,'extra_notes':c.extra_notes,'location':c.location,
        'latitude':c.latitude,'longitude':c.longitude,
        'crop_image':c.crop_image and request.host_url.rstrip('/')+'/uploads/'+c.crop_image
    } for c in crops])

@app.route('/crops/<string:crop_id>', methods=['GET'])
@jwt_required()
def get_crop(crop_id):
    user = get_current_user()
    if not user: return jsonify({'error': 'User not found'}), 404
    crop = Crop.query.get(crop_id)
    if not crop: return jsonify({'error': 'Crop not found'}), 404
    if crop.user_id != user.id: return jsonify({'error': 'Unauthorized access'}), 403
    return jsonify({
        'id': crop.id, 'crop_type': crop.crop_type, 'variety': crop.variety, 'growth_stage': crop.growth_stage,
        'amount_sown': crop.amount_sown, 'extra_notes': crop.extra_notes, 'location': crop.location,
        'latitude': crop.latitude, 'longitude': crop.longitude,
        'crop_image': crop.crop_image and request.host_url.rstrip('/') + '/uploads/' + crop.crop_image
    })

@app.route('/crops/<string:crop_id>', methods=['PUT'])
@jwt_required()
def update_crop(crop_id):
    user = get_current_user()
    if not user: return jsonify({'error': 'User not found'}), 404
    crop = Crop.query.get(crop_id)
    if not crop: return jsonify({'error': 'Crop not found'}), 404
    if crop.user_id != user.id: return jsonify({'error': 'Unauthorized access'}), 403
    data = request.form if request.content_type.startswith('multipart/') else request.json or {}
    if data.get('crop_type'): crop.crop_type = data['crop_type']
    if data.get('variety'): crop.variety = data['variety']
    if data.get('growth_stage'): crop.growth_stage = data['growth_stage']
    if data.get('amount_sown'):
        try: crop.amount_sown = float(data['amount_sown'])
        except: return jsonify({'error': 'amount_sown must be valid'}), 400
    if data.get('extra_notes'): crop.extra_notes = data['extra_notes']
    if data.get('location'): crop.location = data['location']
    if data.get('latitude'): crop.latitude = float(data['latitude'])
    if data.get('longitude'): crop.longitude = float(data['longitude'])
    if 'crop_image' in request.files:
        f = request.files['crop_image']
        if f and allowed_file(f.filename):
            fn = get_uuid() + '_' + secure_filename(f.filename)
            f.save(os.path.join(app.config['UPLOAD_FOLDER'], fn))
            crop.crop_image = fn
    db.session.commit()
    return jsonify({
        'id': crop.id, 'crop_type': crop.crop_type, 'variety': crop.variety, 'growth_stage': crop.growth_stage,
        'amount_sown': crop.amount_sown, 'extra_notes': crop.extra_notes, 'location': crop.location,
        'latitude': crop.latitude, 'longitude': crop.longitude,
        'crop_image': crop.crop_image and request.host_url.rstrip('/') + '/uploads/' + crop.crop_image
    })

@app.route('/crops/<string:crop_id>', methods=['DELETE'])
@jwt_required()
def delete_crop(crop_id):
    user = get_current_user()
    if not user: return jsonify({'error': 'User not found'}), 404
    crop = Crop.query.get(crop_id)
    if not crop: return jsonify({'error': 'Crop not found'}), 404
    if crop.user_id != user.id: return jsonify({'error': 'Unauthorized access'}), 403
    db.session.delete(crop)
    db.session.commit()
    return jsonify({'msg': 'Crop deleted successfully'})

#  Finance CRUD 
@app.route('/finances', methods=['POST'])
@jwt_required()
def create_finance():
    try:
        data = request.form if request.content_type.startswith('multipart/') else request.json or {}
        for field in ['amount','currency','status']:
            if not data.get(field): return jsonify({'error': f'{field} is required'}), 400
        try: amount = float(data['amount'])
        except: return jsonify({'error':'amount must be a valid number'}),400
        status = data['status'].lower()
        if status not in ['received','sent']: return jsonify({'error':"status must be 'Received' or 'Sent'"}),400
        user = get_current_user()
        if not user: return jsonify({'error':'User not found'}),404
        receipt_path = None
        if 'receipt_image' in request.files:
            f = request.files['receipt_image']
            if f and allowed_file(f.filename):
                fn = get_uuid() + '_' + secure_filename(f.filename)
                f.save(os.path.join(app.config['UPLOAD_FOLDER'],fn))
                receipt_path = fn
        finance = Finance(amount=amount, currency=data['currency'], status=data['status'], notes=data.get('notes',''), user_id=user.id, receipt_image=receipt_path)
        db.session.add(finance)
        db.session.commit()
        return jsonify({
            'id':finance.id,'amount':finance.amount,'currency':finance.currency,'status':finance.status,
            'notes':finance.notes,'receipt_image':receipt_path and request.host_url.rstrip('/')+'/uploads/'+receipt_path,
            'total':finance.total,'timestamp':finance.timestamp.isoformat()
        }),201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error':str(e)}),500

@app.route('/finances', methods=['GET'])
@jwt_required()
def get_finances():
    try:
        user = get_current_user()
        if not user: return jsonify({'error':'User not found'}),404
        finances = Finance.query.filter_by(user_id=user.id).order_by(Finance.timestamp.desc()).all()
        out=[]
        for fin in finances:
            out.append({
                'id':fin.id,'amount':fin.amount,'currency':fin.currency,'status':fin.status,
                'notes':fin.notes,'receipt_image':fin.receipt_image and request.host_url.rstrip('/')+'/uploads/'+fin.receipt_image,
                'total':fin.total,'timestamp':fin.timestamp.isoformat()
            })
        return jsonify(out)
    except Exception as e:
        return jsonify({'error':str(e)}),500

@app.route('/finances/<string:finance_id>', methods=['PUT'])
@jwt_required()
def update_finance(finance_id):
    try:
        user = get_current_user()
        if not user: return jsonify({'error':'User not found'}),404
        fin = Finance.query.get(finance_id)
        if not fin: return jsonify({'error':'Finance record not found'}),404
        if fin.user_id != user.id: return jsonify({'error':'Unauthorized access'}),403
        data = request.form if request.content_type.startswith('multipart/') else request.json or {}
        if data.get('amount'):
            try: fin.amount = float(data['amount'])
            except: return jsonify({'error':'amount must be a valid number'}),400
        if data.get('currency'): fin.currency=data['currency']
        if data.get('status'):
            st=data['status'].lower()
            if st not in ['received','sent']: return jsonify({'error':"status must be 'Received' or 'Sent'"}),400
            fin.status=data['status']
        if data.get('notes'): fin.notes=data['notes']
        if 'receipt_image' in request.files:
            f=request.files['receipt_image']
            if f and allowed_file(f.filename):
                fn=get_uuid()+'_'+secure_filename(f.filename)
                f.save(os.path.join(app.config['UPLOAD_FOLDER'],fn))
                fin.receipt_image=fn
        db.session.commit()
        return jsonify({
            'id':fin.id,'amount':fin.amount,'currency':fin.currency,'status':fin.status,
            'notes':fin.notes,'receipt_image':fin.receipt_image and request.host_url.rstrip('/')+'/uploads/'+fin.receipt_image,
            'total':fin.total,'timestamp':fin.timestamp.isoformat()
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({'error':str(e)}),500

@app.route('/finances/<string:finance_id>', methods=['DELETE'])
@jwt_required()
def delete_finance(finance_id):
    try:
        user = get_current_user()
        if not user: return jsonify({'error':'User not found'}),404
        fin=Finance.query.get(finance_id)
        if not fin: return jsonify({'error':'Finance record not found'}),404
        if fin.user_id!=user.id: return jsonify({'error':'Unauthorized access'}),403
        db.session.delete(fin)
        db.session.commit()
        return jsonify({'msg':'Finance record deleted successfully'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error':str(e)}),500

#  Map Plot Endpoints 
@app.route('/api/plots', methods=['GET'])
@jwt_required()
def get_plots():
    user = get_current_user()
    if not user: return jsonify({'error':'User not found'}),404
    return jsonify([p.to_dict() for p in CropPlot.query.all()])

@app.route('/api/plots', methods=['POST'])
@jwt_required()
def create_plot():
    user = get_current_user()
    if not user: return jsonify({'error':'User not found'}),404
    data=request.get_json() or {}
    name=(data.get('name') or '').strip()
    if not name:
        return jsonify({'error':'name is required'}),400
    try:
        latitude=float(data.get('latitude',0))
        longitude=float(data.get('longitude',0))
    except (TypeError, ValueError):
        return jsonify({'error':'latitude and longitude must be numbers'}),400
    plot=CropPlot(name=name, latitude=latitude, longitude=longitude)
    db.session.add(plot)
    db.session.commit()
    return jsonify(plot.to_dict()),201

#  Reminders Endpoints 
@app.route('/api/reminders', methods=['GET'])
@jwt_required()
def get_reminders():
    user=get_current_user()
    if not user: return jsonify({'error':'User not found'}),404
    items=Reminder.query.filter_by(user_id=user.id).order_by(Reminder.date).all()
    return jsonify([{'id':r.id,'date':r.date.isoformat(),'title':r.title,'description':r.description} for r in items]),200

@app.route('/api/reminders', methods=['POST'])
@jwt_required()
def add_reminder():
    user = get_current_user()
    if not user: return jsonify({'error': 'User not found'}), 404
    data = request.get_json() or {}

    date_str = (data.get('date') or '').strip()
    title = (data.get('title') or '').strip()
    description = (data.get('description') or '').strip()

    if not date_str or not title or not description:
        return jsonify({'error': 'Missing date, title, or description'}), 400

    try:
        rem_date = datetime.strptime(date_str, '%Y-%m-%d').date()
    except ValueError:
        return jsonify({'error': 'Invalid date format'}), 400

    rem = Reminder(date=rem_date, title=title, description=description, user_id=user.id)
    db.session.add(rem)
    db.session.commit()

    return jsonify({
        'id': rem.id,
        'date': rem.date.isoformat(),
        'title': rem.title,
        'description': rem.description
    }), 201

@app.route('/api/reminders/<string:reminder_id>', methods=['PUT'])
@jwt_required()
def update_reminder(reminder_id):
    user=get_current_user()
    if not user: return jsonify({'error':'User not found'}),404
    data=request.get_json() or {}
    title=(data.get('title')or '').strip()
    description=(data.get('description')or '').strip()
    if not title or not description: return jsonify({'error':'Missing title or description'}),400
    rem=Reminder.query.filter_by(id=reminder_id,user_id=user.id).first()
    if not rem: return jsonify({'error':'Reminder not found'}),404
    rem.title=title; rem.description=description; db.session.commit()
    return jsonify({'id':rem.id,'date':rem.date.isoformat(),'title':rem.title,'description':rem.description}),200

@app.route('/api/reminders/<string:reminder_id>', methods=['DELETE'])
@jwt_required()
def delete_reminder(reminder_id):
    user=get_current_user()
    if not user: return jsonify({'error':'User not found'}),404
    rem=Reminder.query.filter_by(id=reminder_id,user_id=user.id).first()
    if not rem: return jsonify({'error':'Reminder not found'}),404
    db.session.delete(rem); db.session.commit()
    return jsonify({'msg':'Reminder deleted'}),200

# Model and AI Endpoints
@app.route('/api/check-model', methods=['POST'])
def check_model():
    # Report whether the app's own AI model is loaded. We intentionally do NOT
    # accept a client-supplied filesystem path here, as that would let an
    # unauthenticated caller probe for the existence of arbitrary files on the
    # server.
    if MODEL is None:
        return jsonify({'success': False, 'error': 'Model not loaded'}), 404
    return jsonify({'success': True})

@app.route('/api/model-status', methods=['GET'])
def model_status():
    return jsonify({
        'tensorflow_available': TENSORFLOW_AVAILABLE,
        'model_loaded': MODEL is not None,
        'model_path': 'plant_disease_model_v3.keras',
        'classes_count': len(CLASS_NAMES),
        'available_classes': CLASS_NAMES[:5] + ['...'] if len(CLASS_NAMES) > 5 else CLASS_NAMES,
        'status': 'ready' if MODEL is not None else 'tensorflow_missing' if not TENSORFLOW_AVAILABLE else 'model_not_loaded'
    })

@app.route('/api/analyze-leaf', methods=['POST'])
def analyze_leaf():
    print("🔍 Received analyze-leaf request")
    
    # Check if TensorFlow/Keras is available
    if not TENSORFLOW_AVAILABLE and keras is None:
        print("❌ TensorFlow/Keras not available")
        return jsonify({
            'error': 'TensorFlow/Keras not installed. Please install with: pip install tensorflow',
            'status': 'tensorflow_missing'
        }), 503
    
    # Check if model is loaded
    if MODEL is None:
        print("❌ Model not loaded")
        return jsonify({
            'error': 'AI model not loaded. Please ensure plant_disease_model_v3.keras is available.',
            'model_path': 'plant_disease_model_v3.keras',
            'status': 'model_not_loaded'
        }), 503
    
    try:
        # Get the JSON data from request
        data = request.get_json()
        if not data or 'imageData' not in data:
            print("❌ No image data provided")
            return jsonify({'error': 'No image data provided'}), 400
        
        print("📷 Processing image data...")
        
        # Decode base64 image
        try:
            # Remove data URL prefix if present
            image_data = data['imageData']
            if 'base64,' in image_data:
                image_data = image_data.split('base64,')[1]
            
            image_bytes = base64.b64decode(image_data)
            print(f"✅ Image decoded successfully ({len(image_bytes)} bytes)")
        except Exception as e:
            print(f"❌ Failed to decode image: {e}")
            return jsonify({'error': f'Invalid image data: {str(e)}'}), 400

        # Open and preprocess the image
        try:
            image = Image.open(io.BytesIO(image_bytes))
            print(f"📊 Original image: {image.size}, mode: {image.mode}")
            
            # Convert to RGB if necessary
            if image.mode != 'RGB':
                image = image.convert('RGB')
                print("🔄 Converted image to RGB")
                
            # Resize to model input size
            image = image.resize((128, 128))
            print("📏 Resized image to 128x128")
            
            # Convert to numpy array and normalize
            img_array = np.array(image, dtype=np.float32) / 255.0
            
            # Ensure proper shape: (1, 128, 128, 3)
            if len(img_array.shape) == 2:
                img_array = np.stack((img_array,) * 3, axis=-1)
            elif img_array.shape[2] == 4:  # RGBA to RGB
                img_array = img_array[:, :, :3]

            img_array = np.expand_dims(img_array, axis=0)
            
            print(f"✅ Image preprocessed - Shape: {img_array.shape}")
            
        except Exception as e:
            print(f"❌ Image preprocessing failed: {e}")
            return jsonify({'error': f'Image preprocessing failed: {str(e)}'}), 400

        # Make prediction
        try:
            print("🤖 Making prediction...")
            predictions = MODEL.predict(img_array, verbose=0)[0]
            confidence = float(np.max(predictions) * 100)
            class_index = int(np.argmax(predictions))
            predicted_class = CLASS_NAMES[class_index]

            print(f"🎯 Prediction: {predicted_class}")
            print(f"📊 Confidence: {confidence:.2f}%")
            print(f"🔢 Class index: {class_index}")

        except Exception as e:
            print(f"❌ Prediction failed: {e}")
            return jsonify({'error': f'Prediction failed: {str(e)}'}), 500

        # Process results
        is_healthy = "healthy" in predicted_class.lower()
        
        # Parse plant name and condition
        parts = predicted_class.split('___')
        if len(parts) >= 2:
            plant_name = parts[0].replace('_', ' ').title()
            condition = parts[1].replace('_', ' ').title()
        else:
            plant_name = predicted_class.replace('_', ' ').title()
            condition = "Unknown"

        # Generate detailed response
        status_emoji = "✅" if is_healthy else "⚠️"
        status_text = "This leaf appears healthy!" if is_healthy else "This leaf shows signs of disease and may need treatment."
        
        result = {
            'isHealthy': is_healthy,
            'confidence': round(confidence, 2),
            'className': predicted_class,
            'plantName': plant_name,
            'condition': condition,
            'details': f"Plant: {plant_name}\nCondition: {condition}\nConfidence: {confidence:.1f}%\n{status_emoji} {status_text}"
        }
        
        print(f"✅ Analysis complete: {plant_name} - {condition} ({confidence:.1f}%)")
        return jsonify(result)

    except Exception as e:
        import traceback
        print(f"❌ Unexpected error in analyze_leaf: {str(e)}")
        traceback.print_exc()
        return jsonify({'error': f'Analysis failed: {str(e)}'}), 500

#  Run App 
if __name__ == '__main__':
    print("\n" + "="*50)
    print("🌱 CROP MANAGEMENT SYSTEM STARTING")
    print("="*50)
    print(f"🔧 TensorFlow Available: {TENSORFLOW_AVAILABLE}")
    print(f"🤖 Model Loaded: {MODEL is not None}")
    print(f"🌐 Frontend URL: {FRONTEND_URL}")
    print(f"📁 Upload Folder: {UPLOAD_FOLDER}")
    print("="*50 + "\n")

    # Debug mode exposes the Werkzeug interactive debugger, which allows
    # arbitrary code execution. Keep it OFF unless explicitly enabled for
    # local development via FLASK_DEBUG=1. Bind to localhost by default so the
    # dev server is not exposed on all network interfaces.
    debug_mode = os.getenv('FLASK_DEBUG', '0') == '1'
    host = os.getenv('FLASK_HOST', '127.0.0.1')
    port = int(os.getenv('FLASK_PORT', '5000'))
    app.run(debug=debug_mode, use_reloader=debug_mode, host=host, port=port)