@echo off
title Water Treatment Plant Asupini Ella - Data System
color 1F

echo ================================================
echo  Water Treatment Plant Asupini Ella
echo  Water Quality Data System
echo ================================================
echo.
echo  Starting backend server (port 3001)...
echo  Starting frontend app (port 5174)...
echo.
echo  Once started, open your browser and go to:
echo  http://localhost:5174
echo.
echo  Press CTRL+C to stop the application.
echo ================================================
echo.

:: Start the backend server in background
cd /d "%~dp0server"
start "WQ-Backend" /MIN cmd /c "node server.js"

:: Small delay to let backend start
timeout /t 2 /nobreak > nul

:: Start frontend
cd /d "%~dp0client"
start "WQ-Frontend" /MIN cmd /c "npx vite --port 5174"

:: Open the browser after a short delay
timeout /t 4 /nobreak > nul
start http://localhost:5174

echo  App is running! Browser should open automatically.
echo  If browser didn't open, manually go to: http://localhost:5174
echo.
pause
