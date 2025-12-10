from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, Table
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database import Base
from .course_chatbot import course_chatbots


class Course(Base):
    """
    Modelo para representar un curso creado por un docente
    """
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    subject = Column(String(100), nullable=True)  # Materia/Área
    grade_level = Column(String(50), nullable=True)  # Nivel/Semestre
    code = Column(String(50), unique=True, index=True, nullable=False)  # Código único del curso
    is_active = Column(Boolean, default=True)  # Si el curso está activo

    # Relación con el docente creador
    teacher_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    teacher = relationship("User", back_populates="courses_created", foreign_keys=[teacher_id])

    # Relaciones
    enrollments = relationship("CourseEnrollment", back_populates="course", cascade="all, delete-orphan")
    course_activities = relationship("CourseActivity", back_populates="course", cascade="all, delete-orphan")
    invitations = relationship("CourseInvitation", back_populates="course", cascade="all, delete-orphan")
    chatbots = relationship("Chatbot", secondary=course_chatbots, back_populates="courses")

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f"<Course {self.title} ({self.code})>"


class CourseEnrollment(Base):
    """
    Modelo para representar la inscripción de un estudiante en un curso
    """
    __tablename__ = "course_enrollments"

    id = Column(Integer, primary_key=True, index=True)

    # Relaciones
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    course = relationship("Course", back_populates="enrollments")

    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    student = relationship("User", back_populates="course_enrollments", foreign_keys=[student_id])

    # Timestamps
    enrolled_at = Column(DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<CourseEnrollment course_id={self.course_id} student_id={self.student_id}>"


class CourseActivity(Base):
    """
    Modelo para representar la asignación de una actividad a un curso
    """
    __tablename__ = "course_activities"

    id = Column(Integer, primary_key=True, index=True)

    # Relaciones
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    course = relationship("Course", back_populates="course_activities")

    activity_id = Column(Integer, ForeignKey("activities.id"), nullable=False)
    activity = relationship("Activity", back_populates="course_activities")

    # Orden de la actividad en el curso
    order = Column(Integer, default=0)

    # Timestamps
    assigned_at = Column(DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<CourseActivity course_id={self.course_id} activity_id={self.activity_id}>"


class CourseInvitation(Base):
    """
    Modelo para representar invitaciones a un curso
    """
    __tablename__ = "course_invitations"

    id = Column(Integer, primary_key=True, index=True)

    # Relación con el curso
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    course = relationship("Course", back_populates="invitations")

    # Email del estudiante invitado
    email = Column(String(255), nullable=False, index=True)

    # Token único para la invitación
    token = Column(String(100), unique=True, index=True, nullable=False)

    # Estado de la invitación
    is_accepted = Column(Boolean, default=False)
    is_expired = Column(Boolean, default=False)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    accepted_at = Column(DateTime, nullable=True)
    expires_at = Column(DateTime, nullable=False)

    def __repr__(self):
        return f"<CourseInvitation {self.email} to course_id={self.course_id}>"
