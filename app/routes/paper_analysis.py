# -*- coding: utf-8 -*-
from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from pydantic import BaseModel
from app.services.paper_analysis_service import PaperAnalysisService

router = APIRouter()


class PaperAnalysisResponse(BaseModel):
    title: str = ""
    authors: str = ""
    abstract: str = ""
    methodology: str = ""
    results: str = ""
    conclusion: str = ""
    key_terms: list = []
    outline: str = ""


class ExplainContentRequest(BaseModel):
    text: str
    content: str
    api_key: str = ""
    base_url: str = "https://api.deepseek.com/v1"
    model: str = "deepseek-chat"


@router.post("/", response_model=PaperAnalysisResponse)
async def analyze_paper(
    file: UploadFile = File(...),
    api_key: str = Form(""),
    base_url: str = Form("https://api.deepseek.com/v1"),
    model: str = Form("deepseek-chat"),
):
    try:
        service = PaperAnalysisService(api_key=api_key, base_url=base_url, model=model)
        result = service.analyze(file)
        return PaperAnalysisResponse(
            title=result.get("title", ""),
            authors=result.get("authors", ""),
            abstract=result.get("abstract", ""),
            methodology=result.get("methodology", ""),
            results=result.get("results", ""),
            conclusion=result.get("conclusion", ""),
            key_terms=result.get("key_terms", []),
            outline=result.get("outline", ""),
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/explain-content")
async def explain_content(request: ExplainContentRequest):
    try:
        service = PaperAnalysisService(
            api_key=request.api_key, base_url=request.base_url, model=request.model
        )
        explanation = service.explain_content(request.text, request.content)
        return explanation
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
