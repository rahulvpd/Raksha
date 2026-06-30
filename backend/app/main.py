from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import emergency, vision, qr_code, bloodbank, donor, voice
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(
    title="RAKSHA API",
    description="Emergency Blood Coordination Platform — saving lives in the Golden Hour",
    version="1.0.0"
)

ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://raksha-emergency-557c8.web.app",
    "https://raksha-emergency-557c8.firebaseapp.com",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(emergency.router, prefix="/emergency", tags=["Emergency"])
app.include_router(vision.router,    prefix="/vision",    tags=["Vision OCR"])
app.include_router(qr_code.router,   prefix="/qr",        tags=["QR Code"])
app.include_router(bloodbank.router, prefix="/bloodbank", tags=["Blood Bank"])
app.include_router(donor.router,     prefix="/donor",     tags=["Donor"])
app.include_router(voice.router,     prefix="/voice",     tags=["Tamil Voice"])

@app.get("/")
async def root():
    return {
        "platform": "RAKSHA",
        "tagline": "Emergency Blood Coordination — Every Second Counts",
        "status": "active",
        "version": "1.0.0"
    }

@app.get("/health")
async def health():
    """Diagnostic endpoint — check which API keys are actually configured"""
    gemini_key = os.getenv("GEMINI_API_KEY", "")
    sarvam_key = os.getenv("SARVAM_API_KEY", "")
    # As of June 2026, Google AI Studio issues Auth keys (AQ.) replacing legacy Standard keys (AIzaSy)
    gemini_valid = gemini_key.startswith("AQ.") or gemini_key.startswith("AIzaSy")
    return {
        "status": "healthy",
        "platform": "RAKSHA",
        "gemini_configured": bool(gemini_key) and gemini_valid,
        "gemini_key_format": "valid (Auth key)" if gemini_key.startswith("AQ.") else "valid (legacy Standard key)" if gemini_key.startswith("AIzaSy") else "INVALID — get one at aistudio.google.com/app/apikey",
        "sarvam_configured": bool(sarvam_key) and len(sarvam_key) > 10,
    }
