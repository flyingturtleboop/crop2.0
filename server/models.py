from flask_sqlalchemy import SQLAlchemy
from uuid import uuid4
  
db = SQLAlchemy()
  
def get_uuid():
    return uuid4().hex
  
class User(db.Model):
    __tablename__ = "users"
    id = db.Column(db.String(32), primary_key=True, unique=True, default=get_uuid)
    name = db.Column(db.String(150), unique=True)
    email = db.Column(db.String(150), unique=True)
    password = db.Column(db.Text, nullable=False)
    occupation = db.Column(db.Text, nullable=False)
    # Add relationship to crops
    crops = db.relationship('Crop', backref='owner', lazy=True, cascade="all, delete-orphan")

class Crop(db.Model):
    __tablename__ = "crops"
    id = db.Column(db.String(32), primary_key=True, unique=True, default=get_uuid)
    crop_type = db.Column(db.String(150), nullable=False)
    variety = db.Column(db.String(150), nullable=False)
    growth_stage = db.Column(db.String(100), nullable=False)
    amount_sown = db.Column(db.Float, nullable=False)
    extra_notes = db.Column(db.Text)
    location = db.Column(db.String(150), nullable=False)
    # Add foreign key to user
    user_id = db.Column(db.String(32), db.ForeignKey('users.id'), nullable=False)