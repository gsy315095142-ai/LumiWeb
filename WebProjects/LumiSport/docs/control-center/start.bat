@echo off
chcp 65001 >nul 2>&1
title LumiSport Control Center

echo.
echo  ========================================
echo    LumiSport Control Center
echo    Local:   http://localhost:8090/control-center.html
echo    LAN:     http://0.0.0.0:8090/control-center.html
echo  ========================================
echo.

cd /d "%~dp0"

for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4"') do (
    for /f "tokens=1" %%b in ("%%a") do (
        echo   LAN Access: http://%%b:8090/control-center.html
    )
)

echo.

where python >nul 2>&1
if %errorlevel%==0 (
    echo [Python] Starting local server...
    echo Press Ctrl+C to stop.
    echo.
    start "" "http://localhost:8090/control-center.html"
    python -m http.server 8090 --bind 0.0.0.0
    goto :eof
)

where python3 >nul 2>&1
if %errorlevel%==0 (
    echo [Python3] Starting local server...
    echo Press Ctrl+C to stop.
    echo.
    start "" "http://localhost:8090/control-center.html"
    python3 -m http.server 8090 --bind 0.0.0.0
    goto :eof
)

where npx >nul 2>&1
if %errorlevel%==0 (
    echo [Node.js] Starting local server...
    echo Press Ctrl+C to stop.
    echo.
    start "" "http://localhost:8090/control-center.html"
    npx -y http-server -p 8090 -c-1 --cors -a 0.0.0.0
    goto :eof
)

echo [ERROR] Python or Node.js not found.
echo.
echo Please install one of the following:
echo   - Python 3:  https://www.python.org/downloads/
echo   - Node.js:   https://nodejs.org/
echo.
pause
