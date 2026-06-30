# 🩸 RAKSHA — Emergency Blood Coordination Platform

> **Saving lives in the Golden Hour** — AI-powered emergency blood coordination that pre-coordinates blood supply before the ambulance reaches the hospital.

[![Built with Gemini](https://img.shields.io/badge/Built%20with-Gemini%202.0%20Flash-blue)](https://ai.google.dev)
[![Google Maps](https://img.shields.io/badge/Google%20Maps-API-green)](https://developers.google.com/maps)
[![Firebase](https://img.shields.io/badge/Firebase-Realtime%20DB-orange)](https://firebase.google.com)
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
[Agent 1] Search blood banks with required type
[Agent 2] Compute optimal hospital route
[Agent 3] Mobilize nearby donors if stock low
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
| Backend | FastAPI (Python) |
| Core AI | Gemini 2.0 Flash (Vision + Text) |
| Maps | MapmyIndia (Mappls) SDK — Free Indian Maps |
| Realtime | Firebase Realtime Database |
| Storage | Firebase Storage |
| Voice | Sarvam AI Bulbul (Tamil STT) |
| Deployment | Firebase Hosting + Google Cloud Run |

---

## 🚀 Local Setup

### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
cp .env.example .env         # Fill in your API keys
uvicorn app.main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env         # Fill in your keys
npm run dev
```

### API Keys needed
- `GEMINI_API_KEY` → [Google AI Studio](https://aistudio.google.com/app/apikey)
- `VITE_MAPPLS_API_KEY → https://apis.mappls.com (Free)](https://console.cloud.google.com)
- Firebase config → [Firebase Console](https://console.firebase.google.com)
- `SARVAM_API_KEY` → [Sarvam AI](https://www.sarvam.ai)

---

## 📱 User Flows

| Role | Path | What they do |
|------|------|-------------|
| **Paramedic** | `/emergency` | Scan QR/license → trigger emergency → see coordination |
| **Citizen** | `/register` | Register blood group → get RAKSHA QR card |
| **Blood Bank** | `/bloodbank` | View inventory → receive alerts → update stock |
| **Donor** | `/donor` | Register → receive proximity alerts → earn Hero Score |

---

## ⚠️ Disclaimer

RAKSHA coordinates logistics only. Blood group is sourced from ID documents or user registration. **Cross-match verification is mandatory before transfusion.** This platform does not replace medical judgment or clinical procedures.

---

## 🏆 Built for Vibe2Ship 2026

**Hackathon:** Coding Ninjas × Google for Developers  
**Problem Statement:** Community Hero — Hyperlocal Problem Solver (PS2)  
**Builder:** Rahul | Anna University CEG, Chennai  
**Timeline:** 22nd June – 29th June 2026
