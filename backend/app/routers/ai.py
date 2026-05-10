from fastapi import APIRouter
from pydantic import BaseModel
from app.services import ai_engine

router = APIRouter()

class AIAnalyzeRequest(BaseModel):
    text: str

@router.post("/analyze")
def analyze_text(request: AIAnalyzeRequest):
    extracted_tasks = ai_engine.analyze_tasks_from_text(request.text)
    
    return {
        "extracted_tasks": extracted_tasks
    }
