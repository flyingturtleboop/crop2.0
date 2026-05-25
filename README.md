# CropAI

<div align="center">

![React](https://img.shields.io/badge/Frontend-React-blue)
![TypeScript](https://img.shields.io/badge/Language-TypeScript-blue)
![Flask](https://img.shields.io/badge/Backend-Flask-black)
![TensorFlow](https://img.shields.io/badge/ML-TensorFlow-orange)
![SQLite](https://img.shields.io/badge/Database-SQLite-green)
![Status](https://img.shields.io/badge/Status-Completed-brightgreen)

**Full-stack AI crop management platform with CNN-based leaf disease detection, AI-generated health reports, farm dashboards, financial tracking, field mapping, reminders, and database-backed crop management.**

</div>

---

## Overview

CropAI is a full-stack AI crop management platform that helps farmers monitor plant health, manage farm operations, track finances, map field locations, schedule reminders, and generate AI-assisted crop health reports from leaf images.

The core AI pipeline uses a TensorFlow/Keras convolutional neural network (CNN) to classify crop leaf images. Instead of only returning a raw prediction, the CNN output feeds into an AI workflow that generates a farmer-friendly plant health report with diagnosis context, recommendations, and next steps.

CropAI was built with a React/TypeScript frontend, a Flask backend, SQLAlchemy database management, JWT authentication, Google Maps-style field mapping, and a TensorFlow CNN model for plant disease detection.

---

## Table of Contents

- [Overview](#overview)
- [Why I Built This](#why-i-built-this)
- [Core Workflow](#core-workflow)
- [Feature Summary](#feature-summary)
- [Key Features](#key-features)
- [AI / ML Pipeline](#ai--ml-pipeline)
- [System Architecture](#system-architecture)
- [Tech Stack](#tech-stack)
- [Database-Backed Modules](#database-backed-modules)
- [API Reference](#api-reference)
- [Getting Started](#getting-started)
- [Usage](#usage)
- [Project Results](#project-results)
- [What I Learned](#what-i-learned)
- [Future Improvements](#future-improvements)
- [Repository](#repository)

---

## Why I Built This

Many AI projects stop at model inference: upload an image, return a label, and end the workflow. CropAI was designed to go further by connecting model output to a complete product experience.

The goal was to build a system where a farmer could:

1. Upload an image of a crop leaf
2. Receive a model prediction
3. Get a clear explanation and recommendation
4. Save or view the result through the platform
5. Track related crop, soil, finance, reminder, and field data
6. Use the platform as an ongoing farm management tool

This made the project less like a standalone ML demo and more like a full-stack AI workflow system.

---

## Core Workflow

```text
User uploads crop leaf image
        ↓
Frontend sends image to Flask backend
        ↓
Backend preprocesses image
        ↓
TensorFlow/Keras CNN classifies plant health
        ↓
Prediction result feeds into AI report workflow
        ↓
Generated report explains the issue and next steps
        ↓
User can connect the result to crop records, dashboard data, and farm management workflows
```

---

## Feature Summary

| Feature | Description |
|---|---|
| AI Leaf Analysis | Uses a TensorFlow/Keras CNN to classify crop leaf images |
| AI Health Reports | Converts model output into farmer-friendly diagnosis and recommendations |
| Crop Management | Add, edit, view, and delete crop records |
| Finance Tracking | Track farming income, expenses, and operational costs |
| Field Mapping | Map and manage farm plots using Google Maps-style functionality |
| Soil Data | Store and update crop-specific soil readings |
| Reminders | Schedule crop care tasks and follow-ups |
| Authentication | User signup, login, JWT authentication, password hashing, and profile management |
| Dashboard | Central interface for farm activity, crops, finances, reminders, and analysis |

---

## Key Features

### AI Leaf Disease Detection

CropAI includes a custom TensorFlow/Keras CNN designed for crop leaf image classification.

Key details:

- Built a CNN using TensorFlow/Keras
- Trained the model to classify crop leaf images
- Tuned the model to reach **86% accuracy**
- Integrated the model into a Flask API endpoint
- Added image preprocessing before inference
- Supports Base64 image input through the `/api/analyze-leaf` route
- Includes a model-check route to verify that the model file exists before inference

---

### AI-Generated Crop Health Reports

Instead of only returning a class label, CropAI uses the CNN output as part of a larger AI workflow.

The generated report can include:

- Likely plant health issue
- Disease or stress explanation
- Recommended next steps
- Prevention guidance
- Follow-up actions
- Farmer-friendly summary of the model result

This makes the AI output more useful because farmers receive a practical explanation, not just a prediction.

---

### Crop Management

CropAI supports database-backed crop management.

Users can:

- Add crop records
- View all crops
- Edit crop information
- Delete crop entries
- Connect crop records to soil readings, reminders, and analysis workflows

This turns CropAI into a management system instead of only an analysis tool.

---

### Finance Tracking

CropAI includes finance tracking for farm operations.

Users can:

- Add income and expense records
- View finance history
- Update finance records
- Delete finance entries
- Track operational costs connected to farming decisions

This helps users think about crop health and farm operations from both a biological and financial perspective.

---

### Field Mapping

CropAI includes interactive field mapping functionality.

Users can:

- Create mapped field plots
- Store plot and location data
- View field locations through a map-based interface
- Connect spatial field data to farm management workflows

This feature uses Google Maps-style mapping functionality to make the platform more practical for real-world farm tracking.

---

### Soil Data Management

CropAI supports soil data tracking for crop-specific monitoring.

Users can:

- Add soil readings for a crop
- View soil readings by crop ID
- Update soil data
- Delete soil records
- Store soil-related information in the backend database

This allows farmers to track more than just leaf health by storing additional agricultural context.

---

### Reminders and Calendar

CropAI includes reminder and calendar functionality for farm tasks.

Users can:

- Create reminders
- View upcoming reminders
- Update reminder details
- Delete reminders
- Schedule follow-up actions after crop analysis

Example use cases:

- Watering reminders
- Fertilizer reminders
- Disease follow-up checks
- Harvest planning
- Soil testing reminders

---

### Authentication and Profile Management

CropAI includes user authentication and account management.

Authentication features include:

- User signup
- User login
- JWT-based authentication
- Password hashing with Flask-Bcrypt
- User profile retrieval
- User profile updates
- Logout route

This allows users to manage their own farm data securely.

---

### Dashboard

The dashboard brings together key farm information in one interface.

It can display:

- Crop summaries
- Finance data
- Field activity
- Recent analysis activity
- Reminder information
- Operational insights

The goal of the dashboard is to make the platform feel like a real farm operating system rather than a collection of disconnected tools.

---

## AI / ML Pipeline

### Model

CropAI uses a convolutional neural network built with TensorFlow/Keras.

| Component | Details |
|---|---|
| Framework | TensorFlow / Keras |
| Model Type | Convolutional Neural Network |
| Task | Crop leaf disease / health classification |
| Optimizer | Adam |
| Accuracy | 86% after tuning |
| Backend Integration | Flask API endpoint |
| Input Format | Base64 image upload |

---

### Training and Optimization

The CNN was trained and tuned to improve classification performance.

Model details:

- Framework: TensorFlow/Keras
- Model type: Convolutional Neural Network
- Optimizer: Adam
- Task: Crop leaf health / disease classification
- Accuracy reached: **86%**

---

### Inference Flow

```text
Image input
   ↓
Image preprocessing
   ↓
CNN inference
   ↓
Prediction result
   ↓
AI-generated report
   ↓
Frontend display
```

---

### Why the AI Workflow Matters

The model prediction alone is not enough for a useful farming product. A farmer needs context:

- What might be wrong?
- How serious is it?
- What should I do next?
- How do I prevent it from spreading?
- Should I track this against soil, crop, or field data?

CropAI addresses this by connecting the CNN result to a generated report and management workflow.

---

## System Architecture

### Main Application Architecture

```text
React + TypeScript Frontend
        ↓
Axios API Requests
        ↓
Flask REST API
        ↓
SQLAlchemy ORM
        ↓
SQLite Database
        ↓
Crop / Finance / Soil / Reminder / Plot Data
```

---

### AI Analysis Architecture

```text
User uploads crop image
        ↓
Frontend encodes and sends image
        ↓
Flask backend receives image
        ↓
Backend validates and preprocesses image
        ↓
TensorFlow CNN runs prediction
        ↓
Prediction result is processed
        ↓
AI workflow generates report
        ↓
Report is returned to frontend
```

---

### Data Management Architecture

```text
User action
   ↓
Frontend form or dashboard
   ↓
API request
   ↓
Flask route
   ↓
SQLAlchemy database operation
   ↓
Response returned to frontend
```

---

## Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | React, TypeScript, Vite, Tailwind CSS |
| UI / Visualization | Recharts, React Calendar, React Datepicker, Lucide React, Framer Motion |
| Backend | Flask, Flask-CORS, Flask-Migrate |
| Database | SQLite, SQLAlchemy |
| Authentication | Flask-JWT-Extended, Flask-Bcrypt |
| AI / ML | TensorFlow, Keras, CNN, Adam Optimizer |
| APIs / Integrations | Google Maps-style field mapping, REST APIs |

---

### Frontend

- Vite
- React
- TypeScript
- Tailwind CSS
- React Router
- Axios
- Recharts
- React Calendar
- React Datepicker
- React Dropzone
- Lucide React
- Framer Motion
- Flowbite React
- Bootstrap

---

### Backend

- Flask
- SQLAlchemy
- Flask-Migrate
- Flask-JWT-Extended
- Flask-Bcrypt
- Flask-CORS
- SQLite

---

### AI / ML

- TensorFlow
- Keras
- CNN image classification
- Adam optimizer
- Image preprocessing pipeline
- AI-generated report workflow

---

### APIs and Integrations

- Google Maps-style field mapping
- REST API between React frontend and Flask backend
- JWT authentication flow
- Database-backed crop, finance, reminder, soil, and plot management

---

## Database-Backed Modules

CropAI uses a backend database to store and manage user and farm data.

| Module | Purpose |
|---|---|
| Users | Stores account, login, and profile information |
| Crops | Stores crop records and crop-specific data |
| Finances | Tracks income and expenses |
| Soil Data | Stores soil readings connected to crops |
| Reminders | Stores scheduled farm tasks |
| Field Plots | Stores mapped farm plot/location data |
| Analysis | Handles uploaded leaf images and model results |

This makes the project more complete than a static frontend or isolated ML model because user actions persist through the backend.

---

## API Reference

### Authentication and User Routes

| Route | Method | Description |
|---|---|---|
| `/signup` | POST | Create a new user |
| `/logintoken` | POST | Login and retrieve a JWT |
| `/logout` | POST | Clear JWT cookie and log out |
| `/profile/<email>` | GET | Fetch user profile by email |
| `/profile/<email>` | PUT | Update user name, email, or password |

---

### Crop Routes

| Route | Method | Description |
|---|---|---|
| `/crops` | GET | List all crops |
| `/crops` | POST | Create a new crop |
| `/crops/<crop_id>` | GET | Retrieve a single crop |
| `/crops/<crop_id>` | PUT | Update a crop |
| `/crops/<crop_id>` | DELETE | Delete a crop |

---

### Finance Routes

| Route | Method | Description |
|---|---|---|
| `/finances` | GET | List all finance records |
| `/finances` | POST | Create a finance record |
| `/finances/<finance_id>` | PUT | Update a finance record |
| `/finances/<finance_id>` | DELETE | Delete a finance record |

---

### Field Mapping Routes

| Route | Method | Description |
|---|---|---|
| `/api/plots` | GET | List all field-map plots |
| `/api/plots` | POST | Create a new field-map plot |

---

### Reminder Routes

| Route | Method | Description |
|---|---|---|
| `/api/reminders` | GET | List all reminders |
| `/api/reminders` | POST | Create a reminder |
| `/api/reminders/<reminder_id>` | PUT | Update a reminder |
| `/api/reminders/<reminder_id>` | DELETE | Delete a reminder |

---

### AI / Model Routes

| Route | Method | Description |
|---|---|---|
| `/api/check-model` | POST | Verify that the model file exists |
| `/api/analyze-leaf` | POST | Run CNN-based leaf disease detection on a Base64 image |

---

### Soil Data Routes

| Route | Method | Description |
|---|---|---|
| `/api/soil-data` | POST | Create a new soil reading for a crop |
| `/api/soil-data/<crop_id>` | GET | List all soil readings for a crop |
| `/api/soil-data/<soil_id>` | PUT | Update a soil reading |
| `/api/soil-data/<soil_id>` | DELETE | Delete a soil reading |

---

## Getting Started

### Prerequisites

Make sure you have the following installed:

- Node.js
- Python 3.8+
- Git

---

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/psamin/crop2.0.git
cd crop2.0
```

---

### 2. Set up the frontend

```bash
cd client
npm install
npm run dev
```

The frontend should run at:

```text
http://localhost:5173
```

---

### 3. Set up the backend

Open a new terminal:

```bash
cd server
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
flask db upgrade
flask run
```

On Windows:

```bash
cd server
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
flask db upgrade
flask run
```

The backend should run at:

```text
http://localhost:5000
```

---

## Usage

After starting the frontend and backend, users can:

1. Create an account or log in
2. Add crop records
3. Track finances
4. Upload crop leaf images for AI analysis
5. View AI-generated plant health reports
6. Add soil readings
7. Create mapped field plots
8. Schedule reminders
9. Manage profile settings

---

## Project Results

| Result | Detail |
|---|---|
| Competition | 2nd Internationally at TSA Software Development |
| Model Accuracy | 86% CNN accuracy after tuning |
| AI Workflow | CNN predictions feed into generated crop health reports |
| Product Scope | Full-stack farm management platform |
| Database | Persistent storage for crops, finances, soil data, reminders, plots, and users |
| Mapping | Google Maps-style field location tracking |
| Authentication | JWT auth and password hashing |
| Investment | Turned down a $10,000 investment offer |

---

## What I Learned

CropAI taught me how to connect machine learning to a real product workflow.

The most important challenge was not only training a CNN, but turning the model result into something useful for farmers. That meant connecting image classification to backend APIs, database records, dashboards, maps, and AI-generated recommendations.

This project helped me practice:

- Designing a CNN image classification pipeline
- Training and tuning a TensorFlow/Keras model
- Building REST APIs with Flask
- Managing relational data with SQLAlchemy
- Implementing JWT-based authentication
- Connecting frontend workflows to backend services
- Integrating map-based field tracking
- Turning AI predictions into user-facing recommendations
- Building a product around a real operational problem

---

## Future Improvements

| Improvement | Purpose |
|---|---|
| More crop disease classes | Expand model coverage |
| Better model evaluation | Add confusion matrix, precision, recall, and F1 score |
| Saved analysis history | Let farmers compare plant health over time |
| Weather API integration | Add environmental context |
| More advanced recommendations | Personalize reports based on crop, location, and soil |
| Deployment | Host frontend and backend for public demo access |
| Model monitoring | Track prediction quality and failures over time |
| More field analytics | Connect mapped plots with crop performance and finances |

---

## Repository

```text
https://github.com/psamin/crop2.0
```