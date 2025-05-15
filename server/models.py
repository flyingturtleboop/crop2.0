from flask_sqlalchemy import SQLAlchemy
from uuid import uuid4
from datetime import datetime
from sqlalchemy import event
from sqlalchemy.orm import Session

db = SQLAlchemy()

def get_uuid():
    return uuid4().hex

class User(db.Model):
    __tablename__ = "users"
    id        = db.Column(db.String(32), primary_key=True, unique=True, default=get_uuid)
    name      = db.Column(db.String(150), unique=True)
    email     = db.Column(db.String(150), unique=True)
    password  = db.Column(db.Text, nullable=False)
    occupation= db.Column(db.Text, nullable=False)
    crops     = db.relationship('Crop',   backref='owner', lazy=True, cascade="all, delete-orphan")
    finances  = db.relationship('Finance',backref='owner', lazy=True, cascade="all, delete-orphan")

class Crop(db.Model):
    __tablename__ = "crops"
    id           = db.Column(db.String(32), primary_key=True, unique=True, default=get_uuid)
    crop_type    = db.Column(db.String(150), nullable=False)
    variety      = db.Column(db.String(150), nullable=False)
    growth_stage = db.Column(db.String(100), nullable=False)
    amount_sown  = db.Column(db.Float, nullable=False)
    extra_notes  = db.Column(db.Text)
    location     = db.Column(db.String(150), nullable=True)    # made optional
    latitude     = db.Column(db.Float,   nullable=True)       # new
    longitude    = db.Column(db.Float,   nullable=True)       # new
    crop_image   = db.Column(db.String(255), nullable=True)
    user_id      = db.Column(db.String(32), db.ForeignKey('users.id'), nullable=False)

class Finance(db.Model):
    __tablename__ = "finances"
    id            = db.Column(db.String(32), primary_key=True, unique=True, default=get_uuid)
    amount        = db.Column(db.Float, nullable=False)
    currency      = db.Column(db.String(10), nullable=False)
    status        = db.Column(db.String(10), nullable=False)  # "Received" or "Sent"
    notes         = db.Column(db.Text)
    total         = db.Column(db.Float, nullable=False, default=0.0)
    timestamp     = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    receipt_image = db.Column(db.String(255), nullable=True)
    user_id       = db.Column(db.String(32), db.ForeignKey('users.id'), nullable=False)

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

@event.listens_for(Finance, 'before_insert')
def update_total(mapper, connection, target):
    sess = Session(bind=connection)
    last = sess.query(Finance)\
               .filter(Finance.user_id == target.user_id)\
               .order_by(Finance.timestamp.desc())\
               .first()
    prev_total = last.total if last else 0.0
    if target.status.lower() == "received":
        target.total = prev_total + target.amount
    elif target.status.lower() == "sent":
        target.total = prev_total - target.amount
    else:
        target.total = prev_total

class Reminder(db.Model):
    __tablename__ = "reminders"
    id = db.Column(db.String(32), primary_key=True, unique=True, default=get_uuid)
    date = db.Column(db.Date, nullable=False)  # Stores the reminder's date (no time)
    content = db.Column(db.Text, nullable=False)
    user_id = db.Column(db.String(32), db.ForeignKey("users.id"), nullable=False)
    user = db.relationship("User", backref=db.backref("reminders", lazy=True, cascade="all, delete-orphan"))
