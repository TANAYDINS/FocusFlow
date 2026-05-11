# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

FocusFlow AI is a productivity app with an AI-powered planner. It uses **Google Gemini** (`gemini-2.0-flash`) to extract tasks from natural language, generate optimized schedules, and produce daily briefings. A **Telegram bot** sends 15-minute task reminders.

## Development Commands

### Backend (FastAPI) — Windows
```powershell
cd backend
# First time setup
python -m venv venv
pip install -r requirements.txt

# Run dev server (PowerShell execution policy blocks Activate.ps1 — use python.exe directly)
venv\Scripts\python.exe -m uvicorn main:app --reload
# API: http://localhost:8000  |  Swagger: http://localhost:8000/docs
```

### Frontend (React + Vite)
```powershell
cd frontend
npm install        # first time
npm run dev        # dev server at http://localhost:5173
npm run build      # tsc then vite build
npm run lint       # ESLint (max-warnings 0)

# TypeScript type check only (no emit)
node_modules/.bin/tsc --noEmit
```

### Manual Integration Tests
```powershell
cd backend
venv\Scripts\python.exe test_backend_flow.py   # full flow: text analysis → task creation → schedule
venv\Scripts\python.exe test_gemini.py         # Gemini API connectivity test
```

No automated test runner (pytest/Jest) is configured.

## Architecture

### Backend (`backend/`)
- **Entry** — `main.py`: creates the FastAPI app, registers all routers, and runs the `lifespan` startup which: runs DB migrations, seeds `user_id=1` + sample tasks/email, starts the Telegram bot (if `TELEGRAM_BOT_TOKEN` is set), and launches a background `_reminder_loop` task every 60 s.
- **Routers** (`app/routers/`): `tasks`, `ai`, `schedule`, `briefing`, `analytics`, `emails`, `notes`, `settings` — one file per domain.
- **AI Service** (`app/services/ai_engine.py`): all Gemini calls. Uses `genai.Client(api_key=...)` from the `google-genai` SDK (not the old `genai.configure()` pattern). Falls back to `_mock_task_extraction()` (regex + Turkish keyword mapping) when `GEMINI_API_KEY` is missing.
- **Telegram** (`app/services/telegram_service.py`): `python-telegram-bot` v22 async bot. Handles `/start` (saves `chat_id` to DB), `/gorevler`, `/yardim`. Reminder delivery via `send_reminder()` called from the background loop.
- **DB migrations** — `_run_db_migrations()` in `main.py` uses `ALTER TABLE` to add new columns to existing SQLite DBs without dropping data.
- **Database**: SQLite (`focusflow.db`), SQLAlchemy 2.x ORM — models in `app/models.py`, Pydantic v2 schemas in `app/schemas.py`.

### Frontend (`frontend/src/`)
- **Routing** — `App.tsx`: React Router v6 with pages `Dashboard`, `Tasks`, `AIPlanner`, `Analytics`, `Settings`. Focus mode (Pomodoro) state lives here and is passed as `onStartFocus` prop.
- **API client** — `api/client.ts`: single Axios instance at `http://127.0.0.1:8000`, exported as `taskApi`, `aiApi`, `scheduleApi`, `dashboardApi`, `emailApi`, `noteApi`, `settingsApi`.
- **Dashboard widgets** (`components/dashboard/`): `AIDailyBriefing`, `PriorityTasks`, `EmailIntelligence`, `FocusTimeline`, `KnowledgeHub`. `FocusTimeline` calls `generateSchedule` (POST) on first mount, then polls via `getSchedule` (GET) every 30 s.
- **KnowledgeHub** detects schedule-query intent (keyword list in component) and calls `POST /ai/daily-plan` — returns Gemini-generated detailed plan text instead of saving a note.

### Tailwind Design System
Custom tokens defined in `tailwind.config.js`:
- `bg-background` → `#0B0C10` (page background)
- `bg-surface` → semi-transparent gray (cards)
- `text-primary` / `bg-primary` → `#45f3ff` (cyan accent)
- `text-secondary` / `bg-secondary` → `#bb86fc` (purple accent)
- `glass-card` — the reusable glassmorphism card class (defined in global CSS, not Tailwind plugin)

## Key Design Decisions

- **Single user**: `user_id=1` is hardcoded in every router — no auth, no multi-user (MVP scope).
- **Schedule algorithm**: deadline-first sort, then priority-score gap-filling (`routers/schedule.py`). Generates and persists to `schedules` table; old schedule is deleted on each generation.
- **AI fallback**: `_mock_task_extraction` splits on `ve/ayrıca/,/;/.`, matches Turkish keyword groups. Time extraction only fires on explicit `saat X` or `HH:MM` formats — bare numbers (e.g. "3 rapor") are intentionally ignored to avoid false clock readings.
- **`POST /ai/daily-plan`** — fetches pending tasks + current schedule from DB, passes them to `generate_detailed_daily_plan()` which produces a prioritized, hour-by-hour Turkish plan with risk notes. Used by KnowledgeHub on schedule queries.
- **CORS**: all origins allowed in `main.py` for local dev.
- **PowerShell execution policy**: `venv\Scripts\Activate.ps1` is blocked on this machine. Always invoke `venv\Scripts\python.exe` directly instead of activating the venv.

## Environment

`backend/.env` (required keys):
```
GEMINI_API_KEY=<your key>
TELEGRAM_BOT_TOKEN=<optional — bot disabled if missing>
```

Frontend API URL is hardcoded in `frontend/src/api/client.ts` (no `.env` for frontend).
