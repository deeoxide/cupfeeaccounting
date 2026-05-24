@echo off
title SME Cloud Accounting Launcher
echo Starting SME Cloud Accounting Server...
cd /d "%~dp0"
start /b cmd.exe /c "npm start"
echo Waiting for server to initialize...
timeout /t 5 /nobreak > nul
echo Opening browser...
start http://localhost:3000
echo.
echo Server is running in the background. 
echo Do not close this window if you want the server to keep running.
pause
