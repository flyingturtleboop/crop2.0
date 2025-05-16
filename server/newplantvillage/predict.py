import sys, os, io
from pathlib import Path
import numpy as np
import tensorflow as tf
from PIL import Image

try:
    from tkinter import Tk, filedialog
    HAVE_TK = True
except ImportError:
    HAVE_TK = False
    
BASE_DIR = Path(__file__).resolve().parent

# point at the 'datasets' folder next to predict.py
DATA_DIR = BASE_DIR / "datasets"

# now you can safely iterate over DATA_DIR
MODEL_PATH = BASE_DIR / "plant_disease_model.h5"
print("Will load model from:", MODEL_PATH)
if not MODEL_PATH.exists():
    raise FileNotFoundError(f"Model not found at {MODEL_PATH}")

# ─── 2) Build the class list from your folders ─────────────────────────────────
CLASS_NAMES = sorted([p.name for p in DATA_DIR.iterdir() if p.is_dir()])
print(f"Loaded {len(CLASS_NAMES)} classes: {CLASS_NAMES}")

# ─── 3) Load your trained model ────────────────────────────────────────────────
model = tf.keras.models.load_model(str(MODEL_PATH))

# ─── 4) Ask user to pick an image ─────────────────────────────────────────────
img_path = None
if HAVE_TK:
    root = Tk()
    root.withdraw()
    # force window to front
    root.update(); root.lift(); root.attributes('-topmost', True)
    root.after_idle(root.attributes, '-topmost', False)

    img_path = filedialog.askopenfilename(
      title="Select a plant image…",
      filetypes=[("Image files","*.jpg *.jpeg *.png *.bmp")])

if not img_path:
    img_path = input("Enter full path to your image (or blank to quit): ").strip()

if not img_path:
    print("No image selected; exiting.")
    sys.exit(0)

# ─── 5) Preprocess with the exact size your model expects ──────────────────────
_, H, W, _ = model.input_shape
img = Image.open(img_path).convert("RGB").resize((W, H))
arr = np.array(img, dtype=np.float32) / 255.0
arr = np.expand_dims(arr, axis=0)   # shape = (1, H, W, 3)

# ─── 6) Run inference ──────────────────────────────────────────────────────────
preds = model.predict(arr)[0]
idx   = int(np.argmax(preds))
conf  = float(preds[idx])

# ─── 7) Show the result ────────────────────────────────────────────────────────
print(f"Prediction: {CLASS_NAMES[idx]}  ({conf:.1%} confidence)")
