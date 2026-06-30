from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional
import qrcode
import json
import uuid
import io

router = APIRouter()

# In-memory registry (Firebase integration in Day 4)
user_registry = {}

VALID_BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"]


class UserRegistration(BaseModel):
    name: str
    blood_group: str
    emergency_contact: str
    phone: str
    medical_alerts: Optional[str] = "None"


class QRScanData(BaseModel):
    raksha_id: str
    blood_group: Optional[str] = None
    name: Optional[str] = None


@router.post("/register")
async def register_user(user: UserRegistration):
    """Register user and generate RAKSHA ID"""

    if user.blood_group.upper() not in VALID_BLOOD_GROUPS:
        raise HTTPException(status_code=400, detail=f"Invalid blood group. Must be one of: {VALID_BLOOD_GROUPS}")

    raksha_id = f"RKS-2026-TN-{str(uuid.uuid4())[:8].upper()}"

    user_data = {
        "raksha_id": raksha_id,
        "name": user.name,
        "blood_group": user.blood_group.upper(),
        "emergency_contact": user.emergency_contact,
        "medical_alerts": user.medical_alerts,
        "phone": user.phone,
        "verified": True
    }

    user_registry[raksha_id] = user_data

    return {
        "success": True,
        "raksha_id": raksha_id,
        "message": f"Registered successfully. Your RAKSHA ID: {raksha_id}",
        "qr_url": f"/qr/generate/{raksha_id}",
        "user": user_data
    }


@router.get("/generate/{raksha_id}")
async def generate_qr_image(raksha_id: str):
    """Generate QR code PNG for RAKSHA Emergency Card"""

    if raksha_id not in user_registry:
        raise HTTPException(status_code=404, detail="RAKSHA ID not found. Register first.")

    user_data = user_registry[raksha_id]

    # QR encodes RAKSHA ID + blood group for offline fallback
    qr_payload = json.dumps({
        "raksha_id": raksha_id,
        "blood_group": user_data["blood_group"],
        "name": user_data["name"],
        "platform": "RAKSHA"
    })

    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_H,
        box_size=10,
        border=4,
    )
    qr.add_data(qr_payload)
    qr.make(fit=True)

    img = qr.make_image(fill_color="#CC0000", back_color="white")

    img_bytes = io.BytesIO()
    img.save(img_bytes, format="PNG")
    img_bytes.seek(0)

    return StreamingResponse(
        img_bytes,
        media_type="image/png",
        headers={"Content-Disposition": f"inline; filename=raksha-{raksha_id}.png"}
    )


@router.post("/lookup")
async def lookup_by_qr(data: QRScanData):
    """Look up patient from scanned QR data"""

    # Try RAKSHA registry first
    if data.raksha_id in user_registry:
        user_data = user_registry[data.raksha_id]
        return {
            "success": True,
            "scan_type": "raksha_qr",
            "source": "raksha_registry",
            "result": {
                "blood_group": user_data["blood_group"],
                "name": user_data["name"],
                "emergency_contact": user_data["emergency_contact"],
                "medical_alerts": user_data["medical_alerts"],
                "found": True,
                "confidence": "high",
                "verified": True
            },
            "disclaimer": "Cross-match verification mandatory before transfusion."
        }

    # Fallback: use data embedded in QR itself
    if data.blood_group:
        return {
            "success": True,
            "scan_type": "raksha_qr_embedded",
            "source": "qr_embedded_data",
            "result": {
                "blood_group": data.blood_group,
                "name": data.name or "Unknown",
                "emergency_contact": None,
                "medical_alerts": "Not available",
                "found": True,
                "confidence": "medium",
                "verified": False
            },
            "disclaimer": "Cross-match verification mandatory before transfusion."
        }

    raise HTTPException(status_code=404, detail="RAKSHA ID not found in registry.")


@router.get("/all-users")
async def get_all_users():
    """Get all registered users — for demo/admin"""
    return {
        "total": len(user_registry),
        "users": list(user_registry.values())
    }
