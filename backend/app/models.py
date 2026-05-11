import datetime
from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Boolean
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    productivity_pattern = Column(String, default="morning_person")
    burnout_score = Column(Float, default=0.0)
    telegram_chat_id = Column(String, nullable=True)
    telegram_enabled = Column(Boolean, default=False)
    auto_schedule = Column(Boolean, default=True)
    burnout_prevention = Column(Boolean, default=True)

class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(String, nullable=True)
    deadline = Column(DateTime, nullable=True)
    priority_score = Column(Float, default=0.0)
    estimated_duration = Column(Integer, default=60) # in minutes
    stress_level = Column(Integer, default=1) # 1 to 5
    status = Column(String, default="pending")
    assigned_to = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    user_id = Column(Integer, ForeignKey("users.id"))

class Schedule(Base):
    __tablename__ = "schedules"

    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(Integer, ForeignKey("tasks.id"))
    start_time = Column(DateTime)
    end_time = Column(DateTime)
    user_id = Column(Integer, ForeignKey("users.id"))

class Email(Base):
    __tablename__ = "emails"

    id = Column(Integer, primary_key=True, index=True)
    sender = Column(String)
    subject = Column(String)
    content = Column(String)
    summary = Column(String, nullable=True)
    is_urgent = Column(Integer, default=0) # 0 or 1
    received_at = Column(DateTime, default=datetime.datetime.utcnow)
    user_id = Column(Integer, ForeignKey("users.id"))

class TelegramUser(Base):
    __tablename__ = "telegram_users"

    id = Column(Integer, primary_key=True, index=True)
    chat_id = Column(String, unique=True, nullable=False)
    first_name = Column(String)
    username = Column(String, nullable=True)
    connected_at = Column(DateTime, default=datetime.datetime.utcnow)


class Note(Base):
    __tablename__ = "notes"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    content = Column(String)
    type = Column(String, default="text") # text, voice, doc
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    user_id = Column(Integer, ForeignKey("users.id"))
