from fastapi import APIRouter, Depends, HTTPException, status, Response, Cookie
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
from typing import Optional
from ..database import get_db
from ..models.user import User
from ..models.credit import TransactionType
from ..schemas.user import (
    UserCreate,
    UserLogin,
    UserResponse,
    Token,
    ChangePasswordRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest
)
from ..utils.auth import (
    verify_password,
    get_password_hash,
    create_access_token,
    create_refresh_token,
    verify_refresh_token,
    get_current_active_user
)
from ..services.credit_service import credit_service
from ..services.email_service import email_service
from ..config import settings

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/register", response_model=Token)
async def register(user_data: UserCreate, response: Response, db: Session = Depends(get_db)):
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

    # Crear tokens
    access_token = create_access_token(data={"sub": new_user.email})
    refresh_token = create_refresh_token(data={"sub": new_user.email})

    # Establecer refresh token en cookie httpOnly
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=False,  # Cambiar a True en producción con HTTPS
        samesite="lax",
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60  # 7 días en segundos
    )

    return Token(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.from_orm(new_user)
    )


@router.post("/login", response_model=Token)
async def login(
    response: Response,
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

    # Crear tokens
    access_token = create_access_token(data={"sub": user.email})
    refresh_token = create_refresh_token(data={"sub": user.email})

    # Establecer refresh token en cookie httpOnly
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=False,  # Cambiar a True en producción con HTTPS
        samesite="lax",
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60  # 7 días en segundos
    )

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


@router.post("/refresh", response_model=Token)
async def refresh_token(
    response: Response,
    refresh_token: Optional[str] = Cookie(None),
    db: Session = Depends(get_db)
):
    """
    Refresca el access token usando el refresh token de la cookie
    """
    if not refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token no encontrado"
        )

    # Verificar el refresh token
    email = verify_refresh_token(refresh_token)
    if not email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token inválido o expirado"
        )

    # Buscar usuario
    user = db.query(User).filter(User.email == email).first()
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario no encontrado o inactivo"
        )

    # Crear nuevo access token y refresh token
    new_access_token = create_access_token(data={"sub": user.email})
    new_refresh_token = create_refresh_token(data={"sub": user.email})

    # Actualizar la cookie con el nuevo refresh token
    response.set_cookie(
        key="refresh_token",
        value=new_refresh_token,
        httponly=True,
        secure=False,  # Cambiar a True en producción con HTTPS
        samesite="lax",
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60
    )

    return Token(
        access_token=new_access_token,
        token_type="bearer",
        user=UserResponse.from_orm(user)
    )


@router.post("/logout")
async def logout(response: Response):
    """
    Cierra sesión del usuario eliminando el refresh token
    """
    response.delete_cookie(key="refresh_token")
    return {"message": "Sesión cerrada exitosamente"}


@router.post("/change-password")
async def change_password(
    password_data: ChangePasswordRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Cambia la contraseña del usuario actual
    """
    # Verificar que la contraseña actual sea correcta
    if not verify_password(password_data.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La contraseña actual es incorrecta"
        )

    # Validar que la nueva contraseña sea diferente
    if verify_password(password_data.new_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La nueva contraseña debe ser diferente a la actual"
        )

    # Validar longitud mínima
    if len(password_data.new_password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La contraseña debe tener al menos 6 caracteres"
        )

    # Actualizar contraseña
    current_user.hashed_password = get_password_hash(password_data.new_password)
    db.commit()

    return {"message": "Contraseña actualizada exitosamente"}


@router.post("/forgot-password")
async def forgot_password(
    request_data: ForgotPasswordRequest,
    db: Session = Depends(get_db)
):
    """
    Solicita recuperación de contraseña enviando un email con un token
    """
    # Buscar usuario por email
    user = db.query(User).filter(User.email == request_data.email).first()

    # Por seguridad, siempre devolver el mismo mensaje aunque el email no exista
    # Esto previene que se pueda verificar qué emails están registrados
    if not user:
        return {"message": "Si el correo existe, recibirás instrucciones para recuperar tu contraseña"}

    # Crear token de reset (válido por 1 hora)
    reset_token = create_access_token(
        data={"sub": user.email, "purpose": "password_reset"},
        expires_delta=timedelta(hours=1)
    )

    # Enviar email de recuperación
    email_sent = email_service.send_password_reset_email(
        to_email=user.email,
        user_name=user.full_name or user.username,
        reset_token=reset_token
    )

    # Respuesta genérica para prevenir enumeración de usuarios
    return {
        "message": "Si el correo existe, recibirás instrucciones para recuperar tu contraseña"
    }


@router.post("/reset-password")
async def reset_password(
    reset_data: ResetPasswordRequest,
    db: Session = Depends(get_db)
):
    """
    Resetea la contraseña usando el token de recuperación
    """
    from jose import JWTError, jwt
    from ..config import settings

    try:
        # Decodificar y verificar el token
        payload = jwt.decode(
            reset_data.token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )
        email: str = payload.get("sub")
        purpose: str = payload.get("purpose")

        # Verificar que el token sea para reset de contraseña
        if not email or purpose != "password_reset":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Token inválido"
            )
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Token inválido o expirado"
        )

    # Buscar usuario
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )

    # Validar longitud mínima de la nueva contraseña
    if len(reset_data.new_password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La contraseña debe tener al menos 6 caracteres"
        )

    # Actualizar contraseña
    user.hashed_password = get_password_hash(reset_data.new_password)
    db.commit()

    return {"message": "Contraseña restablecida exitosamente"}
