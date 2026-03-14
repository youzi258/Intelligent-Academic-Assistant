# -*- coding: utf-8 -*-
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.polish_service import PolishService

router = APIRouter()


class PolishRequest(BaseModel):
    text: str
    type: str  # Expression polishing, logic checking, removing AI flavor, translation (Chinese to English, English to Chinese), abbreviation/expansion
    language: str = "Chinese"  # Chinese or English
    api_key: str = ""
    base_url: str = "https://api.deepseek.com/v1"
    model: str = "deepseek-chat"


class PolishResponse(BaseModel):
    original_text: str
    polished_text: str
    polish_type: str
    modification_log: str = ""


@router.post("/", response_model=PolishResponse)
async def polish_text(request: PolishRequest):
    try:
        service = PolishService(
            api_key=request.api_key, base_url=request.base_url, model=request.model
        )
        result = service.polish(request.text, request.type, request.language)
        return PolishResponse(
            original_text=request.text,
            polished_text=result["polished_text"],
            polish_type=request.type,
            modification_log=result.get("modification_log", ""),
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
