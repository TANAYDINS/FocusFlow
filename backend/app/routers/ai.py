from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import List, Any
from app.services import ai_engine
from app.database import get_db
from app import models

router = APIRouter()

class AIAnalyzeRequest(BaseModel):
    text: str
    current_time: str = None

class ChatRequest(BaseModel):
    message: str
    history: List[Any] = []

@router.post("/analyze")
def analyze_text(request: AIAnalyzeRequest):
    extracted_tasks = ai_engine.analyze_tasks_from_text(request.text, request.current_time)
    insights = ai_engine.generate_planner_insights(extracted_tasks)
    return {
        "extracted_tasks": extracted_tasks,
        "insights": insights,
    }

@router.post("/daily-plan")
def get_daily_plan(db: Session = Depends(get_db)):
    pending_tasks = (
        db.query(models.Task)
        .filter(models.Task.user_id == 1, models.Task.status == "pending")
        .order_by(models.Task.priority_score.desc())
        .all()
    )
    schedules = (
        db.query(models.Schedule)
        .filter(models.Schedule.user_id == 1)
        .order_by(models.Schedule.start_time)
        .all()
    )

    task_dicts = [
        {
            "title": t.title,
            "estimated_duration": t.estimated_duration,
            "priority_score": t.priority_score,
            "stress_level": t.stress_level,
            "deadline": t.deadline.isoformat() + "Z" if t.deadline else None,
        }
        for t in pending_tasks
    ]
    schedule_dicts = [
        {
            "task_id": s.task_id,
            "start_time": s.start_time.isoformat() + "Z",
            "end_time": s.end_time.isoformat() + "Z",
        }
        for s in schedules
    ]

    plan = ai_engine.generate_detailed_daily_plan(task_dicts, schedule_dicts)
    return {"plan": plan}


@router.post("/chat")
def chat(request: ChatRequest, db: Session = Depends(get_db)):
    pending_tasks = (
        db.query(models.Task)
        .filter(models.Task.user_id == 1, models.Task.status == "pending")
        .order_by(models.Task.priority_score.desc())
        .all()
    )
    schedules = (
        db.query(models.Schedule)
        .filter(models.Schedule.user_id == 1)
        .order_by(models.Schedule.start_time)
        .all()
    )
    task_dicts = [
        {
            "title": t.title,
            "estimated_duration": t.estimated_duration,
            "deadline": t.deadline.isoformat() + "Z" if t.deadline else None,
            "assigned_to": t.assigned_to,
        }
        for t in pending_tasks
    ]
    schedule_dicts = [
        {"start_time": s.start_time.isoformat() + "Z", "end_time": s.end_time.isoformat() + "Z"}
        for s in schedules
    ]
    reply = ai_engine.chat_assistant(request.message, request.history, task_dicts, schedule_dicts)
    return {"reply": reply}
