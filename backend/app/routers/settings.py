from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models import User, TelegramUser
from app import schemas
from app.services import telegram_service

router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/", response_model=schemas.UserSettings)
def get_settings(db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == 1).first()
    return schemas.UserSettings(
        auto_schedule=bool(user.auto_schedule),
        burnout_prevention=bool(user.burnout_prevention),
        telegram_enabled=bool(user.telegram_enabled),
        telegram_connected=user.telegram_chat_id is not None,
        bot_username=telegram_service.bot_username,
    )


@router.put("/")
def update_settings(data: schemas.UserSettingsUpdate, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == 1).first()
    if data.auto_schedule is not None:
        user.auto_schedule = data.auto_schedule
    if data.burnout_prevention is not None:
        user.burnout_prevention = data.burnout_prevention
    db.commit()
    return {"success": True}


@router.get("/telegram/status")
def telegram_status(db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == 1).first()
    return {
        "connected": user.telegram_chat_id is not None,
        "enabled": bool(user.telegram_enabled),
        "bot_username": telegram_service.bot_username,
    }


@router.post("/telegram/disconnect")
def telegram_disconnect(db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == 1).first()
    user.telegram_chat_id = None
    user.telegram_enabled = False
    db.commit()
    return {"success": True}


@router.post("/telegram/send-tasks")
async def send_tasks_to_telegram(db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == 1).first()
    if not user.telegram_chat_id:
        raise HTTPException(status_code=400, detail="Telegram bağlı değil")
    success = await telegram_service.send_task_list(user.telegram_chat_id)
    if not success:
        raise HTTPException(status_code=503, detail="Bot aktif değil — TELEGRAM_BOT_TOKEN eksik olabilir")
    return {"success": True, "message": "Görevler Telegram'a gönderildi"}


@router.get("/telegram/users")
def list_telegram_users(db: Session = Depends(get_db)):
    users = db.query(TelegramUser).order_by(TelegramUser.connected_at).all()
    return [
        {
            "chat_id": u.chat_id,
            "first_name": u.first_name,
            "username": u.username,
            "connected_at": u.connected_at.isoformat() if u.connected_at else None,
        }
        for u in users
    ]


@router.delete("/telegram/users/{chat_id}")
def remove_telegram_user(chat_id: str, db: Session = Depends(get_db)):
    user = db.query(TelegramUser).filter(TelegramUser.chat_id == chat_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı")
    db.delete(user)
    db.commit()
    return {"success": True}
