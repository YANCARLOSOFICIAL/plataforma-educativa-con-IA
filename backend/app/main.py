from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base, SessionLocal
from .routers import auth_router, activities_router, content_router, export_router, admin_router, chatbot_router
from .models import SystemConfig

# Crear tablas
Base.metadata.create_all(bind=engine)

# Inicializar configuración del sistema
def init_system_config():
    """Inicializa la configuración del sistema si no existe"""
    db = SessionLocal()
    try:
        config = db.query(SystemConfig).first()
        if not config:
            # Crear configuración por defecto: usar Ollama (gratis)
            config = SystemConfig(
                default_ai_provider="ollama",
                default_model_name="qwen3:4b"
            )
            db.add(config)
            db.commit()
            print("✅ Configuración del sistema inicializada: Ollama + qwen3:4b")
    finally:
        db.close()

init_system_config()

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
