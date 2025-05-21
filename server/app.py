import json
import os
from datetime import datetime, timedelta, timezone
import base64
import numpy as np
import tensorflow as tf
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
app.secret_key = os.urandom(24)
CORS(app, supports_credentials=True)
FRONTEND_URL = os.getenv('FRONTEND_URL', 'http://localhost:5173')

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
    response.headers["Access-Control-Allow-Origin"]  = "http://localhost:5173"
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
def get_plots():
    return jsonify([p.to_dict() for p in CropPlot.query.all()])

@app.route('/api/plots', methods=['POST'])
def create_plot():
    data=request.get_json() or {}
    plot=CropPlot(name=data['name'], latitude=data.get('latitude',0), longitude=data.get('longitude',0))
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

@app.route('/api/check-model', methods=['POST'])
def check_model():
    data = request.get_json()
    model_path = data.get("modelPath")

    if not model_path or not os.path.exists(model_path):
        return jsonify({'success': False, 'error': 'Model not found'}), 404

    return jsonify({'success': True})

MODEL = tf.keras.models.load_model('newplantvillage/plant_disease_model.h5')

@app.route('/api/analyze-leaf', methods=['POST'])
def analyze_leaf():
    try:
        data = request.get_json()
        image_data = data['imageData'].split(',')[1]  
        image_bytes = base64.b64decode(image_data)

        image = Image.open(io.BytesIO(image_bytes)).resize((128, 128))
        img_array = np.array(image) / 255.0

        if img_array.ndim == 2:
            img_array = np.stack((img_array,)*3, axis=-1)
        elif img_array.shape[2] == 4:
            img_array = img_array[:, :, :3]

        img_array = np.expand_dims(img_array, axis=0)

        predictions = MODEL.predict(img_array)[0]
        confidence = float(np.max(predictions) * 100)
        class_index = int(np.argmax(predictions))

        is_healthy = class_index == 0 

        return jsonify({
            'isHealthy': is_healthy,
            'confidence': confidence,
            'details': 'Possible signs of leaf spot disease detected. Consider treatment with fungicide.' if not is_healthy else 'No visible signs of disease detected. Leaf appears healthy.'
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/soil-data', methods=['POST'])
@jwt_required()
def add_soil_data():
    data = request.json or {}
    user = get_current_user()  
    if not user:
        return jsonify({'error': 'User not found'}), 404

    for field in ['pH', 'moisture', 'temperature', 'crop_id']:
        if not data.get(field):
            return jsonify({'error': f'{field} is required'}), 400

    try:
        soil_data = SoilData(
            pH=data['pH'],
            moisture=data['moisture'],
            temperature=data['temperature'],
            location=data.get('location', ''),  
            latitude=data.get('latitude'),  
            longitude=data.get('longitude'),  
            crop_id=data['crop_id']  
        )
        db.session.add(soil_data)
        db.session.commit()  
        return jsonify({
            'id': soil_data.id,
            'pH': soil_data.pH,
            'moisture': soil_data.moisture,
            'temperature': soil_data.temperature,
            'location': soil_data.location,
            'latitude': soil_data.latitude,
            'longitude': soil_data.longitude,
            'timestamp': soil_data.timestamp.isoformat()
        }), 201

    except Exception as e:
        db.session.rollback()  
        return jsonify({'error': str(e)}), 500


# API to get soil data for a specific crop
@app.route('/api/soil-data/<crop_id>', methods=['GET'])
@jwt_required()
def get_soil_data(crop_id):
    user = get_current_user()
    if not user:
        return jsonify({'error': 'User not found'}), 404

    # Fetch soil data for the given crop_id
    soil_data = SoilData.query.filter_by(crop_id=crop_id).all()
    if not soil_data:
        return jsonify({'error': 'No soil data found for this crop'}), 404

    result = [{
        'id': data.id,
        'pH': data.pH,
        'moisture': data.moisture,
        'temperature': data.temperature,
        'timestamp': data.timestamp.isoformat(),
        'location': data.location,
        'latitude': data.latitude,
        'longitude': data.longitude
    } for data in soil_data]

    return jsonify(result)

# API to update soil data
@app.route('/api/soil-data/<string:soil_id>', methods=['PUT'])
@jwt_required()
def update_soil_data(soil_id):
    user = get_current_user()
    if not user:
        return jsonify({'error': 'User not found'}), 404

    soil_data = SoilData.query.get(soil_id)
    if not soil_data:
        return jsonify({'error': 'Soil data not found'}), 404

    data = request.json or {}

    for field in ['pH', 'moisture', 'temperature']:
        if data.get(field):
            setattr(soil_data, field, data[field])

    if 'location' in data:
        soil_data.location = data['location']
    if 'latitude' in data:
        soil_data.latitude = data['latitude']
    if 'longitude' in data:
        soil_data.longitude = data['longitude']

    db.session.commit()

    return jsonify({
        'id': soil_data.id,
        'pH': soil_data.pH,
        'moisture': soil_data.moisture,
        'temperature': soil_data.temperature,
        'location': soil_data.location,
        'latitude': soil_data.latitude,
        'longitude': soil_data.longitude,
        'timestamp': soil_data.timestamp.isoformat()
    })

# API to delete soil data
@app.route('/api/soil-data/<string:soil_id>', methods=['DELETE'])
@jwt_required()
def delete_soil_data(soil_id):
    user = get_current_user()
    if not user:
        return jsonify({'error': 'User not found'}), 404

    soil_data = SoilData.query.get(soil_id)
    if not soil_data:
        return jsonify({'error': 'Soil data not found'}), 404

    db.session.delete(soil_data)
    db.session.commit()

    return jsonify({'msg': 'Soil data deleted successfully'})

#  Run App 
if __name__ == '__main__':
    app.run(debug=True, use_reloader=True)
