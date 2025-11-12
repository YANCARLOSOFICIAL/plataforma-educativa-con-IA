from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, Enum, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from ..database import Base


class ChatbotType(str, enum.Enum):
    MATH = "math"
    LANGUAGE = "language"
    SCIENCE = "science"
    LITERATURE = "literature"
    PROGRAMMING = "programming"
    WELLNESS = "wellness"
    CUSTOM = "custom"


class Chatbot(Base):
    __tablename__ = "chatbots"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text)
    chatbot_type = Column(Enum(ChatbotType), nullable=False)

    # Configuration
    personality = Column(Text)  # Descripción de la personalidad del chatbot
    knowledge_areas = Column(JSON)  # Lista de áreas de conocimiento
    instruction_prompt = Column(Text)  # Prompt de instrucciones para el chatbot

    # AI Configuration
    ai_provider = Column(String)  # ollama, openai, gemini
    model_name = Column(String)  # Modelo específico a usar
    temperature = Column(Integer, default=70)  # 0-100, mayor = más creativo

    # Settings
    is_active = Column(Boolean, default=True)
    is_public = Column(Boolean, default=False)

    # Relations
    creator_id = Column(Integer, ForeignKey("users.id"))
    creator = relationship("User", back_populates="chatbots")

    # Conversations
    conversations = relationship("ChatConversation", back_populates="chatbot", cascade="all, delete-orphan")

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class ChatConversation(Base):
    __tablename__ = "chat_conversations"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)  # Título generado de la conversación

    # Relations
    chatbot_id = Column(Integer, ForeignKey("chatbots.id"))
    chatbot = relationship("Chatbot", back_populates="conversations")

    user_id = Column(Integer, ForeignKey("users.id"))
    user = relationship("User", back_populates="chat_conversations")

    # Messages
    messages = relationship("ChatMessage", back_populates="conversation", cascade="all, delete-orphan")

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    content = Column(Text, nullable=False)
    role = Column(String, nullable=False)  # 'user' o 'assistant'

    # Relations
    conversation_id = Column(Integer, ForeignKey("chat_conversations.id"))
    conversation = relationship("ChatConversation", back_populates="messages")

    # Timestamp
    created_at = Column(DateTime(timezone=True), server_default=func.now())
