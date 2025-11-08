from sqlalchemy.orm import Session
from ..models.user import User
from ..models.credit import CreditTransaction, TransactionType
from fastapi import HTTPException


class CreditService:
    @staticmethod
    def deduct_credits(
        db: Session,
        user: User,
        amount: int,
        activity_id: int = None,
        description: str = ""
    ) -> CreditTransaction:
        """
        Deduce créditos del usuario
        """
        if user.credits < amount:
            raise HTTPException(
                status_code=400,
                detail=f"Créditos insuficientes. Tienes {user.credits} créditos, necesitas {amount}."
            )

        user.credits -= amount

        transaction = CreditTransaction(
            user_id=user.id,
            amount=-amount,
            transaction_type=TransactionType.USAGE,
            description=description,
            activity_id=activity_id,
            balance_after=user.credits
        )

        db.add(transaction)
        db.commit()
        db.refresh(transaction)

        return transaction

    @staticmethod
    def add_credits(
        db: Session,
        user: User,
        amount: int,
        transaction_type: TransactionType,
        description: str = ""
    ) -> CreditTransaction:
        """
        Añade créditos al usuario
        """
        user.credits += amount

        transaction = CreditTransaction(
            user_id=user.id,
            amount=amount,
            transaction_type=transaction_type,
            description=description,
            balance_after=user.credits
        )

        db.add(transaction)
        db.commit()
        db.refresh(transaction)

        return transaction

    @staticmethod
    def get_user_transactions(db: Session, user_id: int, skip: int = 0, limit: int = 100):
        """
        Obtiene el historial de transacciones de un usuario
        """
        return db.query(CreditTransaction)\
            .filter(CreditTransaction.user_id == user_id)\
            .order_by(CreditTransaction.created_at.desc())\
            .offset(skip)\
            .limit(limit)\
            .all()


credit_service = CreditService()
