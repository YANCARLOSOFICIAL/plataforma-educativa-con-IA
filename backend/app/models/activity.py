from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, Enum, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from ..database import Base


class ActivityType(str, enum.Enum):
    EXAM = "exam"
    SUMMARY = "summary"
    CLASS_ACTIVITY = "class_activity"
    RUBRIC = "rubric"
    WRITING_CORRECTION = "writing_correction"
    SLIDES = "slides"
    EMAIL = "email"
    SURVEY = "survey"
    CHATBOT = "chatbot"
    STORY = "story"
    CROSSWORD = "crossword"
    WORD_SEARCH = "word_search"


class AIProvider(str, enum.Enum):
    OLLAMA = "ollama"
    OPENAI = "openai"
    GEMINI = "gemini"


class Activity(Base):
    __tablename__ = "activities"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text)
    activity_type = Column(Enum(ActivityType), nullable=False)
    content = Column(JSON)  # Almacena el contenido generado en formato JSON

    # Metadata
    subject = Column(String)  # Área/materia
    grade_level = Column(String)  # Nivel/semestre

    # Privacy
    is_public = Column(Boolean, default=False)

    # AI Info
    ai_provider = Column(Enum(AIProvider))
    model_used = Column(String)
    credits_used = Column(Integer, default=0)

    # Relations
    creator_id = Column(Integer, ForeignKey("users.id"))
    creator = relationship("User", back_populates="activities")

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
