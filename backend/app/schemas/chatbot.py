from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from ..models.chatbot import ChatbotType


# Chatbot Schemas
class ChatbotBase(BaseModel):
    name: str
    description: Optional[str] = None
    chatbot_type: ChatbotType
    personality: Optional[str] = None
    knowledge_areas: Optional[List[str]] = None
    instruction_prompt: Optional[str] = None
    ai_provider: Optional[str] = "ollama"
    model_name: Optional[str] = "qwen2.5:latest"
    temperature: Optional[int] = Field(default=70, ge=0, le=100)
    is_public: Optional[bool] = False


class ChatbotCreate(ChatbotBase):
    pass


class ChatbotUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    personality: Optional[str] = None
    knowledge_areas: Optional[List[str]] = None
    instruction_prompt: Optional[str] = None
    ai_provider: Optional[str] = None
    model_name: Optional[str] = None
    temperature: Optional[int] = Field(None, ge=0, le=100)
    is_active: Optional[bool] = None
    is_public: Optional[bool] = None


class ChatbotResponse(ChatbotBase):
    id: int
    creator_id: int
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


# Chat Message Schemas
class ChatMessageCreate(BaseModel):
    content: str


class ChatMessageResponse(BaseModel):
    id: int
    content: str
    role: str
    created_at: datetime

    class Config:
        from_attributes = True


# Conversation Schemas
class ChatConversationResponse(BaseModel):
    id: int
    title: Optional[str]
    chatbot_id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime]
    messages: List[ChatMessageResponse] = []

    class Config:
        from_attributes = True


class ChatRequest(BaseModel):
    message: str
    conversation_id: Optional[int] = None


class ChatResponse(BaseModel):
    message: str
    conversation_id: int
    chatbot_id: int
