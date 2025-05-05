@echo off
title OpenManus GUI - Build Script
color 0B

echo ===================================================
echo  OpenManus GUI - Build Script
echo ===================================================
echo.

rem ----- Check if running in virtual environment -----
python -c "import sys; print('VIRTUAL_ENV' in os.environ)" 2>nul | findstr "True" >nul
if %errorLevel% neq 0 (
    color 0E
    echo [WARNING] Not running in a virtual environment!
    echo It's recommended to run this script from within the virtual environment.
    echo.
    echo Run '.venv\Scripts\activate' first, then run this script again.
    echo.
    choice /C YN /M "Continue anyway"
    if !errorlevel! equ 2 exit /b 1
    echo.
)

rem ----- Install PyInstaller if needed -----
echo Checking for PyInstaller...
python -c "import PyInstaller" 2>nul
if %errorLevel% neq 0 (
    echo PyInstaller not found. Installing...
    pip install pyinstaller
    if %errorLevel% neq 0 (
        color 0C
        echo [ERROR] Failed to install PyInstaller!
        echo.
        pause
        exit /b 1
    )
)

rem ----- Check OpenManus repository -----
echo Checking OpenManus repository...
if not exist ..\OpenManus\run_mcp.py (
    color 0E
    echo [WARNING] OpenManus repository not found in expected location!
    echo.
    echo Expected path: ..\OpenManus
    echo.
    echo The executable will be built, but it may not work correctly
    echo without the OpenManus files.
    echo.
    choice /C YN /M "Continue anyway"
    if !errorlevel! equ 2 exit /b 1
    echo.
)

rem ----- Clean previous build -----
echo Cleaning previous build...
if exist build rmdir /s /q build
if exist dist rmdir /s /q dist
if exist *.spec del *.spec

rem ----- Build with PyInstaller -----
echo Building executable with PyInstaller...
echo This may take a few minutes...
echo.

pyinstaller --clean ^
    --onefile ^
    --noconsole ^
    --name openmanus_gui ^
    --add-data "..\OpenManus;openmanus" ^
    gui.py

if %errorLevel% neq 0 (
    color 0C
    echo [ERROR] PyInstaller build failed!
    echo.
    pause
    exit /b 1
)

rem ----- Verify build -----
if not exist dist\openmanus_gui.exe (
    color 0C
    echo [ERROR] Build completed but executable not found!
    echo.
    pause
    exit /b 1
)

rem ----- Build Inno Setup installer (if available) -----
echo Checking for Inno Setup...
where iscc >nul 2>&1
if %errorLevel% equ 0 (
    echo Building installer with Inno Setup...
    iscc openmanus.iss
    if %errorLevel% neq 0 (
        color 0E
        echo [WARNING] Inno Setup compilation failed.
        echo The executable was built successfully, but the installer creation failed.
        echo.
    ) else (
        echo Installer created successfully: OpenManusGUI_Setup.exe
    )
) else (
    color 0E
    echo [INFO] Inno Setup not found. Skipping installer creation.
    echo.
    echo To create an installer, please install Inno Setup from:
    echo https://jrsoftware.org/isinfo.php
    echo.
    echo Then run: iscc openmanus.iss
    echo.
)

rem ----- Build complete -----
color 0A
echo.
echo ===================================================
echo  Build completed successfully!
echo ===================================================
echo.
echo Executable created: dist\openmanus_gui.exe
echo.
echo You can distribute this executable to users who don't have Python installed.
echo.
pause