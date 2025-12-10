from sqlalchemy import Column, Integer, ForeignKey, DateTime, Table
from sqlalchemy.sql import func
from ..database import Base

# Tabla de asociación entre cursos y chatbots
course_chatbots = Table(
    'course_chatbots',
    Base.metadata,
    Column('course_id', Integer, ForeignKey('courses.id', ondelete='CASCADE'), primary_key=True),
    Column('chatbot_id', Integer, ForeignKey('chatbots.id', ondelete='CASCADE'), primary_key=True),
    Column('added_at', DateTime(timezone=True), server_default=func.now())
)
