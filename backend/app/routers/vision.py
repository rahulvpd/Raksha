from fastapi import APIRouter, UploadFile, File, HTTPException
from app.services.gemini_service import extract_blood_group_from_license

router = APIRouter()

ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"]

@router.post("/scan-license")
async def scan_license(file: UploadFile = File(...)):
    """Scan Indian driving license — extract blood group via Gemini Vision"""

    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail="Only JPEG, PNG, WEBP images allowed")

    image_bytes = await file.read()

    if len(image_bytes) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Image too large. Max 10MB.")

    result = await extract_blood_group_from_license(image_bytes, file.content_type)

    return {
        "success": True,
        "scan_type": "driving_license_ocr",
        "powered_by": "Gemini 2.0 Flash Vision",
        "result": result,
        "disclaimer": "Blood group sourced from ID document. Cross-match verification mandatory before transfusion. RAKSHA coordinates logistics only."
    }
