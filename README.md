# FocusFlow AI

FocusFlow AI is a modern, AI-powered productivity assistant platform that acts like a proactive productivity agent.

## Tech Stack
*   **Frontend**: React, TypeScript, Vite, TailwindCSS, Framer Motion
*   **Backend**: FastAPI, Python, SQLAlchemy
*   **Database**: SQLite (for MVP)

## Project Structure
*   `frontend/`: React Vite application with a glassmorphism dark-mode UI.
*   `backend/`: FastAPI application with a modular router structure.

## Quick Start

### 1. Backend Setup
```bash
cd backend
python -m venv venv
# On Windows: venv\Scripts\activate
# On Mac/Linux: source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```
The API will be available at http://localhost:8000. Check http://localhost:8000/docs for Swagger UI.

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
The App will be available at http://localhost:5173.

## Features
*   **AI Daily Briefing**: Get an overview of your most important tasks and meetings.
*   **Burnout Detection**: Monitors workload intensity and suggests recovery periods.
*   **AI Planner**: Uses natural language to extract tasks and build a schedule.
*   **Focus Timeline**: A clear visual timeline of your day.
