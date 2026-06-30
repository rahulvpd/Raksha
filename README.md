# 🩸 RAKSHA — Emergency Blood Coordination Platform

> **Saving lives in the Golden Hour** — AI-powered emergency blood coordination that pre-coordinates blood supply before the ambulance reaches the hospital.

[![Built with Gemini](https://img.shields.io/badge/Built%20with-Gemini%202.5%20Flash-blue)](https://ai.google.dev)
[![Google Maps](https://img.shields.io/badge/MapmyIndia-Mappls%20SDK-green)](https://developers.google.com/maps)
[![Firebase](https://img.shields.io/badge/Firebase-Hosting%20%26%20Realtime%20DB-orange)](https://firebase.google.com)
[![Hackathon](https://img.shields.io/badge/Vibe2Ship-2026-red)](https://blockseblock.com)

---

## 🚨 The Problem

India records **5 lakh road accidents** annually. **1.5 lakh people die** — many from blood loss, not from the injury itself.

**Current broken process:**
1. Accident happens → Ambulance arrives
2. Patient reaches hospital → Blood typing test (10–20 min)
3. Hospital contacts blood banks → Blood transported
4. Cross-match done → Transfusion begins
5. **Total time: 60–90 minutes. Golden Hour already gone.**

---

## ✅ The Solution

RAKSHA **pre-coordinates blood supply in transit** — the blood bank is alerted before the ambulance arrives.

**Time saved: 25–30 minutes. That is the difference between life and death.**

---

## 🔥 Three Scan Modes

| Mode | How | When |
|------|-----|------|
| **RAKSHA QR Code** | Scan unique QR from helmet sticker / wallet card / phone | Registered users — instant, verified |
| **License OCR** | Gemini Vision reads blood group from driving license | Non-registered — works on any Indian license |
| **Manual + O- Protocol** | Paramedic enters manually or selects Unknown | Fallback — system uses universal donor |

---

## 🤖 AI Agent Pipeline

```
Accident → Paramedic scans QR/License → Blood group identified
    ↓
[Agent 1] Search blood banks with required type (Real-time distance sorting)
[Agent 2] Compute optimal hospital route (Mappls visual routing)
[Agent 3] Mobilize nearby donors if stock low (Proximity push alerts)
    ↓ (all firing simultaneously)
Blood bank alerted → Prep begins → Hospital notified → Ambulance routed
    ↓
Blood ready on arrival → Cross-match → Transfusion → Life saved
```

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite (PWA) |
| Backend | FastAPI (Python 3.11) |
| Core AI | Gemini 2.5 Flash (Vision + Text via Async Client) |
| Maps | MapmyIndia (Mappls) SDK v3.0 |
| Realtime / Deploy | Firebase Hosting + Firebase Realtime Database |
| Voice | Sarvam AI Bulbul (Tamil Speech-To-Text translation) |
| Hosting (Backend) | Render.com Docker Containers |

---

## 🚀 Setup & Execution Guide

### 1. API Keys & Configurations
Create a `.env` file in both `backend/` and `frontend/` folders containing your credentials.

#### Backend Env (`backend/.env`)
```env
GEMINI_API_KEY=your_gemini_api_key
SARVAM_API_KEY=your_sarvam_api_key
MAPPLS_REST_KEY=your_mappls_rest_api_key
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_DATABASE_URL=your_firebase_database_url
FRONTEND_URL=http://localhost:5173
```

#### Frontend Env (`frontend/.env`)
```env
VITE_API_URL=http://localhost:8000
VITE_MAPPLS_API_KEY=your_mappls_rest_api_key
VITE_MAPPLS_PAIR_KEY=your_mappls_web_sdk_client_license_key
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_auth_domain
VITE_FIREBASE_DATABASE_URL=your_database_url
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

---

### 2. Local Setup

#### Run Backend Server
```bash
cd backend
python -m venv venv
venv\Scripts\activate        # On Windows
source venv/bin/activate     # On macOS/Linux
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
Backend will be live at `http://127.0.0.1:8000` (Health check at `/health`).

#### Run Frontend Server
```bash
cd frontend
npm install
npm run dev
```
Frontend will be live at `http://localhost:5173`.

---

## 🧪 Local Testing Walkthrough

Follow these steps step-by-step to test the entire application flow:

### Step 1: Register and Get a QR Card
1. Open `http://localhost:5173` and click **"Register / Get QR Card"**.
2. Fill in the form (Name, Blood Group, Phone, Emergency Contacts).
3. Click **"Generate My RAKSHA QR Card"**.
4. You will see a success card displaying your unique RAKSHA ID and a red QR code. Click **"Download QR Card"** to save it.

### Step 2: Paramedic Emergency Trigger
1. Click the back arrow `←` and navigate to **"Paramedic Console"**.
2. Select **"Manual Entry"**.
3. Choose a blood group (e.g., **`B+`** or **`UNKNOWN`** to test the universal O- donor protocol).
4. Click **"Continue →"** and then select **"🚨 TRIGGER EMERGENCY NOW"**.
5. Verify the active emergency dashboard:
   * The **Golden Hour Countdown Timer** will start ticking down from 60:00.
   * The **🤖 RAKSHA AI Coordination box** will show real-time routes, priority hospitals, and an ETA generated by Gemini.
   * The **MapmyIndia** interactive map will load location pins, showing nearby blood banks sorted by proximity (e.g. `📍 2.3 km away`).

### Step 3: Blood Bank Analytics
1. Navigate back to the Home page and select **"Blood Bank"**.
2. Tap the different blood bank buttons at the top (`BB001`, `BB002`, etc.) to view live inventory counts.
3. Verify the **Gemini Shortage Prediction** warning box at the top, showing AI-generated alerts forecasting low-stock items.

### Step 4: Donor Proximity Alerts
1. Go to **"Donor Dashboard"**.
2. Under **"Register"**, sign up with your details to become a community hero.
3. Switch to the **"Heroes"** tab to verify your name is on the public leaderboard.
4. Switch to the **"Alerts"** tab to inspect simulated incoming proximity alerts requesting your blood group.

---

## 🌐 Production Deployment

### 1. Deploy Backend (Render.com)
The backend container is pre-configured to build using Docker.

1. Create a public/private repository on GitHub and push the code:
   ```bash
   git init
   git add .
   git commit -m "RAKSHA initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/Raksha.git
   git push -u origin main
   ```
2. Log in to [Render.com](https://render.com) using your GitHub account.
3. Create a **New Web Service** and connect your `Raksha` repository.
4. Set the configuration as follows:
   * **Name:** `raksha-backend`
   * **Region:** `Singapore` (or closest region)
   * **Language/Runtime:** `Docker` (automatically detected)
   * **Instance Type:** `Free`
5. Add your environment variables in the **Environment** tab:
   * `GEMINI_API_KEY`, `SARVAM_API_KEY`, `MAPPLS_REST_KEY`, `FIREBASE_PROJECT_ID`, `FIREBASE_DATABASE_URL`.
6. Click **Deploy**. Render will build the container and provide a live URL (e.g., `https://raksha-backend-xxxx.onrender.com`).

---

### 2. Deploy Frontend (Firebase Hosting)
1. Open your frontend `.env` file (`frontend/.env`) and update the `VITE_API_URL` to point to your new live Render URL:
   ```env
   VITE_API_URL=https://raksha-backend-xxxx.onrender.com
   ```
2. Open terminal in the project root and execute the build and deploy script:
   ```cmd
   deploy.bat
   ```
3. The script will automatically compile your React assets, ask you to log in to Firebase, and publish your project to Google's hosting infrastructure.

---

## ⚠️ Disclaimer

RAKSHA coordinates logistics only. Blood group is sourced from ID documents or user registration. **Cross-match verification is mandatory before transfusion.** This platform does not replace medical judgment or clinical procedures.
