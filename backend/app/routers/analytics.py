from fastapi import APIRouter

router = APIRouter()

@router.get("/")
def get_analytics():
    return {
        "focus_hours": 32,
        "completed_tasks": 45,
        "postponed_tasks": 5,
        "burnout_risk_score": 25,
        "productivity_trend": "upward"
    }
