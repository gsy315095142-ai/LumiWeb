@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion
cd /d "%~dp0"

echo ============================================
echo   Lumi 竞猜海报 - 一键出图
echo ============================================
echo.

REM ---- 1. 定位 Node ----
set "NODE_EXE=node"
where node >nul 2>nul
if errorlevel 1 (
  if exist "C:\nvm4w\nodejs\node.exe" (
    set "NODE_EXE=C:\nvm4w\nodejs\node.exe"
  ) else (
    echo [错误] 未找到 Node.js，请先安装 Node.js。
    pause
    exit /b 1
  )
)

REM ---- 2. 定位 npm ----
set "NPM_CMD=npm"
where npm >nul 2>nul
if errorlevel 1 (
  if exist "C:\nvm4w\nodejs\npm.cmd" set "NPM_CMD=C:\nvm4w\nodejs\npm.cmd"
)

REM ---- 3. 定位 Chrome / Edge ----
set "CHROME_PATH="
if exist "%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe" set "CHROME_PATH=%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe"
if not defined CHROME_PATH if exist "C:\Program Files\Google\Chrome\Application\chrome.exe" set "CHROME_PATH=C:\Program Files\Google\Chrome\Application\chrome.exe"
if not defined CHROME_PATH if exist "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" set "CHROME_PATH=C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"
if not defined CHROME_PATH if exist "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" set "CHROME_PATH=C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
if not defined CHROME_PATH if exist "C:\Program Files\Microsoft\Edge\Application\msedge.exe" set "CHROME_PATH=C:\Program Files\Microsoft\Edge\Application\msedge.exe"
if not defined CHROME_PATH (
  echo [错误] 未找到 Chrome 或 Edge 浏览器。
  pause
  exit /b 1
)
echo 使用浏览器: %CHROME_PATH%

REM ---- 4. 首次运行自动安装依赖 ----
if not exist "tools\node_modules\puppeteer-core" (
  echo.
  echo 首次运行，正在安装依赖 puppeteer-core ...
  pushd tools
  call "%NPM_CMD%" install --no-audit --no-fund
  popd
  echo 依赖安装完成。
)

REM ---- 5. 构造 file:// 地址 ----
set "HTML_PATH=%~dp0poster.html"
set "HTML_URL=file:///!HTML_PATH:\=/!?v=%RANDOM%"
set "OUT_PNG=%~dp0poster-long.png"

echo.
echo 正在渲染长图，请稍候...
"%NODE_EXE%" "tools\render.js" "!HTML_URL!" "!OUT_PNG!" 480 3
if errorlevel 1 (
  echo.
  echo [失败] 出图过程出错，请查看上方报错信息。
  pause
  exit /b 1
)

echo.
echo ============================================
echo   出图完成: poster-long.png
echo ============================================
start "" "!OUT_PNG!"
ping -n 2 127.0.0.1 >nul
endlocal
