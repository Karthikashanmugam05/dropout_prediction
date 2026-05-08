import logging
from collections import defaultdict
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import desc, func
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import Prediction, Student
from app.core.security import require_role
from app.schemas.student_schema import (
    DashboardStatsResponse,
    PredictionResponse,
    StudentCreate,
    StudentResponse,
    StudentUpdate,
)
from app.services.ml_service import DropoutMLService

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/students/", response_model=StudentResponse, status_code=status.HTTP_201_CREATED)
def create_student(
    student: StudentCreate,
    db: Session = Depends(get_db),
    _=Depends(require_role("admin")),
):
    db_student = Student(**student.model_dump())
    db.add(db_student)
    db.commit()
    db.refresh(db_student)
    logger.info("Created student record: id=%s", db_student.id)
    return db_student


@router.get("/students/", response_model=list[StudentResponse])
def list_students(
    db: Session = Depends(get_db),
    _=Depends(require_role("admin", "faculty")),
):
    return db.query(Student).order_by(desc(Student.created_at)).all()


@router.get("/students/{student_id}", response_model=StudentResponse)
def get_student(
    student_id: int,
    db: Session = Depends(get_db),
    _=Depends(require_role("admin", "faculty")),
):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return student


@router.put("/students/{student_id}", response_model=StudentResponse)
def update_student(
    student_id: int,
    payload: StudentUpdate,
    db: Session = Depends(get_db),
    _=Depends(require_role("admin", "faculty")),
):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(student, field, value)

    db.commit()
    db.refresh(student)
    logger.info("Updated student record: id=%s", student.id)
    return student


@router.post("/predict/{student_id}", response_model=PredictionResponse)
def predict_dropout(
    student_id: int,
    db: Session = Depends(get_db),
    _=Depends(require_role("admin", "faculty")),
):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    all_students = db.query(Student).all()
    ml_service = DropoutMLService()
    result = ml_service.train_and_predict(all_students, student)

    prediction = Prediction(
        student_id=student.id,
        risk_score=result.risk_score,
        risk_level=result.risk_level,
        prediction_label=result.prediction_label,
        reason_summary=result.reason_summary,
        prediction_date=datetime.utcnow(),
    )
    db.add(prediction)
    db.commit()
    db.refresh(prediction)

    logger.info(
        "Prediction generated: student_id=%s risk_score=%.2f risk_level=%s",
        student.id,
        result.risk_score,
        result.risk_level,
    )

    return PredictionResponse(
        student_id=student.id,
        prediction_label=result.prediction_label,
        risk_score=result.risk_score,
        risk_level=result.risk_level,
        feature_importance=result.feature_importance,
        top_contributing_features=result.top_contributing_features,
        reason_summary=result.reason_summary,
        prediction_date=prediction.prediction_date,
    )


@router.get("/dashboard/stats", response_model=DashboardStatsResponse)
def dashboard_stats(
    db: Session = Depends(get_db),
    _=Depends(require_role("admin", "faculty")),
):
    total_students = db.query(func.count(Student.id)).scalar() or 0
    predictions = db.query(Prediction).order_by(desc(Prediction.prediction_date)).all()

    risk_distribution = defaultdict(int)
    for pred in predictions:
        risk_distribution[pred.risk_level] += 1

    trend_data = defaultdict(int)
    for pred in predictions:
        day = pred.prediction_date.strftime("%Y-%m-%d")
        trend_data[day] += 1

    recent_predictions = []
    for pred in predictions[:10]:
        student = db.query(Student).filter(Student.id == pred.student_id).first()
        recent_predictions.append(
            {
                "student_id": pred.student_id,
                "student_name": student.name if student else "Unknown",
                "risk_score": pred.risk_score,
                "risk_level": pred.risk_level,
                "prediction_date": pred.prediction_date.strftime("%Y-%m-%d %H:%M"),
            }
        )

    return DashboardStatsResponse(
        total_students=total_students,
        at_risk_students=risk_distribution["High Risk"] + risk_distribution["Medium Risk"],
        low_risk_count=risk_distribution["Low Risk"],
        medium_risk_count=risk_distribution["Medium Risk"],
        high_risk_count=risk_distribution["High Risk"],
        risk_distribution={
            "Low Risk": risk_distribution["Low Risk"],
            "Medium Risk": risk_distribution["Medium Risk"],
            "High Risk": risk_distribution["High Risk"],
        },
        trend=[{"date": day, "count": count} for day, count in sorted(trend_data.items())],
        recent_predictions=recent_predictions,
    )
