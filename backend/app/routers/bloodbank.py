from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from app.services.gemini_service import predict_blood_shortage
from app.routers.emergency import BLOOD_BANKS

router = APIRouter()

class InventoryUpdate(BaseModel):
    bank_id: str
    blood_group: str
    units: int

@router.get("/")
async def get_all_banks():
    return {"blood_banks": BLOOD_BANKS}

@router.get("/predict/shortage")
async def predict_shortage():
    """AI-powered blood shortage prediction — MUST be before /{bank_id}"""
    prediction = await predict_blood_shortage(BLOOD_BANKS)
    return {"success": True, "prediction": prediction, "powered_by": "Gemini 2.0 Flash"}

@router.get("/{bank_id}")
async def get_bank(bank_id: str):
    bank = next((b for b in BLOOD_BANKS if b["id"] == bank_id), None)
    if not bank:
        raise HTTPException(status_code=404, detail="Blood bank not found")
    return bank

@router.post("/inventory/update")
async def update_inventory(data: InventoryUpdate):
    valid_groups = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"]
    if data.blood_group.upper() not in valid_groups:
        raise HTTPException(status_code=400, detail="Invalid blood group")
    bank = next((b for b in BLOOD_BANKS if b["id"] == data.bank_id), None)
    if not bank:
        raise HTTPException(status_code=404, detail="Blood bank not found")
    bank["inventory"][data.blood_group.upper()] = data.units
    return {"success": True, "updated": bank}
