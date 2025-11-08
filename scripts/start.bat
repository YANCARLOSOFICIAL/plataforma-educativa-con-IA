@echo off
echo ===================================
echo Iniciando Plataforma Educativa
echo ===================================

REM Verificar si Docker está disponible
docker-compose --version >nul 2>&1
if %errorlevel% equ 0 (
    echo Iniciando con Docker Compose...
    docker-compose up -d
    echo.
    echo [OK] Servicios iniciados
    echo   - Frontend: http://localhost:3000
    echo   - Backend: http://localhost:8000
    echo   - API Docs: http://localhost:8000/docs
    echo.
    echo Para ver los logs: docker-compose logs -f
    echo Para detener: docker-compose down
) else (
    echo Docker no disponible. Iniciando manualmente...

    REM Iniciar backend
    echo Iniciando backend...
    start "Backend" cmd /c "cd backend && uvicorn app.main:app --reload"

    REM Esperar un momento
    timeout /t 3 /nobreak >nul

    REM Iniciar frontend
    echo Iniciando frontend...
    start "Frontend" cmd /c "cd frontend && npm run dev"

    echo.
    echo [OK] Servicios iniciados
    echo   - Frontend: http://localhost:3000
    echo   - Backend: http://localhost:8000
    echo.
)

pause
