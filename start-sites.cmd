@echo off
rem Double-click to run both sites on this PC:
rem   BlueBloodFootball   -> http://localhost:5174
rem   BlueBloodBasketball -> http://localhost:5175
rem Close the two server windows to stop them.
cd /d "%~dp0"
if not exist node_modules (
  echo Installing packages the first time...
  call npm.cmd install
)
start "BlueBloodFootball - localhost:5174" cmd /k npm.cmd run dev -- --port 5174 --strictPort
start "BlueBloodBasketball - localhost:5175" cmd /k npm.cmd run dev:bb -- --port 5175 --strictPort
echo Starting the servers...
timeout /t 10 /nobreak >nul
start "" http://localhost:5174
start "" http://localhost:5175
