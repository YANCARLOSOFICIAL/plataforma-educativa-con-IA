from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
import secrets
from datetime import datetime, timedelta
from ..database import get_db
from ..models.user import User, UserRole
from ..models.course import Course, CourseEnrollment, CourseActivity, CourseInvitation
from ..models.activity import Activity
from ..models.chatbot import Chatbot
from ..schemas.course import (
    CourseCreate,
    CourseUpdate,
    CourseResponse,
    CourseDetailResponse,
    CourseActivityCreate,
    CourseActivityUpdate,
    CourseActivityResponse,
    CourseInvitationCreate,
    CourseInvitationBulkCreate,
    CourseInvitationResponse,
    CourseInvitationAccept,
    CourseStatsResponse,
    StudentInCourseResponse,
    ActivityInCourseResponse
)
from ..schemas.chatbot import ChatbotResponse
from ..utils.auth import get_current_active_user

router = APIRouter(prefix="/api/courses", tags=["Courses"])


def generate_course_code() -> str:
    """Genera un código único para el curso"""
    return secrets.token_urlsafe(8).upper()[:8]


def generate_invitation_token() -> str:
    """Genera un token único para invitaciones"""
    return secrets.token_urlsafe(32)


# ==================== RUTAS DE CURSOS ====================

@router.post("/", response_model=CourseResponse, status_code=status.HTTP_201_CREATED)
async def create_course(
    course_data: CourseCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Crear un nuevo curso (solo para docentes y administradores)
    """
    # Verificar que el usuario sea docente o admin
    if current_user.role not in [UserRole.DOCENTE, UserRole.ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo los docentes pueden crear cursos"
        )

    # Generar código único
    code = generate_course_code()
    while db.query(Course).filter(Course.code == code).first():
        code = generate_course_code()

    # Crear curso
    course = Course(
        **course_data.model_dump(),
        code=code,
        teacher_id=current_user.id
    )

    db.add(course)
    db.commit()
    db.refresh(course)

    # Agregar contadores
    course_response = CourseResponse.from_orm(course)
    course_response.student_count = 0
    course_response.activity_count = 0

    return course_response


@router.get("/", response_model=List[CourseResponse])
async def get_my_courses(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Obtener cursos del usuario actual
    - Docentes: cursos creados
    - Estudiantes: cursos en los que está inscrito
    """
    if current_user.role == UserRole.DOCENTE:
        # Obtener cursos creados por el docente
        courses = db.query(Course).filter(
            Course.teacher_id == current_user.id
        ).order_by(Course.created_at.desc()).all()

    else:
        # Obtener cursos en los que el estudiante está inscrito
        enrollments = db.query(CourseEnrollment).filter(
            CourseEnrollment.student_id == current_user.id
        ).all()
        course_ids = [e.course_id for e in enrollments]
        courses = db.query(Course).filter(Course.id.in_(course_ids)).all() if course_ids else []

    # Agregar contadores
    result = []
    for course in courses:
        student_count = db.query(func.count(CourseEnrollment.id)).filter(
            CourseEnrollment.course_id == course.id
        ).scalar()

        activity_count = db.query(func.count(CourseActivity.id)).filter(
            CourseActivity.course_id == course.id
        ).scalar()

        course_response = CourseResponse.from_orm(course)
        course_response.student_count = student_count
        course_response.activity_count = activity_count
        result.append(course_response)

    return result


@router.get("/{course_id}", response_model=CourseDetailResponse)
async def get_course_detail(
    course_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Obtener detalles de un curso con estudiantes y actividades
    """
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Curso no encontrado")

    # Verificar permisos
    if current_user.role == UserRole.DOCENTE:
        if course.teacher_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tienes permiso para ver este curso"
            )
    else:
        # Verificar que el estudiante esté inscrito
        enrollment = db.query(CourseEnrollment).filter(
            CourseEnrollment.course_id == course_id,
            CourseEnrollment.student_id == current_user.id
        ).first()
        if not enrollment:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No estás inscrito en este curso"
            )

    # Obtener estudiantes
    enrollments = db.query(CourseEnrollment).filter(
        CourseEnrollment.course_id == course_id
    ).all()

    students = []
    for enrollment in enrollments:
        student = db.query(User).filter(User.id == enrollment.student_id).first()
        if student:
            students.append(StudentInCourseResponse(
                id=student.id,
                email=student.email,
                username=student.username,
                full_name=student.full_name,
                enrolled_at=enrollment.enrolled_at
            ))

    # Obtener actividades
    course_activities = db.query(CourseActivity).filter(
        CourseActivity.course_id == course_id
    ).order_by(CourseActivity.order).all()

    activities = []
    for ca in course_activities:
        activity = db.query(Activity).filter(Activity.id == ca.activity_id).first()
        if activity:
            activities.append(ActivityInCourseResponse(
                id=activity.id,
                title=activity.title,
                description=activity.description,
                activity_type=activity.activity_type.value,
                subject=activity.subject,
                grade_level=activity.grade_level,
                order=ca.order,
                assigned_at=ca.assigned_at
            ))

    # Construir respuesta
    course_response = CourseDetailResponse.from_orm(course)
    course_response.student_count = len(students)
    course_response.activity_count = len(activities)
    course_response.students = students
    course_response.activities = activities

    return course_response


@router.patch("/{course_id}", response_model=CourseResponse)
async def update_course(
    course_id: int,
    course_data: CourseUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Actualizar un curso (solo el docente creador)
    """
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Curso no encontrado")

    # Verificar que sea el docente creador
    if course.teacher_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo el docente creador puede editar este curso"
        )

    # Actualizar campos
    update_data = course_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(course, field, value)

    db.commit()
    db.refresh(course)

    # Agregar contadores
    student_count = db.query(func.count(CourseEnrollment.id)).filter(
        CourseEnrollment.course_id == course.id
    ).scalar()

    activity_count = db.query(func.count(CourseActivity.id)).filter(
        CourseActivity.course_id == course.id
    ).scalar()

    course_response = CourseResponse.from_orm(course)
    course_response.student_count = student_count
    course_response.activity_count = activity_count

    return course_response


@router.delete("/{course_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_course(
    course_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Eliminar un curso (solo el docente creador)
    """
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Curso no encontrado")

    # Verificar que sea el docente creador
    if course.teacher_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo el docente creador puede eliminar este curso"
        )

    db.delete(course)
    db.commit()

    return None


# ==================== RUTAS DE ACTIVIDADES EN CURSOS ====================

@router.post("/{course_id}/activities", response_model=CourseActivityResponse)
async def add_activity_to_course(
    course_id: int,
    activity_id: int,
    order: int = 0,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Agregar una actividad a un curso (solo el docente creador)
    """
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Curso no encontrado")

    # Verificar que sea el docente creador
    if course.teacher_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo el docente creador puede agregar actividades"
        )

    # Verificar que la actividad exista y pertenezca al docente
    activity = db.query(Activity).filter(Activity.id == activity_id).first()
    if not activity:
        raise HTTPException(status_code=404, detail="Actividad no encontrada")

    if activity.creator_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo puedes agregar tus propias actividades al curso"
        )

    # Verificar que no esté ya agregada
    existing = db.query(CourseActivity).filter(
        CourseActivity.course_id == course_id,
        CourseActivity.activity_id == activity_id
    ).first()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Esta actividad ya está en el curso"
        )

    # Agregar actividad al curso
    course_activity = CourseActivity(
        course_id=course_id,
        activity_id=activity_id,
        order=order
    )

    db.add(course_activity)
    db.commit()
    db.refresh(course_activity)

    return CourseActivityResponse.from_orm(course_activity)


@router.delete("/{course_id}/activities/{activity_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_activity_from_course(
    course_id: int,
    activity_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Remover una actividad de un curso (solo el docente creador)
    """
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Curso no encontrado")

    # Verificar que sea el docente creador
    if course.teacher_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo el docente creador puede remover actividades"
        )

    # Buscar y eliminar la relación
    course_activity = db.query(CourseActivity).filter(
        CourseActivity.course_id == course_id,
        CourseActivity.activity_id == activity_id
    ).first()

    if not course_activity:
        raise HTTPException(status_code=404, detail="Actividad no encontrada en este curso")

    db.delete(course_activity)
    db.commit()

    return None


# ==================== RUTAS DE INVITACIONES ====================

@router.post("/{course_id}/invitations", response_model=List[CourseInvitationResponse])
async def send_course_invitations(
    course_id: int,
    invitation_data: CourseInvitationBulkCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Enviar invitaciones a estudiantes (solo el docente creador)
    """
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Curso no encontrado")

    # Verificar que sea el docente creador
    if course.teacher_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo el docente creador puede enviar invitaciones"
        )

    invitations = []
    for email in invitation_data.emails:
        # Verificar si ya existe una invitación activa
        existing = db.query(CourseInvitation).filter(
            CourseInvitation.course_id == course_id,
            CourseInvitation.email == email,
            CourseInvitation.is_expired == False
        ).first()

        if existing:
            # Ya existe una invitación, la agregamos a la respuesta
            invitations.append(existing)
            continue

        # Crear nueva invitación
        token = generate_invitation_token()
        expires_at = datetime.utcnow() + timedelta(days=7)  # Expira en 7 días

        invitation = CourseInvitation(
            course_id=course_id,
            email=email,
            token=token,
            expires_at=expires_at
        )

        db.add(invitation)
        invitations.append(invitation)

    db.commit()

    # Refrescar todas las invitaciones
    for inv in invitations:
        db.refresh(inv)

    # TODO: Aquí se podría enviar un email con el link de invitación
    # usando el servicio de email (Resend)

    return [CourseInvitationResponse.from_orm(inv) for inv in invitations]


@router.get("/{course_id}/invitations", response_model=List[CourseInvitationResponse])
async def get_course_invitations(
    course_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Obtener todas las invitaciones de un curso (solo el docente creador)
    """
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Curso no encontrado")

    # Verificar que sea el docente creador
    if course.teacher_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo el docente creador puede ver las invitaciones"
        )

    invitations = db.query(CourseInvitation).filter(
        CourseInvitation.course_id == course_id
    ).order_by(CourseInvitation.created_at.desc()).all()

    return [CourseInvitationResponse.from_orm(inv) for inv in invitations]


@router.post("/join", response_model=CourseResponse)
async def accept_course_invitation(
    invitation_data: CourseInvitationAccept,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Aceptar una invitación a un curso usando el token
    """
    # Buscar la invitación
    invitation = db.query(CourseInvitation).filter(
        CourseInvitation.token == invitation_data.token
    ).first()

    if not invitation:
        raise HTTPException(status_code=404, detail="Invitación no encontrada")

    # Verificar que no esté expirada
    if invitation.is_expired or invitation.expires_at < datetime.utcnow():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La invitación ha expirado"
        )

    # Verificar que sea para el email del usuario actual
    if invitation.email != current_user.email:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Esta invitación no es para tu email"
        )

    # Verificar que no esté ya inscrito
    existing_enrollment = db.query(CourseEnrollment).filter(
        CourseEnrollment.course_id == invitation.course_id,
        CourseEnrollment.student_id == current_user.id
    ).first()

    if existing_enrollment:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ya estás inscrito en este curso"
        )

    # Crear la inscripción
    enrollment = CourseEnrollment(
        course_id=invitation.course_id,
        student_id=current_user.id
    )
    db.add(enrollment)

    # Marcar la invitación como aceptada
    invitation.is_accepted = True
    invitation.accepted_at = datetime.utcnow()

    db.commit()

    # Obtener el curso
    course = db.query(Course).filter(Course.id == invitation.course_id).first()

    # Agregar contadores
    student_count = db.query(func.count(CourseEnrollment.id)).filter(
        CourseEnrollment.course_id == course.id
    ).scalar()

    activity_count = db.query(func.count(CourseActivity.id)).filter(
        CourseActivity.course_id == course.id
    ).scalar()

    course_response = CourseResponse.from_orm(course)
    course_response.student_count = student_count
    course_response.activity_count = activity_count

    return course_response


@router.post("/join-by-code", response_model=CourseResponse)
async def join_course_by_code(
    course_code: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Unirse a un curso usando el código del curso
    """
    # Buscar el curso por código
    course = db.query(Course).filter(
        Course.code == course_code.upper().strip()
    ).first()

    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Curso no encontrado. Verifica el código."
        )

    # Verificar que el curso esté activo
    if not course.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Este curso no está activo actualmente"
        )

    # Verificar que no sea el docente del curso
    if course.teacher_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No puedes inscribirte en tu propio curso"
        )

    # Verificar que no esté ya inscrito
    existing_enrollment = db.query(CourseEnrollment).filter(
        CourseEnrollment.course_id == course.id,
        CourseEnrollment.student_id == current_user.id
    ).first()

    if existing_enrollment:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ya estás inscrito en este curso"
        )

    # Crear la inscripción
    enrollment = CourseEnrollment(
        course_id=course.id,
        student_id=current_user.id
    )
    db.add(enrollment)
    db.commit()

    # Agregar contadores
    student_count = db.query(func.count(CourseEnrollment.id)).filter(
        CourseEnrollment.course_id == course.id
    ).scalar()

    activity_count = db.query(func.count(CourseActivity.id)).filter(
        CourseActivity.course_id == course.id
    ).scalar()

    course_response = CourseResponse.from_orm(course)
    course_response.student_count = student_count
    course_response.activity_count = activity_count

    return course_response


@router.delete("/{course_id}/students/{student_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_student_from_course(
    course_id: int,
    student_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Remover un estudiante de un curso (solo el docente creador)
    """
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Curso no encontrado")

    # Verificar que sea el docente creador
    if course.teacher_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo el docente creador puede remover estudiantes"
        )

    # Buscar y eliminar la inscripción
    enrollment = db.query(CourseEnrollment).filter(
        CourseEnrollment.course_id == course_id,
        CourseEnrollment.student_id == student_id
    ).first()

    if not enrollment:
        raise HTTPException(status_code=404, detail="Estudiante no encontrado en este curso")

    db.delete(enrollment)
    db.commit()

    return None


# ==================== RUTAS DE CHATBOTS EN CURSOS ====================

@router.post("/{course_id}/chatbots/{chatbot_id}", response_model=dict)
async def add_chatbot_to_course(
    course_id: int,
    chatbot_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Agregar un chatbot a un curso (solo el docente creador)
    """
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Curso no encontrado")

    # Verificar que sea el docente creador
    if course.teacher_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo el docente creador puede agregar chatbots"
        )

    # Verificar que el chatbot exista
    chatbot = db.query(Chatbot).filter(Chatbot.id == chatbot_id).first()
    if not chatbot:
        raise HTTPException(status_code=404, detail="Chatbot no encontrado")

    # Verificar que el chatbot sea público o del docente
    if not chatbot.is_public and chatbot.creator_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso para agregar este chatbot"
        )

    # Verificar que no esté ya agregado
    if chatbot in course.chatbots:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Este chatbot ya está en el curso"
        )

    # Agregar chatbot al curso
    course.chatbots.append(chatbot)
    db.commit()

    return {"message": "Chatbot agregado al curso exitosamente"}


@router.delete("/{course_id}/chatbots/{chatbot_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_chatbot_from_course(
    course_id: int,
    chatbot_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Remover un chatbot de un curso (solo el docente creador)
    """
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Curso no encontrado")

    # Verificar que sea el docente creador
    if course.teacher_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo el docente creador puede remover chatbots"
        )

    # Verificar que el chatbot exista
    chatbot = db.query(Chatbot).filter(Chatbot.id == chatbot_id).first()
    if not chatbot:
        raise HTTPException(status_code=404, detail="Chatbot no encontrado")

    # Verificar que esté en el curso
    if chatbot not in course.chatbots:
        raise HTTPException(status_code=404, detail="Chatbot no encontrado en este curso")

    # Remover chatbot del curso
    course.chatbots.remove(chatbot)
    db.commit()

    return None


@router.get("/{course_id}/chatbots", response_model=List[ChatbotResponse])
async def get_course_chatbots(
    course_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Obtener todos los chatbots de un curso
    """
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Curso no encontrado")

    # Verificar permisos
    if current_user.role == UserRole.DOCENTE:
        if course.teacher_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tienes permiso para ver este curso"
            )
    else:
        # Verificar que el estudiante esté inscrito
        enrollment = db.query(CourseEnrollment).filter(
            CourseEnrollment.course_id == course_id,
            CourseEnrollment.student_id == current_user.id
        ).first()
        if not enrollment:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No estás inscrito en este curso"
            )

    # Retornar solo chatbots activos
    active_chatbots = [chatbot for chatbot in course.chatbots if chatbot.is_active]
    return active_chatbots


# ==================== ESTADÍSTICAS ====================

@router.get("/stats/my-stats", response_model=CourseStatsResponse)
async def get_my_course_stats(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Obtener estadísticas de cursos del usuario
    """
    if current_user.role == UserRole.DOCENTE:
        # Estadísticas para docentes
        total_courses = db.query(func.count(Course.id)).filter(
            Course.teacher_id == current_user.id
        ).scalar()

        active_courses = db.query(func.count(Course.id)).filter(
            Course.teacher_id == current_user.id,
            Course.is_active == True
        ).scalar()

        # Total de estudiantes en todos mis cursos
        total_students = db.query(func.count(CourseEnrollment.id)).join(
            Course, CourseEnrollment.course_id == Course.id
        ).filter(
            Course.teacher_id == current_user.id
        ).scalar()

        # Total de actividades en todos mis cursos
        total_activities = db.query(func.count(CourseActivity.id)).join(
            Course, CourseActivity.course_id == Course.id
        ).filter(
            Course.teacher_id == current_user.id
        ).scalar()

    else:
        # Estadísticas para estudiantes
        enrollments = db.query(CourseEnrollment).filter(
            CourseEnrollment.student_id == current_user.id
        ).all()

        course_ids = [e.course_id for e in enrollments]

        total_courses = len(course_ids)
        active_courses = db.query(func.count(Course.id)).filter(
            Course.id.in_(course_ids),
            Course.is_active == True
        ).scalar() if course_ids else 0

        total_students = 0  # No aplica para estudiantes
        total_activities = db.query(func.count(CourseActivity.id)).filter(
            CourseActivity.course_id.in_(course_ids)
        ).scalar() if course_ids else 0

    return CourseStatsResponse(
        total_courses=total_courses or 0,
        active_courses=active_courses or 0,
        total_students=total_students or 0,
        total_activities=total_activities or 0
    )
