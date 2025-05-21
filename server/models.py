from flask_sqlalchemy import SQLAlchemy
from uuid import uuid4
from datetime import datetime
from sqlalchemy import event
from sqlalchemy.orm import Session

# initialize SQLAlchemy
db = SQLAlchemy()

# Utility function to generate unique UUIDs
def get_uuid():
    return uuid4().hex

# User model
class User(db.Model):
    __tablename__ = "users"
    id         = db.Column(db.String(32), primary_key=True, unique=True, default=get_uuid)
    name       = db.Column(db.String(150), unique=True)
    email      = db.Column(db.String(150), unique=True)
    password   = db.Column(db.Text, nullable=False)
    occupation = db.Column(db.Text, nullable=False)

    # One-to-many: a user can have many crops and finances
    crops    = db.relationship('Crop',    back_populates='owner', cascade='all, delete-orphan', lazy=True)
    finances = db.relationship('Finance', back_populates='owner', cascade='all, delete-orphan', lazy=True)

# Crop model
class Crop(db.Model):
    __tablename__ = "crops"
    id           = db.Column(db.String(32), primary_key=True, unique=True, default=get_uuid)
    crop_type    = db.Column(db.String(150), nullable=False)
    variety      = db.Column(db.String(150), nullable=False)
    growth_stage = db.Column(db.String(100), nullable=False)
    amount_sown  = db.Column(db.Float, nullable=False)
    extra_notes  = db.Column(db.Text)
    location     = db.Column(db.String(150), nullable=True)
    latitude     = db.Column(db.Float, nullable=True)
    longitude    = db.Column(db.Float, nullable=True)
    crop_image   = db.Column(db.String(255), nullable=True)
    user_id      = db.Column(db.String(32), db.ForeignKey('users.id'), nullable=False)

    # Relationship to User
    owner     = db.relationship('User', back_populates='crops', lazy=True)

    # One-to-many: a crop can have many soil readings
    soil_data = db.relationship('SoilData', back_populates='crop', cascade='all, delete-orphan', lazy=True)

# Finance model
class Finance(db.Model):
    __tablename__ = "finances"
    id            = db.Column(db.String(32), primary_key=True, unique=True, default=get_uuid)
    amount        = db.Column(db.Float, nullable=False)
    currency      = db.Column(db.String(10), nullable=False)
    status        = db.Column(db.String(10), nullable=False)
    notes         = db.Column(db.Text)
    total         = db.Column(db.Float, nullable=False, default=0.0)
    timestamp     = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    receipt_image = db.Column(db.String(255), nullable=True)
    user_id       = db.Column(db.String(32), db.ForeignKey('users.id'), nullable=False)

    # Relationship to User
    owner = db.relationship('User', back_populates='finances', lazy=True)

# CropPlot model
class CropPlot(db.Model):
    __tablename__ = 'crop_plots'
    id         = db.Column(db.Integer, primary_key=True)
    name       = db.Column(db.String(100), nullable=False)
    latitude   = db.Column(db.Float, nullable=False)
    longitude  = db.Column(db.Float, nullable=False)

    def to_dict(self):
        return {
            'id':        self.id,
            'name':      self.name,
            'latitude':  self.latitude,
            'longitude': self.longitude,
        }

# Finance total calculation\@event.listens_for(Finance, 'before_insert')
def update_total(mapper, connection, target):
    sess = Session(bind=connection)
    last = sess.query(Finance) \
               .filter(Finance.user_id == target.user_id) \
               .order_by(Finance.timestamp.desc()) \
               .first()
    prev_total = last.total if last else 0.0
    if target.status.lower() == 'received':
        target.total = prev_total + target.amount
    elif target.status.lower() == 'sent':
        target.total = prev_total - target.amount
    else:
        target.total = prev_total

# Reminder model
class Reminder(db.Model):
    __tablename__ = "reminders"

    id          = db.Column(db.String(32), primary_key=True, unique=True, default=get_uuid)
    date        = db.Column(db.Date, nullable=False)
    title       = db.Column(db.String(150), nullable=False)
    description = db.Column(db.Text, nullable=False)
    user_id     = db.Column(db.String(32), db.ForeignKey('users.id'), nullable=False)

    # Relationship to User
    user = db.relationship('User', backref=db.backref('reminders', cascade='all, delete-orphan', lazy=True), lazy=True)

# SoilData model
class SoilData(db.Model):
    __tablename__ = "soil_data"

    id           = db.Column(db.String(32), primary_key=True, unique=True, default=get_uuid)
    pH           = db.Column(db.Float, nullable=False)
    moisture     = db.Column(db.Float, nullable=False)
    temperature  = db.Column(db.Float, nullable=False)
    timestamp    = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    location     = db.Column(db.String(150), nullable=True)
    latitude     = db.Column(db.Float, nullable=True)
    longitude    = db.Column(db.Float, nullable=True)
    crop_id      = db.Column(db.String(32), db.ForeignKey('crops.id'), nullable=False)

    # Relationship to Crop
    crop = db.relationship('Crop', back_populates='soil_data', lazy=True)

    def __repr__(self):
        return f"<SoilData id={self.id}, pH={self.pH}, moisture={self.moisture}, temperature={self.temperature}>"
