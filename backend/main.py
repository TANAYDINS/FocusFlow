import asyncio
import datetime
import os
from contextlib import asynccontextmanager

from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import tasks, ai, schedule, briefing, analytics, notes
from app.routers import settings as settings_router
from app.database import engine, Base, SessionLocal


Base.metadata.create_all(bind=engine)


def _run_db_migrations():
    """Add new columns to existing tables if they don't exist yet (SQLite)."""
    from sqlalchemy import inspect, text
    insp = inspect(engine)

    users_existing = {c["name"] for c in insp.get_columns("users")}
    user_migrations = {
        "telegram_chat_id": "ALTER TABLE users ADD COLUMN telegram_chat_id VARCHAR",
        "telegram_enabled": "ALTER TABLE users ADD COLUMN telegram_enabled INTEGER DEFAULT 0",
        "auto_schedule": "ALTER TABLE users ADD COLUMN auto_schedule INTEGER DEFAULT 1",
        "burnout_prevention": "ALTER TABLE users ADD COLUMN burnout_prevention INTEGER DEFAULT 1",
    }

    tasks_existing = {c["name"] for c in insp.get_columns("tasks")}
    task_migrations = {
        "assigned_to": "ALTER TABLE tasks ADD COLUMN assigned_to VARCHAR",
    }

    # Create telegram_users table if missing
    existing_tables = insp.get_table_names()

    with engine.connect() as conn:
        for col, sql in user_migrations.items():
            if col not in users_existing:
                conn.execute(text(sql))
        for col, sql in task_migrations.items():
            if col not in tasks_existing:
                conn.execute(text(sql))
        if "telegram_users" not in existing_tables:
            conn.execute(text(
                "CREATE TABLE telegram_users ("
                "id INTEGER PRIMARY KEY AUTOINCREMENT, "
                "chat_id VARCHAR UNIQUE NOT NULL, "
                "first_name VARCHAR, "
                "username VARCHAR, "
                "connected_at DATETIME DEFAULT CURRENT_TIMESTAMP"
                ")"
            ))
        conn.commit()


_sent_reminders: set = set()  # (task_id, date_str) — dedup across loop iterations


async def _reminder_loop():
    """Every 60 s, send a Telegram reminder for tasks starting in ~15 minutes."""
    global _sent_reminders
    from app.models import TelegramUser, Task, Schedule
    from app.services.telegram_service import send_reminder

    while True:
        await asyncio.sleep(60)
        try:
            now = datetime.datetime.utcnow()
            today_key = now.date().isoformat()
            window_start = now + datetime.timedelta(minutes=13)
            window_end = now + datetime.timedelta(minutes=17)

            db = SessionLocal()
            tg_users = db.query(TelegramUser).all()
            if tg_users:
                from_schedule = (
                    db.query(Schedule)
                    .join(Task, Schedule.task_id == Task.id)
                    .filter(
                        Schedule.user_id == 1,
                        Schedule.start_time >= window_start,
                        Schedule.start_time <= window_end,
                        Task.status == "pending",
                    )
                    .all()
                )
                from_tasks = (
                    db.query(Task)
                    .filter(
                        Task.user_id == 1,
                        Task.deadline >= window_start,
                        Task.deadline <= window_end,
                        Task.status == "pending",
                    )
                    .all()
                )

                reminders_to_send = []
                processed_task_ids = set()
                for s in from_schedule:
                    reminders_to_send.append((s.task_id, s.start_time))
                    processed_task_ids.add(s.task_id)
                for t in from_tasks:
                    if t.id not in processed_task_ids:
                        reminders_to_send.append((t.id, t.deadline))

                for task_id, start_time in reminders_to_send:
                    reminder_key = (task_id, today_key)
                    if reminder_key not in _sent_reminders:
                        task = db.query(Task).filter(Task.id == task_id).first()
                        if task:
                            for tgu in tg_users:
                                await send_reminder(tgu.chat_id, task.title, start_time)
                            _sent_reminders.add(reminder_key)
            db.close()
            _sent_reminders = {k for k in _sent_reminders if k[1] == today_key}
        except Exception as exc:
            print(f"[reminder] hata: {exc}")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # --- DB migrations ---
    _run_db_migrations()

    # --- Seed default user ---
    from app.models import User
    db = SessionLocal()
    if not db.query(User).filter(User.id == 1).first():
        db.add(User(id=1, name="FocusFlow User", productivity_pattern="morning_person"))
        db.commit()
    db.close()

    # --- Telegram bot ---
    bot_token = os.getenv("TELEGRAM_BOT_TOKEN", "").strip()
    if bot_token:
        from app.services.telegram_service import start_bot
        try:
            await start_bot(bot_token)
            print("[telegram] Bot başlatıldı.")
        except Exception as exc:
            print(f"[telegram] Bot başlatılamadı: {exc}")
    else:
        print("[telegram] TELEGRAM_BOT_TOKEN bulunamadı — Telegram devre dışı.")

    # --- 15-minute reminder background task ---
    reminder_task = asyncio.create_task(_reminder_loop())

    yield

    # --- Shutdown ---
    reminder_task.cancel()
    if bot_token:
        from app.services.telegram_service import stop_bot
        await stop_bot()


app = FastAPI(
    title="FocusFlow AI",
    description="AI-powered productivity assistant platform",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(tasks.router, prefix="/tasks", tags=["Tasks"])
app.include_router(ai.router, prefix="/ai", tags=["AI"])
app.include_router(schedule.router, prefix="/schedule", tags=["Schedule"])
app.include_router(briefing.router, prefix="/briefing", tags=["Briefing"])
app.include_router(analytics.router, prefix="/analytics", tags=["Analytics"])
app.include_router(notes.router, prefix="/notes", tags=["Notes"])
app.include_router(settings_router.router, prefix="/settings", tags=["Settings"])


@app.get("/")
def root():
    return {"message": "FocusFlow AI API is running"}
