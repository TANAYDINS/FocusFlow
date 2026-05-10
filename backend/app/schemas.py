from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    deadline: Optional[datetime] = None
    estimated_duration: int = 60
    stress_level: int = 1

class TaskCreate(TaskBase):
    pass

class Task(TaskBase):
    id: int
    priority_score: float
    status: str
    user_id: int

    class Config:
        from_attributes = True

class ScheduleBase(BaseModel):
    task_id: int
    start_time: datetime
    end_time: datetime

class Schedule(ScheduleBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True
