@echo off
title OpenManus GUI - One-Click Setup
color 0B

echo ===================================================
echo  OpenManus GUI - Setup Wizard
echo ===================================================
echo.

rem ----- Check if running as administrator -----
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo WARNING: This script is not running as administrator.
    echo Some operations might fail if admin rights are required.
    echo.
    timeout /t 3 >nul
)

rem ----- Check Python version -----
echo Checking Python installation...
where python >nul 2>&1
if %errorLevel% neq 0 (
    color 0C
    echo [ERROR] Python not found in PATH!
    echo.
    echo Please install Python 3.9 or newer from:
    echo https://www.python.org/downloads/
    echo.
    echo Make sure to check "Add Python to PATH" during installation.
    echo.
    pause
    exit /b 1
)

python -c "import sys; print('Python version: ' + sys.version); sys.exit(0 if sys.version_info >= (3,9) else 1)" >nul 2>&1
if %errorLevel% neq 0 (
    color 0C
    echo [ERROR] Python version is too old!
    echo.
    echo OpenManus requires Python 3.9 or newer.
    echo Please upgrade your Python installation.
    echo.
    pause
    exit /b 1
)

echo Python installation verified.
echo.

rem ----- Check OpenManus repository -----
echo Checking OpenManus repository...
if not exist ..\OpenManus\run_mcp.py (
    color 0E
    echo [WARNING] OpenManus repository not found in expected location!
    echo.
    echo Expected path: ..\OpenManus
    echo.
    echo Please make sure you have:
    echo 1. Cloned the OpenManus repository from GitHub:
    echo    git clone https://github.com/FoundationAgents/OpenManus.git
    echo 2. Placed it as a sibling folder to OpenManusGUI
    echo.
    choice /C YN /M "Do you want to continue anyway"
    if !errorlevel! equ 2 exit /b 1
    echo.
)

rem ----- Create virtual environment -----
echo Creating Python virtual environment...
if exist .venv (
    echo Virtual environment already exists. Reusing it.
) else (
    python -m venv .venv
    if %errorLevel% neq 0 (
        color 0C
        echo [ERROR] Failed to create virtual environment!
        echo.
        pause
        exit /b 1
    )
)

rem ----- Activate virtual environment -----
echo Activating virtual environment...
call .venv\Scripts\activate.bat
if %errorLevel% neq 0 (
    color 0C
    echo [ERROR] Failed to activate virtual environment!
    echo.
    pause
    exit /b 1
)

rem ----- Install dependencies -----
echo Upgrading pip...
python -m pip install --upgrade pip

echo Installing GUI dependencies...
pip install -r requirements.txt
if %errorLevel% neq 0 (
    color 0C
    echo [ERROR] Failed to install GUI dependencies!
    echo.
    pause
    exit /b 1
)

echo Installing OpenManus dependencies...
if exist ..\OpenManus\requirements.txt (
    pip install -r ..\OpenManus\requirements.txt
    if %errorLevel% neq 0 (
        color 0E
        echo [WARNING] Some OpenManus dependencies failed to install.
        echo The GUI might still work, but OpenManus functionality could be limited.
        echo.
        timeout /t 3 >nul
    )
) else (
    color 0E
    echo [WARNING] OpenManus requirements.txt not found!
    echo.
    timeout /t 3 >nul
)

rem ----- Create desktop shortcut (optional) -----
echo.
choice /C YN /M "Create desktop shortcut for OpenManus GUI"
if !errorlevel! equ 1 (
    echo Creating desktop shortcut...
    echo @echo off > "%USERPROFILE%\Desktop\OpenManus GUI.bat"
    echo cd /d "%~dp0" >> "%USERPROFILE%\Desktop\OpenManus GUI.bat"
    echo call .venv\Scripts\activate.bat >> "%USERPROFILE%\Desktop\OpenManus GUI.bat"
    echo python gui.py >> "%USERPROFILE%\Desktop\OpenManus GUI.bat"
    echo pause >> "%USERPROFILE%\Desktop\OpenManus GUI.bat"
    echo Shortcut created on your desktop.
)

rem ----- Setup complete -----
color 0A
echo.
echo ===================================================
echo  Setup completed successfully!
echo ===================================================
echo.
echo To launch OpenManus GUI:
echo 1. Open a command prompt in this folder
echo 2. Run:  .venv\Scripts\activate
echo 3. Run:  python gui.py
echo.
echo Or simply double-click the desktop shortcut (if created).
echo.
pause