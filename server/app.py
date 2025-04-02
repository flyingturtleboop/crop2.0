import json
from flask import Flask, request, jsonify
from datetime import datetime, timedelta, timezone
from flask_jwt_extended import (
    create_access_token, get_jwt, get_jwt_identity, unset_jwt_cookies, 
    jwt_required, JWTManager
)
from flask_bcrypt import Bcrypt
from flask_cors import CORS
from models import db, User, Crop
 
app = Flask(__name__)
CORS(app, supports_credentials=True)
 
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
    if user is None:
        return jsonify({"error": "Wrong email or password"}), 401
      
    if not bcrypt.check_password_hash(user.password, password):
        return jsonify({"error": "Wrong email or password"}), 401
      
    access_token = create_access_token(identity=email)
  
    return jsonify({
        "email": email,
        "access_token": access_token
    })

@app.route("/signup", methods=["POST"])
def signup():
    try:
        name = request.json.get("name")
        email = request.json.get("email")
        password = request.json.get("password")
        occupation = request.json.get("occupation")
        
        # Validate required fields
        if not name or not email or not password or not occupation:
            return jsonify({"error": "Name, email, password, and occupation are required"}), 400
   
        user_exists = User.query.filter_by(email=email).first() is not None
        name_exists = User.query.filter_by(name=name).first() is not None
   
        if user_exists:
            return jsonify({"error": "Email already exists"}), 409
            
        if name_exists:
            return jsonify({"error": "Username already exists"}), 409
           
        hashed_password = bcrypt.generate_password_hash(password)
        new_user = User(name=name, email=email, password=hashed_password, occupation=occupation)
        db.session.add(new_user)
        db.session.commit()
   
        return jsonify({
            "id": new_user.id,
            "email": new_user.email
        })
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
            if type(data) is dict:
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
    # Verify that the requesting user can only access their own profile
    current_user = get_jwt_identity()
    if current_user != getemail:
        return jsonify({"error": "Unauthorized Access"}), 403
       
    user = User.query.filter_by(email=getemail).first()
    if not user:
        return jsonify({"error": "User not found"}), 404
  
    response_body = {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "occupation": user.occupation
    }
  
    return response_body

# ----------------------------
# Crop Tracker CRUD Endpoints
# ----------------------------

# Helper function to get current user
def get_current_user():
    email = get_jwt_identity()
    return User.query.filter_by(email=email).first()

@app.route('/crops', methods=["POST"])
@jwt_required()
def create_crop():
    try:
        data = request.json
        current_user = get_current_user()
        
        if not current_user:
            return jsonify({"error": "User not found"}), 404
        
        # Validate required fields
        required_fields = ["crop_type", "variety", "growth_stage", "amount_sown", "location"]
        for field in required_fields:
            if not data.get(field):
                return jsonify({"error": f"{field} is required"}), 400
            
        # Try to convert amount_sown to float
        try:
            amount_sown = float(data.get("amount_sown"))
        except (ValueError, TypeError):
            return jsonify({"error": "amount_sown must be a valid number"}), 400
            
        crop = Crop(
            crop_type=data.get("crop_type"),
            variety=data.get("variety"),
            growth_stage=data.get("growth_stage"),
            amount_sown=amount_sown,
            extra_notes=data.get("extra_notes", ""),
            location=data.get("location"),
            user_id=current_user.id  # Associate crop with current user
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
            "location": crop.location
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
            
        # Filter crops by the current user's ID
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
                "location": crop.location
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
            
        # Check if the crop belongs to the current user
        if crop.user_id != current_user.id:
            return jsonify({"error": "Unauthorized access"}), 403
            
        return jsonify({
            "id": crop.id,
            "crop_type": crop.crop_type,
            "variety": crop.variety,
            "growth_stage": crop.growth_stage,
            "amount_sown": crop.amount_sown,
            "extra_notes": crop.extra_notes,
            "location": crop.location
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
            
        # Check if the crop belongs to the current user
        if crop.user_id != current_user.id:
            return jsonify({"error": "Unauthorized access"}), 403
            
        data = request.json
        
        # Update fields if provided
        if "crop_type" in data:
            crop.crop_type = data["crop_type"]
        if "variety" in data:
            crop.variety = data["variety"]
        if "growth_stage" in data:
            crop.growth_stage = data["growth_stage"]
            
        # Handle amount_sown specially since it needs to be a float
        if "amount_sown" in data:
            try:
                crop.amount_sown = float(data["amount_sown"])
            except (ValueError, TypeError):
                return jsonify({"error": "amount_sown must be a valid number"}), 400
                
        if "extra_notes" in data:
            crop.extra_notes = data["extra_notes"]
        if "location" in data:
            crop.location = data["location"]
            
        db.session.commit()
        return jsonify({
            "id": crop.id,
            "crop_type": crop.crop_type,
            "variety": crop.variety,
            "growth_stage": crop.growth_stage,
            "amount_sown": crop.amount_sown,
            "extra_notes": crop.extra_notes,
            "location": crop.location
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
            
        # Check if the crop belongs to the current user
        if crop.user_id != current_user.id:
            return jsonify({"error": "Unauthorized access"}), 403
            
        db.session.delete(crop)
        db.session.commit()
        return jsonify({"msg": "Crop deleted successfully"})
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
 
if __name__ == '__main__':
    app.run(debug=True, use_reloader=True)