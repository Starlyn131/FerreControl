@echo off
echo Deteniendo FerreControl...

REM Detener procesos en puerto 3001 (Backend)
for /f "tokens=5" %%a in ('netstat -aon | findstr ":3001"') do (
  taskkill /f /pid %%a >nul 2>&1
)

REM Detener procesos en puerto 5173 (Frontend)
for /f "tokens=5" %%a in ('netstat -aon | findstr ":5173"') do (
  taskkill /f /pid %%a >nul 2>&1
)

echo.
echo FerreControl detenido.
echo Los datos siguen guardados en: ferrecontrol-backend\ferrecontrol.json
echo.
pause
