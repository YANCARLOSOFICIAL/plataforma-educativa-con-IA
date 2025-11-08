@echo off
echo ===================================
echo Configuracion para Python 3.13
echo ===================================

REM Verificar version de Python
python --version
echo.

REM Actualizar pip
echo Actualizando pip, setuptools y wheel...
python -m pip install --upgrade pip setuptools wheel
echo.

REM Crear archivos .env
if not exist backend\.env (
    echo Creando backend\.env...
    copy backend\.env.example backend\.env
    echo [OK] Edita backend\.env con tu configuracion
)

if not exist frontend\.env (
    echo Creando frontend\.env...
    copy frontend\.env.example frontend\.env
    echo [OK] Archivo creado
)

REM Preguntar que instalar
echo.
echo Que version deseas instalar?
echo 1. Minimal (solo Ollama) - Recomendado
echo 2. Completa (con OpenAI y Gemini)
echo.
set /p choice="Elige una opcion (1 o 2): "

echo.
if "%choice%"=="1" (
    echo Instalando version minimal solo para Ollama...
    cd backend
    pip install -r requirements-minimal.txt --user
    cd ..
) else if "%choice%"=="2" (
    echo Instalando version completa...
    cd backend
    pip install -r requirements-py313.txt --user
    cd ..
) else (
    echo Opcion invalida. Instalando version minimal por defecto...
    cd backend
    pip install -r requirements-minimal.txt --user
    cd ..
)

echo.
echo Instalando dependencias del frontend...
cd frontend
call npm install
cd ..

echo.
echo ===================================
echo Configuracion completada
echo ===================================
echo.
echo Proximos pasos:
echo 1. Edita backend\.env con tu configuracion
echo 2. Asegurate de que PostgreSQL este corriendo
echo 3. Asegurate de que Ollama este corriendo: ollama serve
echo 4. Ejecuta: scripts\start.bat
echo.
echo Para verificar Ollama: curl http://localhost:11434/api/version
echo Para ver tus modelos: ollama list
echo.

pause
