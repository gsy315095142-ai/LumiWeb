@echo off
setlocal enabledelayedexpansion
cd /d "%~dp0"

set PORT=
for /L %%P in (8080,1,8099) do (
  netstat -ano | findstr ":%%P " | findstr LISTENING >nul 2>&1
  if errorlevel 1 (
    set PORT=%%P
    goto :found
  )
)

echo ERROR: No free port in range 8080-8099.
pause
exit /b 1

:found
set START_URL=http://127.0.0.1:!PORT!/index.html

echo.
echo  LumiWeb local HTTP server
echo  Root: %cd%
echo  Port: !PORT!
echo  URL:  http://127.0.0.1:!PORT!/
echo.
echo  portal           !START_URL!
echo  lumi-sport       http://127.0.0.1:!PORT!/WebProjects/lumi-sport.html
echo  control center   http://127.0.0.1:!PORT!/WebProjects/LumiSportWeb/web/index.html
echo  lumi-magic       http://127.0.0.1:!PORT!/WebProjects/lumi-magic.html
echo.
echo  Ctrl+C to stop
echo.

start /min cmd /c "ping 127.0.0.1 -n 2 >nul && start "" "!START_URL!""

where python >nul 2>&1
if !errorlevel!==0 (
  python -m http.server !PORT!
  goto :end
)

where py >nul 2>&1
if !errorlevel!==0 (
  py -m http.server !PORT!
  goto :end
)

echo ERROR: Python not found. Install Python 3 and add it to PATH.
pause

:end
endlocal
