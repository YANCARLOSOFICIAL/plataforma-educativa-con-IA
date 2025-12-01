from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from ..database import Base


class SystemConfig(Base):
    """
    Tabla para almacenar configuraciones globales del sistema.
    Solo debe haber una fila en esta tabla.
    """
    __tablename__ = "system_config"

    id = Column(Integer, primary_key=True, index=True)

    # Configuración del proveedor de IA por defecto
    default_ai_provider = Column(String, nullable=False, default="ollama")  # ollama, openai, gemini
    default_model_name = Column(String, nullable=False, default="qwen3:4b")

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
