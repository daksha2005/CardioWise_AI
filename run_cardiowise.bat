@echo off
TITLE CardioWise AI - Setup & Run Utility
echo ======================================================
echo           CardioWise AI - Launch Assistant
echo ======================================================
echo.

:: Check for Python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python is not installed or not in PATH.
    echo Please install Python 3.9+ from python.org
    pause
    exit /b
)

:: Check for Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not in PATH.
    echo Please install Node.js from nodejs.org
    pause
    exit /b
)

echo [1/3] Setting up Backend...
cd backend
python -m pip install -r requirements.txt
echo.

echo [2/3] Setting up Frontend...
cd ../frontend
call npm install
echo.

echo [3/3] Launching Services...
echo.
echo Starting Flask API Backend...
start cmd /k "cd ../backend && python app.py"

echo Starting Streamlit Dashboard...
start cmd /k "cd ../backend && streamlit run streamlit_app.py"

echo Starting Premium React Frontend...
start cmd /k "cd ../frontend && npm run dev"

echo ======================================================
echo SUCCESS: All services are launching!
echo.
echo Premium Dashboard: http://localhost:3000
echo Streamlit App:     http://localhost:8501
echo Flask API:         http://localhost:5000
echo ======================================================
pause
