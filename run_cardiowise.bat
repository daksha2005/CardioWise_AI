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

echo [1/3] Checking Backend Environment...
cd backend
if not exist "venv" (
    echo [INFO] No virtual environment found. Installing dependencies to global/user python...
    python -m pip install -r requirements.txt
) else (
    echo [INFO] Virtual environment detected.
    call venv\Scripts\activate
    python -m pip install -r requirements.txt
)
echo.

echo [2/3] Checking Frontend Environment...
cd ../frontend
if not exist "node_modules" (
    echo [INFO] node_modules not found. Running npm install (this may take a few minutes)...
    call npm install
) else (
    echo [INFO] node_modules detected. Skipping full install.
)
echo.

echo [3/3] Launching CardioWise AI Services...
echo.

echo [API] Starting Flask Backend...
start "CardioWise API" cmd /k "cd ../backend && python app.py"

echo [UI] Starting Streamlit Research Dashboard...
start "CardioWise Research UI" cmd /k "cd ../backend && streamlit run streamlit_app.py"

echo [WEB] Starting Premium React Dashboard...
start "CardioWise Web Dashboard" cmd /k "cd ../frontend && npm start"

echo ======================================================
echo SUCCESS: Launching all services!
echo.
echo Live Platform:     https://cardiowiseai-cq3k7spfk5ukanev47pghf.streamlit.app/
echo Local Dashboard:   http://localhost:3000
echo Streamlit App:     http://localhost:8501 (Local)
echo Flask API:         http://localhost:5000
echo ======================================================
echo Please wait for the browser windows to open automatically.
pause
