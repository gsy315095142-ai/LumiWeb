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
echo  portal              !START_URL!
echo  LumiMagic S1        http://127.0.0.1:!PORT!/WebProjects/LumiMagic_Season_01/LumiMagic_Season_01.html
echo  LumiSport           http://127.0.0.1:!PORT!/WebProjects/LumiSport/LumiSport.html
echo  mock guessing 0618  http://127.0.0.1:!PORT!/WebProjects/LumiSport/showcase/events/mock-guessing-20260618/mock-guessing-20260618.html
echo  control center      http://127.0.0.1:!PORT!/WebProjects/LumiSport/docs/control-center/control-center.html
echo  LumiMagic S2        http://127.0.0.1:!PORT!/WebProjects/LumiMagic_Season_02/LumiMagic_Season_02.html
echo.
echo  Ctrl+C to stop
echo.

set SERVER_CMD=
python --version >nul 2>&1
if !errorlevel!==0 (
  set SERVER_CMD=python -m http.server !PORT!
  goto :start_server
)

py --version >nul 2>&1
if !errorlevel!==0 (
  set SERVER_CMD=py -m http.server !PORT!
  goto :start_server
)

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0serve.ps1" -Port !PORT! -OpenBrowser
goto :end

:start_server
start "LumiWeb Server" /min cmd /c "!SERVER_CMD!"

set /a WAIT_COUNT=0
:wait_ready
netstat -ano | findstr ":!PORT! " | findstr LISTENING >nul 2>&1
if !errorlevel!==0 goto :open_browser
set /a WAIT_COUNT+=1
if !WAIT_COUNT! GEQ 20 (
  echo ERROR: Server did not start within 20 seconds.
  pause
  exit /b 1
)
ping 127.0.0.1 -n 2 >nul
goto :wait_ready

:open_browser
start "" "!START_URL!"
echo Browser opened. Server is running in the background window.
echo Close that window or press Ctrl+C there to stop.
pause

:end
endlocal
