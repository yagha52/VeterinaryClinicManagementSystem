# 🐾 VetClinic — Veterinary Clinic Management System

A full-stack web application for managing veterinary clinic operations, built with **Angular** and **Django REST Framework**, backed by **MongoDB Atlas**.

---

## 👥 Team

| Student      | ID    |
| ------------ | ----- |
| Gaelle Bitar | 60050 |
| Yara Eslim   | 60674 |

**Group:** B30

---

## ✨ Features

- 🔐 **Vet Authentication** — Secure login with PBKDF2-hashed passwords
- 📋 **Appointments Dashboard** — Create, edit, and track appointments with live multi-field search, quick date filters (Today / Tomorrow / Next 7 Days), status filtering, and automatic chronological sorting
- 👤 **Owner Management** — Full CRUD for pet owners with profile photo uploads
- 🐶 **Pet Records** — Full CRUD for pet records with owner linking
- 📁 **Append-Only Medical History** — Upload PDFs and clinical notes per visit; history is never overwritten
- 🔔 **Inline Feedback** — Green/red notification banners replace disruptive browser alerts
- 📱 **Fully Responsive** — Works on desktop, tablet, and mobile screens

---

## 🛠️ Tech Stack

| Layer    | Technology                         |
| -------- | ---------------------------------- |
| Frontend | Angular 17 (Standalone Components) |
| Backend  | Django 4 + Django REST Framework   |
| Database | MongoDB Atlas via Djongo           |
| Styling  | Vanilla CSS + FontAwesome 6        |
| Auth     | Session-based via `localStorage` |

---

## 🚀 Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+
- A `.env` file in the project root (see below)

### 1. Clone the repository

```bash
git clone https://github.com/yagha52/VeterinaryClinicManagementSystem.git
cd VeterinaryClinicManagementSystem
```

### 2. Configure environment variables

Create a `.env` file in the project root:

```
MONGODB_URI=your_mongodb_atlas_connection_string
```

### 3. Set up the Django backend

```bash
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

The API will be available at `http://127.0.0.1:8000/`

### 4. Set up the Angular frontend

```bash
cd clinic-frontend
npm install
npm start
```

The app will be available at `http://localhost:4200/`

---

## 📁 Project Structure

```
VeterinaryClinicManagementSystem/
├── clinic_api/              # Django app (models, views, serializers, URLs)
│   ├── models.py            # PetOwner, PetRecord, MedicalRecordEntry, MedicalAppointment, Veterinarian
│   ├── views.py             # REST API views
│   ├── serializers.py       # DRF serializers
│   └── urls.py              # API routing
├── clinic_backend/          # Django project settings
├── clinic-frontend/         # Angular SPA
│   └── src/app/
│       ├── login/           # Authentication page
│       ├── navbar/          # Reusable navbar component
│       ├── appointments/    # Appointments dashboard
│       ├── owner-dash/      # Pet owners dashboard
│       └── pet-dash/        # Pet records dashboard
├── .env                     # Secret config (NOT committed)
└── README.md
```

---

## 🔗 API Endpoints

| Method             | Endpoint                                   | Description                |
| ------------------ | ------------------------------------------ | -------------------------- |
| `POST`           | `/api/auth/login/`                       | Vet login                  |
| `GET/POST`       | `/api/petowners/`                        | List / create owners       |
| `GET/PUT/DELETE` | `/api/petowners/<id>/`                   | Owner detail               |
| `GET/POST`       | `/api/pet-records/`                      | List / create pets         |
| `GET/PUT/DELETE` | `/api/pet-records/<id>/`                 | Pet detail                 |
| `GET/POST`       | `/api/pet-records/<id>/medical-entries/` | Medical history entries    |
| `GET/POST`       | `/api/appointments/`                     | List / create appointments |
| `GET/PUT/DELETE` | `/api/appointments/<id>/`                | Appointment detail         |
