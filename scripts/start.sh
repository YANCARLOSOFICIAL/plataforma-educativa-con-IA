#!/bin/bash

echo "==================================="
echo "Iniciando Plataforma Educativa"
echo "==================================="

# Verificar si Docker está disponible
if command -v docker-compose &> /dev/null; then
    echo "Iniciando con Docker Compose..."
    docker-compose up -d
    echo ""
    echo "✓ Servicios iniciados"
    echo "  - Frontend: http://localhost:3000"
    echo "  - Backend: http://localhost:8000"
    echo "  - API Docs: http://localhost:8000/docs"
    echo ""
    echo "Para ver los logs: docker-compose logs -f"
    echo "Para detener: docker-compose down"
else
    echo "Docker no disponible. Iniciando manualmente..."

    # Iniciar backend
    echo "Iniciando backend..."
    cd backend
    uvicorn app.main:app --reload &
    BACKEND_PID=$!
    cd ..

    # Iniciar frontend
    echo "Iniciando frontend..."
    cd frontend
    npm run dev &
    FRONTEND_PID=$!
    cd ..

    echo ""
    echo "✓ Servicios iniciados"
    echo "  - Frontend: http://localhost:3000"
    echo "  - Backend: http://localhost:8000"
    echo ""
    echo "PIDs: Backend=$BACKEND_PID, Frontend=$FRONTEND_PID"
    echo "Para detener: kill $BACKEND_PID $FRONTEND_PID"
fi
