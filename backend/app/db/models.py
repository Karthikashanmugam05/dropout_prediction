from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base


class Student(Base):
    __tablename__ = "students"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    age: Mapped[int] = mapped_column(Integer, nullable=False)
    department: Mapped[str] = mapped_column(String(80), nullable=False, index=True)
    attendance: Mapped[float] = mapped_column(Float, nullable=False)
    marks: Mapped[float] = mapped_column(Float, nullable=False)
    assignments_completed: Mapped[float] = mapped_column(Float, nullable=False)
    library_usage: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    fee_status: Mapped[str] = mapped_column(String(40), nullable=False, default="on_time")
    engagement_score: Mapped[float] = mapped_column(Float, nullable=False, default=50.0)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    predictions: Mapped[list["Prediction"]] = relationship("Prediction", back_populates="student")


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    username: Mapped[str] = mapped_column(String(80), unique=True, nullable=False, index=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(String(20), nullable=False, default="faculty")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)


class Prediction(Base):
    __tablename__ = "predictions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    student_id: Mapped[int] = mapped_column(ForeignKey("students.id"), nullable=False, index=True)
    risk_score: Mapped[float] = mapped_column(Float, nullable=False)
    risk_level: Mapped[str] = mapped_column(String(20), nullable=False, index=True)
    prediction_label: Mapped[str] = mapped_column(String(20), nullable=False)
    reason_summary: Mapped[str] = mapped_column(String(500), nullable=False)
    prediction_date: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    student: Mapped[Student] = relationship("Student", back_populates="predictions")
