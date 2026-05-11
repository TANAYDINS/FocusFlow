from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import models, schemas
from app.database import get_db
from app.services import ai_engine
from typing import List

router = APIRouter()

@router.post("/", response_model=schemas.Note)
def create_note(note: schemas.NoteCreate, db: Session = Depends(get_db)):
    db_note = models.Note(**note.model_dump(), user_id=1)
    db.add(db_note)
    
    # Extract actions if it's a long note or explicitly requested
    actions = ai_engine.extract_actions_from_note(note.content)
    for action in actions:
        # Map priority string to score
        p_map = {"High": 90.0, "Medium": 60.0, "Low": 30.0}
        priority = p_map.get(action.get("priority"), 50.0)
        
        db_task = models.Task(
            title=action.get("title"),
            estimated_duration=action.get("estimated_duration", 60),
            priority_score=priority,
            user_id=1,
            description=f"Extracted from note: {note.title}"
        )
        db.add(db_task)
        
    db.commit()
    db.refresh(db_note)
    return db_note

@router.get("/", response_model=List[schemas.Note])
def get_notes(db: Session = Depends(get_db)):
    return db.query(models.Note).order_by(models.Note.created_at.desc()).all()

@router.patch("/{note_id}", response_model=schemas.Note)
def update_note(note_id: int, note_update: schemas.NoteCreate, db: Session = Depends(get_db)):
    db_note = db.query(models.Note).filter(models.Note.id == note_id).first()
    if not db_note:
        raise HTTPException(status_code=404, detail="Note not found")
    
    db_note.title = note_update.title
    db_note.content = note_update.content
    db_note.type = note_update.type
    
    db.commit()
    db.refresh(db_note)
    return db_note

@router.delete("/{note_id}")
def delete_note(note_id: int, db: Session = Depends(get_db)):
    note = db.query(models.Note).filter(models.Note.id == note_id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    db.delete(note)
    db.commit()
    return {"detail": "Note deleted"}
