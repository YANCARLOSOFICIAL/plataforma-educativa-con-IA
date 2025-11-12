from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .routers import auth_router, activities_router, content_router, export_router, admin_router, chatbot_router

# Crear tablas
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Plataforma Educativa API",
    description="API para plataforma educativa con IA (Ollama, OpenAI, Gemini)",
    version="1.0.0"
)

# Configurar CORS - Permitir todas las origins en desarrollo
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permitir todas las origins en desarrollo
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Incluir routers
app.include_router(auth_router)
app.include_router(activities_router)
app.include_router(content_router)
app.include_router(export_router)
app.include_router(admin_router)
app.include_router(chatbot_router)


@app.get("/")
async def root():
    return {
        "message": "Bienvenido a la Plataforma Educativa API",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy"}
