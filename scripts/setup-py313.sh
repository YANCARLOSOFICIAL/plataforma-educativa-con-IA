#!/bin/bash

echo "==================================="
echo "Configuración para Python 3.13"
echo "==================================="

# Verificar versión de Python
echo "Versión de Python instalada:"
python --version
echo ""

# Actualizar pip
echo "Actualizando pip, setuptools y wheel..."
python -m pip install --upgrade pip setuptools wheel
echo ""

# Crear archivos .env
if [ ! -f backend/.env ]; then
    echo "Creando backend/.env..."
    cp backend/.env.example backend/.env
    echo "✓ Edita backend/.env con tu configuración"
fi

if [ ! -f frontend/.env ]; then
    echo "Creando frontend/.env..."
    cp frontend/.env.example frontend/.env
    echo "✓ Archivo creado"
fi

# Preguntar qué instalar
echo ""
echo "¿Qué versión deseas instalar?"
echo "1. Minimal (solo Ollama) - Recomendado"
echo "2. Completa (con OpenAI y Gemini)"
echo ""
read -p "Elige una opción (1 o 2): " choice

echo ""
if [ "$choice" == "1" ]; then
    echo "Instalando versión minimal solo para Ollama..."
    cd backend
    pip install -r requirements-minimal.txt --user
    cd ..
elif [ "$choice" == "2" ]; then
    echo "Instalando versión completa..."
    cd backend
    pip install -r requirements-py313.txt --user
    cd ..
else
    echo "Opción inválida. Instalando versión minimal por defecto..."
    cd backend
    pip install -r requirements-minimal.txt --user
    cd ..
fi

echo ""
echo "Instalando dependencias del frontend..."
cd frontend
npm install
cd ..

# Verificar PostgreSQL
echo ""
echo "Verificando PostgreSQL..."
if command -v psql &> /dev/null; then
    echo "✓ PostgreSQL encontrado"

    # Intentar crear base de datos
    createdb plataforma_educativa 2>/dev/null
    if [ $? -eq 0 ]; then
        echo "✓ Base de datos creada"
    else
        echo "⚠ Base de datos ya existe o no se pudo crear"
    fi
else
    echo "⚠ PostgreSQL no encontrado. Instálalo o usa Docker"
fi

# Verificar Ollama
echo ""
echo "Verificando Ollama..."
if curl -s http://localhost:11434/api/version &> /dev/null; then
    echo "✓ Ollama está corriendo"
    echo ""
    echo "Modelos disponibles:"
    ollama list
else
    echo "⚠ Ollama no está corriendo o no está instalado"
    echo "  Para iniciar: ollama serve"
    echo "  Instala desde: https://ollama.ai"
fi

echo ""
echo "==================================="
echo "Configuración completada"
echo "==================================="
echo ""
echo "Próximos pasos:"
echo "1. Edita backend/.env con tu configuración"
echo "2. Asegúrate de que PostgreSQL esté corriendo"
echo "3. Asegúrate de que Ollama esté corriendo: ollama serve"
echo "4. Ejecuta: ./scripts/start.sh"
echo ""
echo "Para verificar Ollama: curl http://localhost:11434/api/version"
echo "Para ver tus modelos: ollama list"
