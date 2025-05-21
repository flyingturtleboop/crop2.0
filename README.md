# CropAI

Smart Crop Management. CropAI helps farmers track, analyze, and optimize their crops through a modern web interface and an AI model for disease detection.

---

## Table of Contents

* [About The Project](#about-the-project)

  * [Built With](#built-with)
* [Getting Started](#getting-started)

  * [Prerequisites](#prerequisites)
  * [Installation](#installation)
* [Usage](#usage)
* [API Reference](#api-reference)
* [Contributing](#contributing)

---

## About The Project

CropAI combines a React/TypeScript frontend, a Flask backend, and an TensorFlow CNN model to deliver:

* **Account & Profile Management**
* **Crop & Finance Tracking**
* **Interactive Field Mapping**
* **Reminders & Calendar**
* **AI-powered Leaf Disease Detection**

### Built With

* **Frontend:** Vite, React, TypeScript, Tailwind CSS, lucide‑react
* **Backend:** Flask, SQLAlchemy, Flask-Migrate, JWT Auth, Flask-Bcrypt
* **AI/ML:** TensorFlow/Keras (Adam optimizer)
* **Database:** SQLite

---

## Getting Started

Follow these steps to get a local copy up and running.

### Prerequisites

* **Node.js** 
* **Python 3.8+**
* **Git**

### Installation

1. **Clone the repo**

   ```bash
   git clone <your‑repo‑url>
   cd cropAI
   ```

2. **Frontend setup**

   ```bash
   cd client
   npm install
   npm run dev
   # Visit http://localhost:5173
   ```

3. **Backend setup**

   ```bash
   cd server
   python3 -m venv venv
   source venv/bin/activate    # (Windows) venv\Scripts\activate.ps1
   pip install -r requirements.txt
   flask db upgrade          
   flask run                
   ```

## Usage

[Back to top](#table-of-contents)

### Running the Full Stack

* **Frontend:** keeps hot‑reload at `http://localhost:5173`
* **Backend:** serves JSON API at `http://localhost:5000`

After logging in or signing up, explore:

* **Dashboard** – View summaries
* **Crops** – Add/edit/delete crop records
* **Finances** – Track expenses & income
* **Analysis** – Upload an image of your plant's leaf to see if it is healthy or has a disease
* **Maps** – Pin and view field locations
* **Settings** – Manage account & notifications
* **Calendar** – Schedule reminders


### AI Inference

To detect plant diseases from a leaf image:

```bash
# GUI picker
python predict.py
# or
python predict.py path/to/image.jpg
```

The script will load `plant_disease_model.h5`, prompt for an image, and print the predicted class with confidence.

---

## API Reference

| Route                             | Method         | Description                                                      |
| --------------------------------- | -------------- | ---------------------------------------------------------------- |
| `/signup`                         | POST           | Create a new user                                                |
| `/logintoken`                     | POST           | Login and retrieve a JWT                                         |
| `/logout`                         | POST           | Clear JWT cookie (logout)                                        |
| `/profile/<email>`                | GET            | Fetch user profile by email                                      |
| `/profile/<email>`                | PUT            | Update user name, email, and/or password                         |
| `/crops`                          | GET, POST      | List all crops or add a new crop                                 |
| `/crops/<crop_id>`                | GET, PUT, DELETE | Retrieve, update, or delete a single crop                      |
| `/finances`                       | GET, POST      | List all finance records or add a new one                        |
| `/finances/<finance_id>`          | PUT, DELETE    | Update or delete a finance record                                |
| `/api/plots`                      | GET, POST      | List all field-map plots or create a new plot                    |
| `/api/reminders`                  | GET, POST      | List all reminders or add a new one                              |
| `/api/reminders/<reminder_id>`    | PUT, DELETE    | Update or delete a reminder                                      |
| `/api/check-model`                | POST           | Verify that the model file exists                                |
| `/api/analyze-leaf`               | POST           | Run leaf disease detection on a Base64 image                     |
| `/api/soil-data`                  | POST           | Create a new soil reading for a crop                             |
| `/api/soil-data/<crop_id>`        | GET            | List all soil readings for a given crop                          |
| `/api/soil-data/<soil_id>`        | PUT, DELETE    | Update or delete a specific soil reading                         |


## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/YourFeature`)
3. Commit your changes (`git commit -m 'Add feature'`)
4. Push to the branch (`git push origin feature/YourFeature`)
5. Open a Pull Request

Please adhere to existing coding standards and include tests where applicable.

---
