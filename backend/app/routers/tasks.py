from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import models, schemas
from app.database import get_db
from app.services import ai_engine
from typing import List

router = APIRouter()

@router.post("/create", response_model=schemas.Task)
def create_task(task: schemas.TaskCreate, db: Session = Depends(get_db)):
    # Calculate priority using Gemini
    priority = ai_engine.calculate_priority_score(task.title, task.stress_level)
    
    db_task = models.Task(**task.dict(), priority_score=priority, user_id=1) # Hardcoded user for MVP
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task

@router.get("/", response_model=List[schemas.Task])
def get_tasks(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    tasks = db.query(models.Task).order_by(models.Task.priority_score.desc()).offset(skip).limit(limit).all()
    return tasks
