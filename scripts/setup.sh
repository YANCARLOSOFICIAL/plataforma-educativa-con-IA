#!/bin/bash

echo "==================================="
echo "Configuración Inicial"
echo "==================================="

# Crear archivos .env si no existen
if [ ! -f backend/.env ]; then
    echo "Creando backend/.env..."
    cp backend/.env.example backend/.env
    echo "✓ Archivo creado. Por favor edita backend/.env con tus configuraciones"
fi

if [ ! -f frontend/.env ]; then
    echo "Creando frontend/.env..."
    cp frontend/.env.example frontend/.env
    echo "✓ Archivo creado"
fi

# Instalar dependencias del backend
echo ""
echo "Instalando dependencias del backend..."
cd backend
pip install -r requirements.txt
cd ..

# Instalar dependencias del frontend
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
    echo "  Instala desde: https://ollama.ai"
fi

echo ""
echo "==================================="
echo "Configuración completada"
echo "==================================="
echo ""
echo "Próximos pasos:"
echo "1. Edita backend/.env con tus configuraciones"
echo "2. Ejecuta: ./scripts/start.sh"
echo "3. Abre http://localhost:3000"
