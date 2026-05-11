from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app import models
from app.database import get_db

router = APIRouter()

@router.get("/")
def get_analytics(db: Session = Depends(get_db)):
    total_tasks = db.query(models.Task).count()
    completed_tasks = db.query(models.Task).filter(models.Task.status == "completed").count()
    pending_tasks = total_tasks - completed_tasks
    
    # Calculate focus hours (sum of estimated durations of completed tasks)
    focus_minutes = db.query(models.Task).filter(models.Task.status == "completed").with_entities(models.Task.estimated_duration).all()
    total_focus_hours = sum(m[0] for m in focus_minutes if m[0]) / 60.0
    
    # Calculate burnout risk based on pending tasks and their stress levels
    stress_levels = db.query(models.Task).filter(models.Task.status == "pending").with_entities(models.Task.stress_level).all()
    avg_stress = sum(s[0] for s in stress_levels if s[0]) / len(stress_levels) if stress_levels else 0
    burnout_risk = min(100, int((pending_tasks * 10) + (avg_stress * 10)))

    return {
        "focus_hours": round(total_focus_hours, 1),
        "completed_tasks": completed_tasks,
        "pending_tasks": pending_tasks,
        "burnout_risk": burnout_risk,
        "productivity_score": 85 if completed_tasks > 0 else 0,
        "daily_stats": [
            {"day": "Mon", "hours": 4.5},
            {"day": "Tue", "hours": 6.2},
            {"day": "Wed", "hours": 3.8},
            {"day": "Thu", "hours": 5.0},
            {"day": "Fri", "hours": total_focus_hours or 0.5},
        ]
    }
