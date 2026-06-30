@echo off
cd /d "%~dp0"

title LumiSport LAN Server

set "PYEXE="
where py >nul 2>&1
if %errorlevel% equ 0 (
  for /f "delims=" %%i in ('py -3 -c "import sys; print(sys.executable)" 2^>nul') do (
    set "PYEXE=%%i"
    goto :run
  )
)

for /f "delims=" %%i in ('where python 2^>nul') do (
  echo %%i | findstr /i "WindowsApps" >nul
  if errorlevel 1 (
    set "PYEXE=%%i"
    goto :run
  )
)

where powershell >nul 2>&1
if %errorlevel% equ 0 (
  powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\serve.ps1"
  goto :done
)

echo.
echo [ERROR] Cannot start server. Install Python 3 from https://www.python.org/
echo         Check "Add python.exe to PATH" during setup.
echo.
goto :done

:run
"%PYEXE%" "%~dp0scripts\serve.py"
goto :done

:done
echo.
pause
