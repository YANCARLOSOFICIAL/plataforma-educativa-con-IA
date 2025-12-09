from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime


# Course Schemas
class CourseBase(BaseModel):
    title: str
    description: Optional[str] = None
    subject: Optional[str] = None
    grade_level: Optional[str] = None


class CourseCreate(CourseBase):
    pass


class CourseUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    subject: Optional[str] = None
    grade_level: Optional[str] = None
    is_active: Optional[bool] = None


class CourseResponse(CourseBase):
    id: int
    code: str
    is_active: bool
    teacher_id: int
    created_at: datetime
    updated_at: Optional[datetime]

    # Información adicional
    student_count: Optional[int] = 0
    activity_count: Optional[int] = 0

    class Config:
        from_attributes = True


class CourseDetailResponse(CourseResponse):
    """Respuesta detallada con estudiantes y actividades"""
    students: List['StudentInCourseResponse'] = []
    activities: List['ActivityInCourseResponse'] = []

    class Config:
        from_attributes = True


# Course Enrollment Schemas
class CourseEnrollmentCreate(BaseModel):
    course_id: int
    student_id: int


class CourseEnrollmentResponse(BaseModel):
    id: int
    course_id: int
    student_id: int
    enrolled_at: datetime

    class Config:
        from_attributes = True


class StudentInCourseResponse(BaseModel):
    """Información del estudiante en un curso"""
    id: int
    email: str
    username: str
    full_name: Optional[str]
    enrolled_at: datetime

    class Config:
        from_attributes = True


# Course Activity Schemas
class CourseActivityCreate(BaseModel):
    course_id: int
    activity_id: int
    order: Optional[int] = 0


class CourseActivityUpdate(BaseModel):
    order: Optional[int] = None


class CourseActivityResponse(BaseModel):
    id: int
    course_id: int
    activity_id: int
    order: int
    assigned_at: datetime

    class Config:
        from_attributes = True


class ActivityInCourseResponse(BaseModel):
    """Información de actividad en un curso"""
    id: int
    title: str
    description: Optional[str]
    activity_type: str
    subject: Optional[str]
    grade_level: Optional[str]
    order: int
    assigned_at: datetime

    class Config:
        from_attributes = True


# Course Invitation Schemas
class CourseInvitationCreate(BaseModel):
    email: EmailStr


class CourseInvitationBulkCreate(BaseModel):
    emails: List[EmailStr]


class CourseInvitationResponse(BaseModel):
    id: int
    course_id: int
    email: str
    token: str
    is_accepted: bool
    is_expired: bool
    created_at: datetime
    accepted_at: Optional[datetime]
    expires_at: datetime

    class Config:
        from_attributes = True


class CourseInvitationAccept(BaseModel):
    token: str


# Stats
class CourseStatsResponse(BaseModel):
    total_courses: int
    active_courses: int
    total_students: int
    total_activities: int

    class Config:
        from_attributes = True
