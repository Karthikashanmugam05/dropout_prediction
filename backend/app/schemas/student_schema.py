from datetime import datetime
from typing import Dict, List, Literal, Optional

from pydantic import BaseModel, Field


class StudentBase(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    age: int = Field(ge=15, le=100)
    department: str = Field(min_length=2, max_length=80)
    attendance: float = Field(ge=0, le=100)
    marks: float = Field(ge=0, le=100)
    assignments_completed: float = Field(ge=0, le=100)
    library_usage: float = Field(ge=0, le=100, default=0)
    fee_status: Literal["on_time", "late", "very_late"] = "on_time"
    engagement_score: float = Field(ge=0, le=100, default=50)


class StudentCreate(StudentBase):
    pass


class StudentUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=2, max_length=120)
    age: Optional[int] = Field(default=None, ge=15, le=100)
    department: Optional[str] = Field(default=None, min_length=2, max_length=80)
    attendance: Optional[float] = Field(default=None, ge=0, le=100)
    marks: Optional[float] = Field(default=None, ge=0, le=100)
    assignments_completed: Optional[float] = Field(default=None, ge=0, le=100)
    library_usage: Optional[float] = Field(default=None, ge=0, le=100)
    fee_status: Optional[Literal["on_time", "late", "very_late"]] = None
    engagement_score: Optional[float] = Field(default=None, ge=0, le=100)


class StudentResponse(StudentBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class PredictionResponse(BaseModel):
    student_id: int
    prediction_label: Literal["dropout_risk", "stable"]
    risk_score: float
    risk_level: Literal["Low Risk", "Medium Risk", "High Risk"]
    feature_importance: Dict[str, float]
    top_contributing_features: List[str]
    reason_summary: str
    prediction_date: datetime


class DashboardStatsResponse(BaseModel):
    total_students: int
    at_risk_students: int
    low_risk_count: int
    medium_risk_count: int
    high_risk_count: int
    risk_distribution: Dict[str, int]
    trend: List[Dict[str, int]]
    recent_predictions: List[Dict[str, str | int | float]]
