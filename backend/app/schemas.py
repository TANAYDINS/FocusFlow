from datetime import datetime, timezone
from pydantic import BaseModel, ConfigDict, field_serializer
from typing import Optional, List

def format_datetime(dt: datetime) -> str:
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt.isoformat().replace('+00:00', 'Z')

class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    deadline: Optional[datetime] = None
    estimated_duration: int = 60
    stress_level: int = 1
    assigned_to: Optional[str] = None

class TaskCreate(TaskBase):
    pass

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    deadline: Optional[datetime] = None
    estimated_duration: Optional[int] = None
    stress_level: Optional[int] = None
    status: Optional[str] = None
    priority_score: Optional[float] = None

class Task(TaskBase):
    id: int
    priority_score: float
    status: str
    created_at: datetime
    user_id: int

    model_config = ConfigDict(from_attributes=True)

    @field_serializer('deadline', 'created_at')
    def serialize_dt(self, dt: datetime, _info):
        return format_datetime(dt) if dt else None

class ScheduleBase(BaseModel):
    task_id: int
    start_time: datetime
    end_time: datetime

    @field_serializer('start_time', 'end_time')
    def serialize_dt(self, dt: datetime, _info):
        return format_datetime(dt) if dt else None

class Schedule(ScheduleBase):
    id: int
    user_id: int

    model_config = ConfigDict(from_attributes=True)

# Email Schemas
class EmailBase(BaseModel):
    sender: str
    subject: str
    content: str

class EmailCreate(EmailBase):
    pass

class Email(EmailBase):
    id: int
    summary: Optional[str] = None
    is_urgent: int
    received_at: datetime
    user_id: int

    model_config = ConfigDict(from_attributes=True)

    @field_serializer('received_at')
    def serialize_dt(self, dt: datetime, _info):
        return format_datetime(dt) if dt else None

# Note Schemas
class NoteBase(BaseModel):
    title: str
    content: str
    type: str = "text"

class NoteCreate(NoteBase):
    pass

class Note(NoteBase):
    id: int
    created_at: datetime
    user_id: int

    model_config = ConfigDict(from_attributes=True)

    @field_serializer('created_at')
    def serialize_dt(self, dt: datetime, _info):
        return format_datetime(dt) if dt else None

# Settings Schemas
class UserSettings(BaseModel):
    auto_schedule: bool
    burnout_prevention: bool
    telegram_enabled: bool
    telegram_connected: bool
    bot_username: Optional[str] = None

class UserSettingsUpdate(BaseModel):
    auto_schedule: Optional[bool] = None
    burnout_prevention: Optional[bool] = None

# Briefing Schema
class DailyBriefing(BaseModel):
    message: str
    important_tasks_count: int
    urgent_emails_count: int
    top_tasks: List[Task]
    urgent_emails: List[Email]
    schedule_overview: str
