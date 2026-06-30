from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from app.services.gemini_service import coordinate_emergency
import uuid
from datetime import datetime

router = APIRouter()

active_emergencies = {}

BLOOD_BANKS = [
    {
        "id": "BB001",
        "name": "Govt. Rajiv Gandhi Hospital Blood Bank",
        "location": {"lat": 13.0827, "lng": 80.2707},
        "inventory": {"A+": 10, "A-": 3, "B+": 15, "B-": 2, "O+": 20, "O-": 5, "AB+": 4, "AB-": 1},
        "phone": "044-25305000",
        "address": "Park Town, Chennai",
        "status": "ACTIVE"
    },
    {
        "id": "BB002",
        "name": "Apollo Hospitals Blood Bank",
        "location": {"lat": 13.0569, "lng": 80.2425},
        "inventory": {"A+": 8, "A-": 2, "B+": 12, "B-": 3, "O+": 18, "O-": 4, "AB+": 6, "AB-": 2},
        "phone": "044-28293333",
        "address": "Greams Road, Chennai",
        "status": "ACTIVE"
    },
    {
        "id": "BB003",
        "name": "Fortis Malar Blood Bank",
        "location": {"lat": 13.0002, "lng": 80.2565},
        "inventory": {"A+": 5, "A-": 1, "B+": 8, "B-": 1, "O+": 12, "O-": 3, "AB+": 3, "AB-": 0},
        "phone": "044-42892222",
        "address": "Adyar, Chennai",
        "status": "ACTIVE"
    },
    {
        "id": "BB004",
        "name": "SRMC & Research Centre Blood Bank",
        "location": {"lat": 13.0358, "lng": 80.1732},
        "inventory": {"A+": 7, "A-": 2, "B+": 10, "B-": 2, "O+": 15, "O-": 3, "AB+": 5, "AB-": 1},
        "phone": "044-45928000",
        "address": "Porur, Chennai",
        "status": "ACTIVE"
    },
    {
        "id": "BB005",
        "name": "Stanley Medical College Blood Bank",
        "location": {"lat": 13.1067, "lng": 80.2872},
        "inventory": {"A+": 12, "A-": 4, "B+": 18, "B-": 3, "O+": 25, "O-": 6, "AB+": 7, "AB-": 2},
        "phone": "044-25281101",
        "address": "Old Jail Road, Chennai",
        "status": "ACTIVE"
    },
    {
        "id": "BB006",
        "name": "Voluntary Health Services Blood Bank",
        "location": {"lat": 12.9784, "lng": 80.2178},
        "inventory": {"A+": 6, "A-": 2, "B+": 9, "B-": 1, "O+": 14, "O-": 4, "AB+": 3, "AB-": 1},
        "phone": "044-22542140",
        "address": "Adyar, Chennai",
        "status": "ACTIVE"
    }
]


class EmergencyTrigger(BaseModel):
    blood_group: str
    patient_name: Optional[str] = "Unknown"
    location: dict
    scan_type: str  # "raksha_qr" | "license_ocr" | "manual"
    paramedic_id: Optional[str] = "PARA001"
    medical_alerts: Optional[str] = "None"
    emergency_contact: Optional[str] = None


class EmergencyAcknowledge(BaseModel):
    emergency_id: str
    acknowledged_by: str  # blood bank ID or hospital ID
    status: str
    eta_minutes: Optional[int] = None


@router.post("/trigger")
async def trigger_emergency(data: EmergencyTrigger):
    """CORE RAKSHA FLOW — trigger emergency and coordinate blood supply"""

    valid_groups = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-", "UNKNOWN"]
    blood_group = data.blood_group.upper()

    if blood_group not in valid_groups:
        raise HTTPException(status_code=400, detail="Invalid blood group")

    emergency_id = f"EMR-{str(uuid.uuid4())[:8].upper()}"

    # Universal donor fallback
    lookup_group = "O-" if blood_group == "UNKNOWN" else blood_group

    # Find banks with stock
    available_banks = [
        bank for bank in BLOOD_BANKS
        if bank["inventory"].get(lookup_group, 0) > 0
    ]

    # AI agent coordination
    coordination = await coordinate_emergency(
        blood_group=lookup_group,
        location=data.location,
        blood_banks=available_banks
    )

    emergency = {
        "emergency_id": emergency_id,
        "blood_group": blood_group,
        "lookup_group": lookup_group,
        "patient_name": data.patient_name,
        "location": data.location,
        "scan_type": data.scan_type,
        "medical_alerts": data.medical_alerts,
        "emergency_contact": data.emergency_contact,
        "status": "ACTIVE",
        "created_at": datetime.utcnow().isoformat(),
        "golden_hour_start": datetime.utcnow().isoformat(),
        "available_banks": available_banks,
        "coordination": coordination,
        "paramedic_id": data.paramedic_id,
        "acknowledgments": []
    }

    active_emergencies[emergency_id] = emergency

    return {
        "success": True,
        "emergency_id": emergency_id,
        "blood_group": blood_group,
        "available_banks_count": len(available_banks),
        "available_banks": available_banks,
        "coordination": coordination,
        "location": data.location,
        "golden_hour_start": emergency["golden_hour_start"],
        "disclaimer": "Cross-match verification mandatory before transfusion. RAKSHA coordinates logistics only."
    }


@router.post("/acknowledge")
async def acknowledge_emergency(data: EmergencyAcknowledge):
    """Blood bank or hospital acknowledges emergency alert"""

    if data.emergency_id not in active_emergencies:
        raise HTTPException(status_code=404, detail="Emergency not found")

    ack = {
        "acknowledged_by": data.acknowledged_by,
        "status": data.status,
        "eta_minutes": data.eta_minutes,
        "timestamp": datetime.utcnow().isoformat()
    }

    active_emergencies[data.emergency_id]["acknowledgments"].append(ack)
    active_emergencies[data.emergency_id]["status"] = "ACKNOWLEDGED"

    return {"success": True, "message": "Acknowledgment recorded", "emergency_id": data.emergency_id}


@router.get("/status/{emergency_id}")
async def get_status(emergency_id: str):
    if emergency_id not in active_emergencies:
        raise HTTPException(status_code=404, detail="Emergency not found")
    return active_emergencies[emergency_id]


@router.get("/active")
async def get_active_emergencies():
    active = {k: v for k, v in active_emergencies.items() if v["status"] in ["ACTIVE", "ACKNOWLEDGED"]}
    return {"count": len(active), "emergencies": list(active.values())}


@router.get("/bloodbanks")
async def get_all_blood_banks():
    return {"blood_banks": BLOOD_BANKS, "total": len(BLOOD_BANKS)}


@router.get("/bloodbanks/{blood_group}")
async def get_banks_for_blood_group(blood_group: str):
    bg = blood_group.upper()
    available = [b for b in BLOOD_BANKS if b["inventory"].get(bg, 0) > 0]
    return {"blood_group": bg, "available_banks": available, "count": len(available)}
