@echo off
echo ===================================
echo Configuracion Inicial
echo ===================================

REM Crear archivos .env si no existen
if not exist backend\.env (
    echo Creando backend\.env...
    copy backend\.env.example backend\.env
    echo [OK] Archivo creado. Por favor edita backend\.env con tus configuraciones
)

if not exist frontend\.env (
    echo Creando frontend\.env...
    copy frontend\.env.example frontend\.env
    echo [OK] Archivo creado
)

REM Instalar dependencias del backend
echo.
echo Instalando dependencias del backend...
cd backend
pip install -r requirements.txt
cd ..

REM Instalar dependencias del frontend
echo.
echo Instalando dependencias del frontend...
cd frontend
call npm install
cd ..

REM Verificar PostgreSQL
echo.
echo Verificando PostgreSQL...
psql --version >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] PostgreSQL encontrado

    REM Intentar crear base de datos
    createdb plataforma_educativa >nul 2>&1
    if %errorlevel% equ 0 (
        echo [OK] Base de datos creada
    ) else (
        echo [!] Base de datos ya existe o no se pudo crear
    )
) else (
    echo [!] PostgreSQL no encontrado. Instalalo o usa Docker
)

REM Verificar Ollama
echo.
echo Verificando Ollama...
curl -s http://localhost:11434/api/version >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Ollama esta corriendo
    echo.
    echo Modelos disponibles:
    ollama list
) else (
    echo [!] Ollama no esta corriendo o no esta instalado
    echo   Instala desde: https://ollama.ai
)

echo.
echo ===================================
echo Configuracion completada
echo ===================================
echo.
echo Proximos pasos:
echo 1. Edita backend\.env con tus configuraciones
echo 2. Ejecuta: scripts\start.bat
echo 3. Abre http://localhost:3000

pause
