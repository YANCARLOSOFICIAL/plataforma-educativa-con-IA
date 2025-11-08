from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from ..database import get_db
from ..models.user import User, UserRole
from ..models.activity import Activity, ActivityType
from ..schemas.activity import ActivityResponse, ActivityUpdate
from ..utils.auth import get_current_active_user

router = APIRouter(prefix="/api/activities", tags=["Activities"])


@router.get("/", response_model=List[ActivityResponse])
async def get_activities(
    activity_type: Optional[ActivityType] = None,
    is_public: Optional[bool] = None,
    skip: int = 0,
    limit: int = Query(default=20, le=100),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Obtiene lista de actividades (públicas + propias del usuario)
    """
    query = db.query(Activity)

    # Filtrar por tipo de actividad si se especifica
    if activity_type:
        query = query.filter(Activity.activity_type == activity_type)

    # Mostrar actividades públicas o las creadas por el usuario
    if current_user.role == UserRole.ADMIN:
        # Admin puede ver todo
        pass
    else:
        # Otros usuarios ven públicas + propias
        if is_public is not None:
            if is_public:
                query = query.filter(Activity.is_public == True)
            else:
                query = query.filter(Activity.creator_id == current_user.id)
        else:
            query = query.filter(
                (Activity.is_public == True) | (Activity.creator_id == current_user.id)
            )

    activities = query.order_by(Activity.created_at.desc()).offset(skip).limit(limit).all()

    return [ActivityResponse.from_orm(activity) for activity in activities]


@router.get("/{activity_id}", response_model=ActivityResponse)
async def get_activity(
    activity_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Obtiene una actividad específica
    """
    activity = db.query(Activity).filter(Activity.id == activity_id).first()

    if not activity:
        raise HTTPException(status_code=404, detail="Actividad no encontrada")

    # Verificar permisos
    if not activity.is_public and activity.creator_id != current_user.id and current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="No tienes permiso para ver esta actividad")

    return ActivityResponse.from_orm(activity)


@router.get("/my/activities", response_model=List[ActivityResponse])
async def get_my_activities(
    activity_type: Optional[ActivityType] = None,
    skip: int = 0,
    limit: int = Query(default=20, le=100),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Obtiene las actividades creadas por el usuario actual
    """
    query = db.query(Activity).filter(Activity.creator_id == current_user.id)

    if activity_type:
        query = query.filter(Activity.activity_type == activity_type)

    activities = query.order_by(Activity.created_at.desc()).offset(skip).limit(limit).all()

    return [ActivityResponse.from_orm(activity) for activity in activities]


@router.patch("/{activity_id}", response_model=ActivityResponse)
async def update_activity(
    activity_id: int,
    activity_update: ActivityUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Actualiza una actividad (solo el creador puede modificarla)
    """
    activity = db.query(Activity).filter(Activity.id == activity_id).first()

    if not activity:
        raise HTTPException(status_code=404, detail="Actividad no encontrada")

    if activity.creator_id != current_user.id and current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="No tienes permiso para modificar esta actividad")

    # Actualizar campos
    if activity_update.title is not None:
        activity.title = activity_update.title
    if activity_update.description is not None:
        activity.description = activity_update.description
    if activity_update.is_public is not None:
        activity.is_public = activity_update.is_public

    db.commit()
    db.refresh(activity)

    return ActivityResponse.from_orm(activity)


@router.delete("/{activity_id}")
async def delete_activity(
    activity_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Elimina una actividad (solo el creador puede eliminarla)
    """
    activity = db.query(Activity).filter(Activity.id == activity_id).first()

    if not activity:
        raise HTTPException(status_code=404, detail="Actividad no encontrada")

    if activity.creator_id != current_user.id and current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="No tienes permiso para eliminar esta actividad")

    db.delete(activity)
    db.commit()

    return {"message": "Actividad eliminada correctamente"}
