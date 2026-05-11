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
    
    db_task = models.Task(**task.model_dump(), priority_score=priority, user_id=1) # Hardcoded user for MVP
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task

@router.post("/bulk", response_model=List[schemas.Task])
def create_tasks_bulk(tasks_in: List[schemas.TaskCreate], db: Session = Depends(get_db)):
    db_tasks = []
    for task in tasks_in:
        # Derive priority from stress_level directly — avoids N Gemini calls per bulk save
        priority = min(95.0, max(20.0, (task.stress_level or 1) * 17.0 + 13.0))
        db_task = models.Task(**task.model_dump(), priority_score=priority, user_id=1)
        db.add(db_task)
        db_tasks.append(db_task)

    db.commit()
    for t in db_tasks:
        db.refresh(t)
    return db_tasks

@router.get("/", response_model=List[schemas.Task])
def get_tasks(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    db_tasks = db.query(models.Task).order_by(models.Task.priority_score.desc()).offset(skip).limit(limit).all()
    return db_tasks
@router.patch("/{task_id}", response_model=schemas.Task)
def update_task(task_id: int, task_update: schemas.TaskUpdate, db: Session = Depends(get_db)):
    db_task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")

    for key, value in task_update.model_dump(exclude_none=True).items():
        setattr(db_task, key, value)

    db.commit()
    db.refresh(db_task)
    return db_task

@router.delete("/{task_id}")
def delete_task(task_id: int, db: Session = Depends(get_db)):
    db_task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    db.delete(db_task)
    db.commit()
    return {"detail": "Task deleted"}
