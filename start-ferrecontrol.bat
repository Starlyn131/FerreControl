@echo off
chcp 65001 >nul
echo Iniciando FerreControl...
echo.

REM Obtener ruta del script
set SCRIPT_DIR=%~dp0
set BACKEND_DIR=%SCRIPT_DIR%ferrecontrol-backend
set FRONTEND_DIR=%SCRIPT_DIR%ferrecontrol-frontend
set DB_FILE=%BACKEND_DIR%\ferrecontrol.json

REM Verificar si existe ferrecontrol.json, si no, crearlo
if not exist "%DB_FILE%" (
  echo Creando archivo de datos...
  echo {"Productos":[],"Ventas":[],"Detalle_Venta":[],"Movimientos_Inventario":[],"Usuarios":[{"id":1,"nombre":"Administrador","email":"admin@ferrecontrol.com","password":"admin123","pin":"1234","rol":"admin"},{"id":2,"nombre":"Jefe/Gerente","email":"gerente@ferrecontrol.com","password":"gerente123","pin":"2345","rol":"gerente"},{"id":3,"nombre":"Vendedor","email":"vendedor@ferrecontrol.com","password":"vendedor123","pin":"3456","rol":"vendedor"}],"nextIds":{"productos":1,"ventas":1,"detalle":1,"movimientos":1,"usuarios":4}} > "%DB_FILE%"
)

REM Iniciar Backend
echo Iniciando Backend...
start "Backend FerreControl" cmd /k "cd /d "%BACKEND_DIR%" && node server.js"

REM Esperar 3 segundos
timeout /t 3 >nul

REM Iniciar Frontend
echo Iniciando Frontend...
start "Frontend FerreControl" cmd /k "cd /d "%FRONTEND_DIR%" && npm.cmd run dev"

echo.
echo ==============================================
echo  FerreControl iniciado!
echo ==============================================
echo.
echo Acceso local: http://localhost:5173
echo Red local: http://10.0.0.6:5173
echo.
echo Backend: http://localhost:3001
echo.
pause
