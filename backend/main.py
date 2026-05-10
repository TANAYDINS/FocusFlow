from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import tasks, ai, schedule, briefing, analytics
from app.database import engine, Base

Base.metadata.create_all(bind=engine)

app = FastAPI(title="FocusFlow AI", description="AI-powered productivity assistant platform", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(tasks.router, prefix="/tasks", tags=["Tasks"])
app.include_router(ai.router, prefix="/ai", tags=["AI"])
app.include_router(schedule.router, prefix="/schedule", tags=["Schedule"])
app.include_router(briefing.router, prefix="/briefing", tags=["Briefing"])
app.include_router(analytics.router, prefix="/analytics", tags=["Analytics"])

@app.get("/")
def root():
    return {"message": "FocusFlow AI API is running"}
