import datetime
from html import escape
from telegram import InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import Application, CommandHandler, CallbackQueryHandler, MessageHandler, filters

bot_application: Application | None = None
bot_username: str | None = None


async def _start_handler(update, context):
    chat_id = str(update.effective_chat.id)
    tg_user = update.effective_user
    first_name = escape(tg_user.first_name or "kullanıcı")

    from app.database import SessionLocal
    from app.models import User, TelegramUser
    db = SessionLocal()

    # Upsert into telegram_users
    existing = db.query(TelegramUser).filter(TelegramUser.chat_id == chat_id).first()
    if existing:
        existing.first_name = tg_user.first_name or ""
        existing.username = tg_user.username
    else:
        db.add(TelegramUser(
            chat_id=chat_id,
            first_name=tg_user.first_name or "",
            username=tg_user.username,
        ))

    # Keep user_id=1 marked as telegram_enabled so frontend status works
    owner = db.query(User).filter(User.id == 1).first()
    if owner:
        owner.telegram_enabled = True
    db.commit()
    db.close()

    await update.message.reply_text(
        f"✅ Merhaba <b>{first_name}</b>! FocusFlow AI'a bağlandınız.\n\n"
        "📋 /gorevler — Görevler ve işler\n"
        "👥 /is — İş dağılımını gör\n"
        "➕ Görev eklemek için direkt yaz:\n"
        "  <i>Yarın saat 10'da toplantım var</i>\n"
        "  <i>Ahmet raporu yazacak</i>\n"
        "ℹ️ /yardim — Yardım",
        parse_mode="HTML",
    )


async def _message_handler(update, context):
    """Serbest metin → AI ile görev çıkar → onay iste."""
    text = update.message.text
    if not text:
        return

    await update.message.reply_text("🔍 Görev analiz ediliyor...")

    from app.services.ai_engine import analyze_tasks_from_text
    try:
        tasks = analyze_tasks_from_text(text)
    except Exception:
        tasks = []

    if not tasks:
        await update.message.reply_text(
            "❌ Bu metinden görev çıkaramadım.\n\n"
            "Örnek kullanım:\n"
            "• <i>Yarın saat 15'te randevum var</i>\n"
            "• <i>Ahmet pazartesi rapor yazacak</i>\n"
            "• <i>Bugün saat 14'te sunum hazırlayacağım</i>",
            parse_mode="HTML",
        )
        return

    # Önizleme mesajı
    lines = ["📋 <b>Şu görevi ekleyeyim mi?</b>\n"]
    for t in tasks:
        assigned = f"👤 {escape(t.get('assigned_to') or '')}" if t.get("assigned_to") else "📌 Benim görevim"
        deadline_str = ""
        if t.get("deadline"):
            try:
                dt = datetime.datetime.fromisoformat(t["deadline"])
                deadline_str = f" · 🕐 {dt.strftime('%d.%m %H:%M')}"
            except Exception:
                pass
        lines.append(f"• <b>{escape(t['title'])}</b>")
        lines.append(f"  {assigned} · ⏱ {t.get('estimated_duration', 45)} dk{deadline_str}")

    context.user_data["pending_tasks"] = tasks

    keyboard = [[
        InlineKeyboardButton("✅ Evet, ekle", callback_data="task_confirm"),
        InlineKeyboardButton("❌ İptal", callback_data="task_cancel"),
    ]]

    await update.message.reply_text(
        "\n".join(lines),
        reply_markup=InlineKeyboardMarkup(keyboard),
        parse_mode="HTML",
    )


async def _task_confirm_callback(update, context):
    query = update.callback_query
    await query.answer()

    if query.data == "task_cancel":
        await query.edit_message_text("❌ İptal edildi.")
        context.user_data.pop("pending_tasks", None)
        return

    tasks = context.user_data.get("pending_tasks", [])
    if not tasks:
        await query.edit_message_text("❌ Eklenecek görev bulunamadı.")
        return

    from app.database import SessionLocal
    from app.models import Task
    db = SessionLocal()
    saved_titles = []
    for t in tasks:
        deadline = None
        if t.get("deadline"):
            try:
                deadline = datetime.datetime.fromisoformat(t["deadline"])
            except Exception:
                pass
        db.add(Task(
            title=t["title"],
            estimated_duration=t.get("estimated_duration", 45),
            deadline=deadline,
            assigned_to=t.get("assigned_to"),
            stress_level=3,
            user_id=1,
            status="pending",
        ))
        saved_titles.append((t["title"], t.get("assigned_to")))
    db.commit()
    db.close()

    lines = ["✅ <b>Görev eklendi!</b>\n"]
    for title, assigned in saved_titles:
        tag = f"👤 {escape(assigned)}" if assigned else "📌 Görevlerim"
        lines.append(f"• {escape(title)} → {tag}")
    lines.append("\n<i>FocusFlow'da görüntüleyebilirsiniz.</i>")

    await query.edit_message_text("\n".join(lines), parse_mode="HTML")
    context.user_data.pop("pending_tasks", None)


async def _gorevler_handler(update, context):
    keyboard = [[
        InlineKeyboardButton("📋 Görevlerim", callback_data="cat_personal"),
        InlineKeyboardButton("👥 İşler", callback_data="cat_assigned"),
    ]]
    await update.message.reply_text(
        "Hangi listeyi görmek istersiniz?",
        reply_markup=InlineKeyboardMarkup(keyboard),
        parse_mode="HTML",
    )


async def _category_callback(update, context):
    query = update.callback_query
    await query.answer()

    from app.database import SessionLocal
    from app.models import Task, Schedule
    db = SessionLocal()

    if query.data == "cat_personal":
        tasks = (
            db.query(Task)
            .filter(Task.user_id == 1, Task.status == "pending", Task.assigned_to.is_(None))
            .order_by(Task.priority_score.desc())
            .all()
        )
        task_ids = [t.id for t in tasks]
        schedules = {
            s.task_id: s
            for s in db.query(Schedule).filter(Schedule.task_id.in_(task_ids)).all()
        } if task_ids else {}

        if not tasks:
            await query.edit_message_text("📋 Bekleyen kişisel göreviniz yok!", parse_mode="HTML")
        else:
            lines = ["📋 <b>Görevlerim</b>\n"]
            for i, t in enumerate(tasks, 1):
                sched = schedules.get(t.id)
                time_val = sched.start_time if sched else t.deadline
                time_str = (time_val + datetime.timedelta(hours=3)).strftime("%d.%m %H:%M") if time_val else "Planlanmadı"
                lines.append(f"{i}. 📌 <b>{escape(t.title)}</b>")
                lines.append(f"   🕐 {time_str} · ⏱ {t.estimated_duration} dk")
            await query.edit_message_text("\n".join(lines), parse_mode="HTML")

    elif query.data == "cat_assigned":
        tasks = (
            db.query(Task)
            .filter(Task.user_id == 1, Task.status == "pending", Task.assigned_to.isnot(None))
            .order_by(Task.assigned_to)
            .all()
        )
        if not tasks:
            await query.edit_message_text("👥 Henüz atanmış iş yok!", parse_mode="HTML")
        else:
            task_ids = [t.id for t in tasks]
            schedules = {
                s.task_id: s
                for s in db.query(Schedule).filter(Schedule.task_id.in_(task_ids)).all()
            } if task_ids else {}
            grouped: dict = {}
            for t in tasks:
                grouped.setdefault(t.assigned_to, []).append(t)
            lines = ["👥 <b>İş Dağılımı</b>\n"]
            for person, pts in grouped.items():
                lines.append(f"👤 <b>{escape(person)}</b>:")
                for t in pts:
                    sched = schedules.get(t.id)
                    time_val = sched.start_time if sched else t.deadline
                    time_str = (time_val + datetime.timedelta(hours=3)).strftime("%d.%m %H:%M") if time_val else "Planlanmadı"
                    lines.append(f"  • {escape(t.title)} ({t.estimated_duration} dk) · 🕐 {time_str}")
                lines.append("")
            await query.edit_message_text("\n".join(lines), parse_mode="HTML")

    db.close()


async def _is_handler(update, context):
    from app.database import SessionLocal
    from app.models import Task
    db = SessionLocal()
    tasks = (
        db.query(Task)
        .filter(Task.user_id == 1, Task.status == "pending", Task.assigned_to.isnot(None))
        .order_by(Task.assigned_to)
        .all()
    )
    db.close()

    if not tasks:
        await update.message.reply_text("👥 Henüz atanmış iş yok!", parse_mode="HTML")
        return

    grouped: dict = {}
    for t in tasks:
        grouped.setdefault(t.assigned_to, []).append(t)

    lines = ["👥 <b>İş Dağılımı</b>\n"]
    for person, pts in grouped.items():
        lines.append(f"👤 <b>{escape(person)}</b>:")
        for t in pts:
            deadline_str = ""
            if t.deadline:
                deadline_str = f" · 🕐 {(t.deadline + datetime.timedelta(hours=3)).strftime('%d.%m %H:%M')}"
            lines.append(f"  • {escape(t.title)} ({t.estimated_duration} dk){deadline_str}")
        lines.append("")
    await update.message.reply_text("\n".join(lines), parse_mode="HTML")


async def _help_handler(update, context):
    await update.message.reply_text(
        "🤖 <b>FocusFlow AI Bot — Yardım</b>\n\n"
        "<b>Komutlar:</b>\n"
        "/gorevler — Görev ve iş listesi\n"
        "/is — İş dağılımını gör\n"
        "/yardim — Bu mesaj\n\n"
        "<b>Görev Eklemek:</b>\n"
        "Komut kullanmadan direkt yaz:\n"
        "• <i>Yarın saat 10'da toplantım var</i>\n"
        "• <i>Ahmet Çarşamba rapor yazacak</i>\n"
        "• <i>Bugün saat 15'te sunum hazırlayacağım</i>\n\n"
        "Bot görevi analiz eder ve onayını ister.",
        parse_mode="HTML",
    )


async def start_bot(token: str) -> None:
    global bot_application, bot_username
    app = Application.builder().token(token).build()
    app.add_handler(CommandHandler("start", _start_handler))
    app.add_handler(CommandHandler("gorevler", _gorevler_handler))
    app.add_handler(CommandHandler("is", _is_handler))
    app.add_handler(CommandHandler("yardim", _help_handler))
    app.add_handler(CallbackQueryHandler(_category_callback, pattern="^cat_"))
    app.add_handler(CallbackQueryHandler(_task_confirm_callback, pattern="^task_"))
    app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, _message_handler))

    await app.initialize()
    bot_username = app.bot.username
    await app.start()
    await app.updater.start_polling(drop_pending_updates=True)
    bot_application = app


async def stop_bot() -> None:
    global bot_application
    if bot_application:
        await bot_application.updater.stop()
        await bot_application.stop()
        await bot_application.shutdown()
        bot_application = None


async def send_task_list(chat_id: str) -> bool:
    if not bot_application:
        return False
    from app.database import SessionLocal
    from app.models import Task
    db = SessionLocal()
    tasks = (
        db.query(Task)
        .filter(Task.user_id == 1, Task.status == "pending", Task.assigned_to.is_(None))
        .order_by(Task.priority_score.desc())
        .all()
    )
    db.close()
    if not tasks:
        text = "📋 Bekleyen göreviniz yok!"
    else:
        lines = ["📋 <b>Görevlerim</b>\n"]
        for i, t in enumerate(tasks, 1):
            lines.append(f"{i}. 📌 <b>{escape(t.title)}</b> — {t.estimated_duration} dk")
        text = "\n".join(lines)
    await bot_application.bot.send_message(chat_id=chat_id, text=text, parse_mode="HTML")
    return True


async def send_reminder(chat_id: str, task_title: str, start_time: datetime.datetime) -> None:
    if not bot_application:
        return
    local_time = start_time + datetime.timedelta(hours=3)
    message = (
        f"⏰ <b>15 Dakika Kaldı!</b>\n\n"
        f"📌 <b>{escape(task_title)}</b>\n"
        f"🕐 Başlangıç: {local_time.strftime('%H:%M')}\n\n"
        "Hazırlanma zamanı! 💪"
    )
    await bot_application.bot.send_message(chat_id=chat_id, text=message, parse_mode="HTML")
