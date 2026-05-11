from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app import models, schemas
from app.database import get_db
from datetime import datetime, timedelta, timezone

router = APIRouter()

@router.get("/", response_model=list[schemas.ScheduleBase])
def get_schedule(db: Session = Depends(get_db)):
    items = (
        db.query(models.Schedule)
        .filter(models.Schedule.user_id == 1)
        .order_by(models.Schedule.start_time)
        .all()
    )
    return [{"task_id": s.task_id, "start_time": s.start_time, "end_time": s.end_time} for s in items]


@router.post("/generate", response_model=list[schemas.ScheduleBase])
def generate_schedule(db: Session = Depends(get_db)):
    # Only personal tasks (no assigned_to) go into the user's own schedule
    tasks = (
        db.query(models.Task)
        .filter(models.Task.status == "pending", models.Task.assigned_to.is_(None))
        .all()
    )

    if not tasks:
        return []

    tasks_with_deadlines = sorted(
        [t for t in tasks if t.deadline],
        key=lambda x: x.deadline
    )
    tasks_without_deadlines = sorted(
        [t for t in tasks if not t.deadline],
        key=lambda x: (x.priority_score or 0),
        reverse=True
    )

    schedule_items = []
    now = datetime.now(timezone.utc)
    # Tasks without deadline start from next full hour (or in 15 min, whichever is later)
    current_time = now.replace(second=0, microsecond=0) + timedelta(hours=1)
    current_time = current_time.replace(minute=0)

    # Tasks with deadlines: use deadline as start time
    for task in tasks_with_deadlines:
        start_time = task.deadline
        duration = task.estimated_duration or 60
        end_time = start_time + timedelta(minutes=duration)
        schedule_items.append({
            "task_id": task.id,
            "start_time": start_time,
            "end_time": end_time,
        })

    schedule_items = sorted(schedule_items, key=lambda x: x["start_time"])

    # Tasks without deadlines: fill gaps starting from current_time
    for task in tasks_without_deadlines:
        duration = task.estimated_duration or 60
        proposed_start = current_time

        if schedule_items:
            last_end = max(s["end_time"] for s in schedule_items)
            if proposed_start < last_end:
                proposed_start = last_end + timedelta(minutes=15)

        end_time = proposed_start + timedelta(minutes=duration)
        schedule_items.append({
            "task_id": task.id,
            "start_time": proposed_start,
            "end_time": end_time,
        })
        schedule_items = sorted(schedule_items, key=lambda x: x["start_time"])

    # --- DB'ye kaydet (eski takvimi temizle, yenisini yaz) ---
    db.query(models.Schedule).filter(models.Schedule.user_id == 1).delete()
    for item in schedule_items:
        db.add(models.Schedule(
            task_id=item["task_id"],
            start_time=item["start_time"],
            end_time=item["end_time"],
            user_id=1,
        ))
    db.commit()

    return schedule_items
