@echo off
echo FocusFlow AI baslatiliyor...
start "FocusFlow Backend" cmd /k "cd /d "%~dp0backend" && venv\Scripts\python.exe -m uvicorn main:app --reload"
start "FocusFlow Frontend" cmd /k "cd /d "%~dp0frontend" && node node_modules/.bin/vite"
echo.
echo Backend : http://localhost:8000
echo Frontend : http://localhost:5173
echo Swagger  : http://localhost:8000/docs
