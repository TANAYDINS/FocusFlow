from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    productivity_pattern = Column(String, default="morning_person")
    burnout_score = Column(Float, default=0.0)

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
    user_id = Column(Integer, ForeignKey("users.id"))

class Schedule(Base):
    __tablename__ = "schedules"

    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(Integer, ForeignKey("tasks.id"))
    start_time = Column(DateTime)
    end_time = Column(DateTime)
    user_id = Column(Integer, ForeignKey("users.id"))
