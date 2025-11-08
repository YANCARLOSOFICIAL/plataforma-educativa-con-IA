from pydantic import BaseModel, field_validator
from typing import Optional, Dict, Any
from datetime import datetime
from ..models.activity import ActivityType, AIProvider


class ActivityBase(BaseModel):
    title: str
    description: Optional[str] = None
    activity_type: ActivityType
    subject: Optional[str] = None
    grade_level: Optional[str] = None
    is_public: bool = False


class ActivityCreate(ActivityBase):
    content: Dict[str, Any]
    ai_provider: AIProvider
    model_used: Optional[str] = None


class ActivityUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    is_public: Optional[bool] = None


class ActivityResponse(ActivityBase):
    id: int
    content: Dict[str, Any]
    ai_provider: Optional[AIProvider] = None
    model_used: Optional[str] = None
    credits_used: int
    creator_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

    @field_validator("content", mode="before")
    def _parse_content(cls, v):
        """Allow content to be stored as a JSON string in the DB and parse it to a dict

        Some DB backends or legacy rows may return the JSON column as a string. When that
        happens pydantic expects a dict but receives a str, producing the ValidationError
        seen in the logs. This validator attempts to json.loads the string before
        regular validation.
        """
        if isinstance(v, str):
            try:
                import json

                return json.loads(v)
            except Exception:
                # If parsing fails, return original value and let pydantic raise a helpful error
                return v
        return v


# Schemas específicos para generación de contenido
class ExamRequest(BaseModel):
    topic: str
    num_questions: int = 10
    question_types: list[str] = ["multiple_choice", "true_false", "short_answer"]
    grade_level: Optional[str] = None
    ai_provider: AIProvider = AIProvider.OLLAMA
    model_name: Optional[str] = None


class SummaryRequest(BaseModel):
    text: str
    length: str = "medium"  # short, medium, long
    ai_provider: AIProvider = AIProvider.OLLAMA
    model_name: Optional[str] = None


class ClassActivityRequest(BaseModel):
    topic: str
    duration_minutes: int
    grade_level: str
    objectives: list[str]
    ai_provider: AIProvider = AIProvider.OLLAMA
    model_name: Optional[str] = None


class RubricRequest(BaseModel):
    topic: str
    career: str
    semester: str
    objectives: list[str]
    criteria: list[str]
    ai_provider: AIProvider = AIProvider.OLLAMA
    model_name: Optional[str] = None


class WritingCorrectionRequest(BaseModel):
    text: str
    ai_provider: AIProvider = AIProvider.OLLAMA
    model_name: Optional[str] = None


class SlidesRequest(BaseModel):
    topic: str
    num_slides: int = 10
    grade_level: Optional[str] = None
    ai_provider: AIProvider = AIProvider.OLLAMA
    model_name: Optional[str] = None


class EmailRequest(BaseModel):
    purpose: str
    recipient_type: str
    tone: str = "formal"
    ai_provider: AIProvider = AIProvider.OLLAMA
    model_name: Optional[str] = None


class SurveyRequest(BaseModel):
    topic: str
    num_questions: int = 10
    question_types: list[str] = ["multiple_choice", "scale", "open"]
    ai_provider: AIProvider = AIProvider.OLLAMA
    model_name: Optional[str] = None


class StoryRequest(BaseModel):
    theme: str
    story_type: str = "cuento"  # cuento, fabula, aventura
    characters: list[str]
    moral: Optional[str] = None
    ai_provider: AIProvider = AIProvider.OLLAMA
    model_name: Optional[str] = None


class CrosswordRequest(BaseModel):
    topic: str
    num_words: int = 15
    difficulty: str = "medium"
    ai_provider: AIProvider = AIProvider.OLLAMA
    model_name: Optional[str] = None


class WordSearchRequest(BaseModel):
    topic: str
    num_words: int = 15
    grid_size: int = 15
    ai_provider: AIProvider = AIProvider.OLLAMA
    model_name: Optional[str] = None
