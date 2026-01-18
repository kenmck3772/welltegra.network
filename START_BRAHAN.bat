@echo off
REM Brahan Terminal Quick Start Script (Windows)
REM This script sets up and launches the Brahan Personal Terminal

echo.
echo ============================================
echo   BRAHAN PERSONAL TERMINAL - LAUNCHER
echo ============================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed.
    echo Please install Python 3.8 or higher from https://www.python.org/downloads/
    pause
    exit /b 1
)

echo Python found
python --version
echo.

REM Check if virtual environment exists, create if not
if not exist "venv_brahan\" (
    echo Creating virtual environment...
    python -m venv venv_brahan
    echo Virtual environment created
    echo.
)

REM Activate virtual environment
echo Activating virtual environment...
call venv_brahan\Scripts\activate.bat

REM Install/upgrade dependencies
echo Installing dependencies...
pip install -q --upgrade pip
pip install -q -r requirements_brahan.txt

echo All dependencies installed
echo.

REM Launch dashboard
echo Launching Brahan Terminal...
echo.
echo ============================================
echo   Dashboard will open in your browser
echo   URL: http://localhost:8501
echo.
echo   Press Ctrl+C to stop the server
echo ============================================
echo.

streamlit run brahan_terminal.py
