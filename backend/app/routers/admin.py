from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_
from typing import List, Optional
from datetime import datetime, timedelta
from ..database import get_db
from ..models.user import User, UserRole
from ..models.activity import Activity, ActivityType
from ..models.credit import CreditTransaction, TransactionType
from ..schemas.user import UserResponse
from ..schemas.activity import ActivityResponse
from ..utils.auth import get_current_active_user
from pydantic import BaseModel, EmailStr

router = APIRouter(prefix="/api/admin", tags=["Admin"])


# Dependency to check if user is admin
async def get_current_admin_user(current_user: User = Depends(get_current_active_user)) -> User:
    """
    Verifica que el usuario actual sea administrador
    """
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permisos de administrador"
        )
    return current_user


# Schemas for admin endpoints
class DashboardStats(BaseModel):
    total_users: int
    total_activities: int
    total_credits_used: int
    active_users_today: int
    activities_created_today: int


class UserListItem(BaseModel):
    id: int
    email: str
    username: str
    full_name: Optional[str]
    role: UserRole
    is_active: bool
    credits: int
    created_at: datetime

    class Config:
        from_attributes = True


class UserDetailResponse(BaseModel):
    user: UserResponse
    recent_activities: List[ActivityResponse]
    recent_transactions: List[dict]


class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    role: Optional[UserRole] = None
    is_active: Optional[bool] = None
    credits: Optional[int] = None


class CreditAdjustment(BaseModel):
    amount: int
    description: str


class ActivityListItem(BaseModel):
    id: int
    title: str
    description: Optional[str]
    activity_type: ActivityType
    subject: Optional[str]
    grade_level: Optional[str]
    is_public: bool
    credits_used: int
    creator_id: int
    created_at: datetime

    class Config:
        from_attributes = True


# Endpoint 1: GET /api/admin/stats - Dashboard statistics
@router.get("/stats", response_model=DashboardStats)
async def get_dashboard_stats(
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """
    Obtiene estadísticas del dashboard para administradores
    """
    # Total users
    total_users = db.query(func.count(User.id)).scalar()

    # Total activities
    total_activities = db.query(func.count(Activity.id)).scalar()

    # Total credits used (sum of all negative transactions)
    total_credits_used = db.query(func.sum(CreditTransaction.amount))\
        .filter(CreditTransaction.transaction_type == TransactionType.USAGE)\
        .scalar() or 0
    total_credits_used = abs(total_credits_used)

    # Active users today (users who created activities or made transactions today)
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)

    active_users_today = db.query(func.count(func.distinct(Activity.creator_id)))\
        .filter(Activity.created_at >= today_start)\
        .scalar()

    # Activities created today
    activities_created_today = db.query(func.count(Activity.id))\
        .filter(Activity.created_at >= today_start)\
        .scalar()

    return DashboardStats(
        total_users=total_users,
        total_activities=total_activities,
        total_credits_used=total_credits_used,
        active_users_today=active_users_today,
        activities_created_today=activities_created_today
    )


# Endpoint 2: GET /api/admin/users - List all users with pagination
@router.get("/users", response_model=List[UserListItem])
async def get_all_users(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=20, le=100),
    search: Optional[str] = None,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """
    Lista todos los usuarios con paginación y búsqueda opcional
    """
    query = db.query(User)

    # Apply search filter if provided
    if search:
        search_filter = or_(
            User.email.ilike(f"%{search}%"),
            User.username.ilike(f"%{search}%"),
            User.full_name.ilike(f"%{search}%")
        )
        query = query.filter(search_filter)

    users = query.order_by(User.created_at.desc()).offset(skip).limit(limit).all()

    return [UserListItem.from_orm(user) for user in users]


# Endpoint 3: GET /api/admin/users/{user_id} - Get specific user details
@router.get("/users/{user_id}", response_model=UserDetailResponse)
async def get_user_details(
    user_id: int,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """
    Obtiene detalles completos de un usuario específico
    """
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )

    # Get recent activities (last 10)
    recent_activities = db.query(Activity)\
        .filter(Activity.creator_id == user_id)\
        .order_by(Activity.created_at.desc())\
        .limit(10)\
        .all()

    # Get recent credit transactions (last 20)
    recent_transactions = db.query(CreditTransaction)\
        .filter(CreditTransaction.user_id == user_id)\
        .order_by(CreditTransaction.created_at.desc())\
        .limit(20)\
        .all()

    transaction_list = [
        {
            "id": t.id,
            "amount": t.amount,
            "transaction_type": t.transaction_type,
            "description": t.description,
            "balance_after": t.balance_after,
            "created_at": t.created_at
        }
        for t in recent_transactions
    ]

    return UserDetailResponse(
        user=UserResponse.from_orm(user),
        recent_activities=[ActivityResponse.from_orm(activity) for activity in recent_activities],
        recent_transactions=transaction_list
    )


# Endpoint 4: PATCH /api/admin/users/{user_id} - Update user
@router.patch("/users/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: int,
    user_update: UserUpdate,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """
    Actualiza información de un usuario
    """
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )

    # Prevent admin from modifying their own role or active status
    if user_id == current_user.id:
        if user_update.role is not None and user_update.role != current_user.role:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No puedes modificar tu propio rol"
            )
        if user_update.is_active is not None and user_update.is_active != current_user.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No puedes modificar tu propio estado de activación"
            )

    # Check if email is already taken
    if user_update.email is not None and user_update.email != user.email:
        existing_user = db.query(User).filter(User.email == user_update.email).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El email ya está en uso"
            )
        user.email = user_update.email

    # Update fields
    if user_update.full_name is not None:
        user.full_name = user_update.full_name
    if user_update.role is not None:
        user.role = user_update.role
    if user_update.is_active is not None:
        user.is_active = user_update.is_active
    if user_update.credits is not None:
        # If credits changed, create an admin adjustment transaction
        if user_update.credits != user.credits:
            credit_diff = user_update.credits - user.credits
            user.credits = user_update.credits

            transaction = CreditTransaction(
                user_id=user.id,
                amount=credit_diff,
                transaction_type=TransactionType.ADMIN_ADJUSTMENT,
                description=f"Ajuste manual de créditos por administrador {current_user.email}",
                balance_after=user.credits
            )
            db.add(transaction)

    db.commit()
    db.refresh(user)

    return UserResponse.from_orm(user)


# Endpoint 5: DELETE /api/admin/users/{user_id} - Delete user (soft delete)
@router.delete("/users/{user_id}")
async def delete_user(
    user_id: int,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """
    Elimina un usuario (soft delete - marca como inactivo)
    """
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )

    # Prevent admin from deleting themselves
    if user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No puedes eliminar tu propia cuenta"
        )

    user.is_active = False
    db.commit()

    return {"message": "Usuario marcado como inactivo correctamente"}


# Endpoint 6: POST /api/admin/users/{user_id}/credits - Add/remove credits
@router.post("/users/{user_id}/credits")
async def adjust_user_credits(
    user_id: int,
    credit_adjustment: CreditAdjustment,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """
    Añade o remueve créditos de un usuario
    """
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )

    # Check if the adjustment would result in negative credits
    new_balance = user.credits + credit_adjustment.amount
    if new_balance < 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"El ajuste resultaría en un balance negativo. Balance actual: {user.credits}"
        )

    # Update user credits
    user.credits = new_balance

    # Create transaction record
    transaction = CreditTransaction(
        user_id=user.id,
        amount=credit_adjustment.amount,
        transaction_type=TransactionType.ADMIN_ADJUSTMENT,
        description=f"{credit_adjustment.description} (por {current_user.email})",
        balance_after=user.credits
    )

    db.add(transaction)
    db.commit()
    db.refresh(user)

    return {
        "message": "Créditos ajustados correctamente",
        "new_balance": user.credits,
        "amount_adjusted": credit_adjustment.amount
    }


# Endpoint 7: GET /api/admin/activities - List all activities with pagination
@router.get("/activities", response_model=List[ActivityListItem])
async def get_all_activities(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=20, le=100),
    activity_type: Optional[ActivityType] = None,
    creator_id: Optional[int] = None,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """
    Lista todas las actividades con paginación y filtros opcionales
    """
    query = db.query(Activity)

    # Apply filters
    if activity_type:
        query = query.filter(Activity.activity_type == activity_type)

    if creator_id:
        query = query.filter(Activity.creator_id == creator_id)

    activities = query.order_by(Activity.created_at.desc()).offset(skip).limit(limit).all()

    return [ActivityListItem.from_orm(activity) for activity in activities]


# Endpoint 8: DELETE /api/admin/activities/{activity_id} - Delete activity
@router.delete("/activities/{activity_id}")
async def delete_activity(
    activity_id: int,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """
    Elimina una actividad (hard delete)
    """
    activity = db.query(Activity).filter(Activity.id == activity_id).first()

    if not activity:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Actividad no encontrada"
        )

    db.delete(activity)
    db.commit()

    return {"message": "Actividad eliminada correctamente"}
