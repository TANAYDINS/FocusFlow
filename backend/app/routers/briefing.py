from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app import models, schemas
from app.database import get_db
from app.services import ai_engine

router = APIRouter()

@router.get("/today", response_model=schemas.DailyBriefing)
def get_daily_briefing(db: Session = Depends(get_db)):
    # 1. Get top 3 pending tasks
    top_tasks = db.query(models.Task).filter(models.Task.status == "pending").order_by(models.Task.priority_score.desc()).limit(3).all()
    
    # 2. Get urgent emails
    urgent_emails = db.query(models.Email).filter(models.Email.is_urgent == 1).all()
    
    # 3. Generate AI Summary
    task_dicts = [{"title": t.title, "priority": t.priority_score} for t in top_tasks]
    email_dicts = [{"sender": e.sender, "subject": e.subject} for e in urgent_emails]
    
    ai_summary = ai_engine.generate_comprehensive_briefing(task_dicts, email_dicts)
    
    return {
        "message": ai_summary,
        "important_tasks_count": len(top_tasks),
        "urgent_emails_count": len(urgent_emails),
        "top_tasks": top_tasks,
        "urgent_emails": urgent_emails,
        "schedule_overview": "Your schedule is optimized for deep work before noon."
    }
