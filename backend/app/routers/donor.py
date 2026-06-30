from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
import uuid
from datetime import datetime

router = APIRouter()

donor_registry = {}

VALID_BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"]


class DonorRegistration(BaseModel):
    name: str
    blood_group: str
    phone: str
    location: dict  # {"lat": float, "lng": float}
    city: Optional[str] = "Chennai"
    available: Optional[bool] = True


@router.post("/register")
async def register_donor(donor: DonorRegistration):
    if donor.blood_group.upper() not in VALID_BLOOD_GROUPS:
        raise HTTPException(status_code=400, detail="Invalid blood group")

    donor_id = f"DNR-{str(uuid.uuid4())[:8].upper()}"
    donor_data = {
        "donor_id": donor_id,
        "name": donor.name,
        "blood_group": donor.blood_group.upper(),
        "phone": donor.phone,
        "location": donor.location,
        "city": donor.city,
        "available": donor.available,
        "registered_at": datetime.utcnow().isoformat(),
        "donations_count": 0,
        "hero_score": 0
    }
    donor_registry[donor_id] = donor_data
    return {"success": True, "donor_id": donor_id, "donor": donor_data}


@router.get("/nearby/{blood_group}")
async def get_nearby_donors(blood_group: str, lat: float = 13.0827, lng: float = 80.2707):
    bg = blood_group.upper()
    matching = [
        d for d in donor_registry.values()
        if d["blood_group"] == bg and d["available"]
    ]
    return {"blood_group": bg, "nearby_donors": matching, "count": len(matching)}


@router.get("/leaderboard")
async def get_leaderboard():
    sorted_donors = sorted(donor_registry.values(), key=lambda x: x["hero_score"], reverse=True)
    return {"leaderboard": sorted_donors[:10]}


@router.get("/")
async def get_all_donors():
    return {"donors": list(donor_registry.values()), "total": len(donor_registry)}
