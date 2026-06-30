from fastapi import APIRouter, UploadFile, File, HTTPException
from app.services.sarvam_service import transcribe_tamil_audio, translate_tamil_to_english

router = APIRouter()

ALLOWED_AUDIO = ["audio/wav", "audio/mpeg", "audio/mp4", "audio/webm", "audio/ogg"]

@router.post("/transcribe")
async def transcribe_voice(file: UploadFile = File(...)):
    """Tamil voice → text → blood group extraction via Sarvam AI Bulbul"""
    if file.content_type not in ALLOWED_AUDIO:
        raise HTTPException(status_code=400, detail="Audio file required (wav, mp3, webm, ogg)")

    audio_bytes = await file.read()
    if len(audio_bytes) > 25 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Audio too large. Max 25MB.")

    result = await transcribe_tamil_audio(audio_bytes, file.filename or "audio.wav")

    if result["success"] and result["transcript"]:
        translation = await translate_tamil_to_english(result["transcript"])
        result["translation"] = translation.get("translated")

    return {
        "success": result["success"],
        "transcript": result.get("transcript"),
        "translation": result.get("translation"),
        "blood_group_detected": result.get("blood_group_detected"),
        "language": "Tamil",
        "powered_by": "Sarvam AI Bulbul v2",
        "disclaimer": "Cross-match verification mandatory before transfusion."
    }
