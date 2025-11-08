from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from ..database import Base


class TransactionType(str, enum.Enum):
    INITIAL = "initial"
    USAGE = "usage"
    REFUND = "refund"
    ADMIN_ADJUSTMENT = "admin_adjustment"


class CreditTransaction(Base):
    __tablename__ = "credit_transactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    amount = Column(Integer, nullable=False)  # Positive for add, negative for deduct
    transaction_type = Column(Enum(TransactionType), nullable=False)
    description = Column(String)
    activity_id = Column(Integer, ForeignKey("activities.id"), nullable=True)
    balance_after = Column(Integer, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="credit_transactions")
