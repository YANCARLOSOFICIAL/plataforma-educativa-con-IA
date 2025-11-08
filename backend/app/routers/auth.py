from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
from ..database import get_db
from ..models.user import User
from ..models.credit import TransactionType
from ..schemas.user import UserCreate, UserLogin, UserResponse, Token
from ..utils.auth import (
    verify_password,
    get_password_hash,
    create_access_token,
    get_current_active_user
)
from ..services.credit_service import credit_service
from ..config import settings

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/register", response_model=Token)
async def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """
    Registra un nuevo usuario
    """
    # Verificar si el email ya existe
    if db.query(User).filter(User.email == user_data.email).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El email ya está registrado"
        )

    # Verificar si el username ya existe
    if db.query(User).filter(User.username == user_data.username).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El nombre de usuario ya está en uso"
        )

    # Crear nuevo usuario
    new_user = User(
        email=user_data.email,
        username=user_data.username,
        full_name=user_data.full_name,
        hashed_password=get_password_hash(user_data.password),
        role=user_data.role,
        credits=settings.INITIAL_CREDITS
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Registrar créditos iniciales
    credit_service.add_credits(
        db=db,
        user=new_user,
        amount=settings.INITIAL_CREDITS,
        transaction_type=TransactionType.INITIAL,
        description="Créditos iniciales"
    )

    # Crear token
    access_token = create_access_token(data={"sub": new_user.email})

    return Token(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.from_orm(new_user)
    )


@router.post("/login", response_model=Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """
    Inicia sesión con email y contraseña
    """
    user = db.query(User).filter(User.email == form_data.username).first()

    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email o contraseña incorrectos",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Usuario inactivo"
        )

    access_token = create_access_token(data={"sub": user.email})

    return Token(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.from_orm(user)
    )


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_active_user)):
    """
    Obtiene información del usuario actual
    """
    return UserResponse.from_orm(current_user)


@router.get("/credits")
async def get_credits(current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    """
    Obtiene el balance de créditos y transacciones recientes
    """
    transactions = credit_service.get_user_transactions(db, current_user.id, limit=10)

    return {
        "current_balance": current_user.credits,
        "recent_transactions": [
            {
                "id": t.id,
                "amount": t.amount,
                "type": t.transaction_type,
                "description": t.description,
                "balance_after": t.balance_after,
                "created_at": t.created_at
            }
            for t in transactions
        ]
    }
