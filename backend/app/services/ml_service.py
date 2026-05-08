from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, List

import numpy as np
import pandas as pd
from sklearn.cluster import KMeans
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

from app.db.models import Student


FEATURE_COLUMNS = [
    "attendance_percentage",
    "exam_average",
    "assignment_completion_rate",
    "library_usage",
    "fee_payment_delay",
    "engagement_score",
    "department",
]

NUMERIC_FEATURES = [
    "attendance_percentage",
    "exam_average",
    "assignment_completion_rate",
    "library_usage",
    "fee_payment_delay",
    "engagement_score",
]
CATEGORICAL_FEATURES = ["department"]


@dataclass
class PredictionResult:
    prediction_label: str
    risk_score: float
    risk_level: str
    feature_importance: Dict[str, float]
    top_contributing_features: List[str]
    reason_summary: str


def _fee_delay_from_status(fee_status: str) -> int:
    mapper = {"on_time": 0, "late": 1, "very_late": 2}
    return mapper.get(fee_status, 1)


def _student_to_feature_row(student: Student) -> Dict:
    return {
        "attendance_percentage": student.attendance,
        "exam_average": student.marks,
        "assignment_completion_rate": student.assignments_completed,
        "library_usage": student.library_usage,
        "fee_payment_delay": _fee_delay_from_status(student.fee_status),
        "engagement_score": student.engagement_score,
        "department": student.department,
    }


def _heuristic_label(row: pd.Series) -> int:
    risk_signals = 0
    risk_signals += 1 if row["attendance_percentage"] < 65 else 0
    risk_signals += 1 if row["exam_average"] < 50 else 0
    risk_signals += 1 if row["assignment_completion_rate"] < 60 else 0
    risk_signals += 1 if row["engagement_score"] < 45 else 0
    risk_signals += 1 if row["fee_payment_delay"] >= 1 else 0
    return 1 if risk_signals >= 2 else 0


def _heuristic_probability(row: Dict) -> float:
    score = 0.0
    score += 0.28 if row["attendance_percentage"] < 65 else 0.0
    score += 0.26 if row["exam_average"] < 50 else 0.0
    score += 0.18 if row["assignment_completion_rate"] < 60 else 0.0
    score += 0.12 if row["engagement_score"] < 45 else 0.0
    score += 0.16 if row["fee_payment_delay"] >= 1 else 0.0
    return min(max(score, 0.05), 0.95)


class DropoutMLService:
    def __init__(self):
        self.preprocessor = ColumnTransformer(
            transformers=[
                (
                    "num",
                    Pipeline(
                        steps=[
                            ("imputer", SimpleImputer(strategy="median")),
                            ("scaler", StandardScaler()),
                        ]
                    ),
                    NUMERIC_FEATURES,
                ),
                (
                    "cat",
                    Pipeline(
                        steps=[
                            ("imputer", SimpleImputer(strategy="most_frequent")),
                            ("onehot", OneHotEncoder(handle_unknown="ignore")),
                        ]
                    ),
                    CATEGORICAL_FEATURES,
                ),
            ]
        )
        self.model = RandomForestClassifier(
            n_estimators=250, max_depth=8, min_samples_split=5, random_state=42
        )
        self.kmeans: KMeans | None = None

    def train_and_predict(self, students: List[Student], target_student: Student) -> PredictionResult:
        rows = [_student_to_feature_row(student) for student in students]
        df = pd.DataFrame(rows if rows else [_student_to_feature_row(target_student)])

        if "department" not in df.columns:
            df["department"] = target_student.department

        y = df.apply(_heuristic_label, axis=1).values
        if len(set(y.tolist())) == 1:
            y[0] = 1 - y[0]

        preprocessed = self.preprocessor.fit_transform(df[FEATURE_COLUMNS])

        sample_count = df.shape[0]
        cluster_count = min(3, sample_count)
        if cluster_count >= 2:
            self.kmeans = KMeans(n_clusters=cluster_count, random_state=42, n_init=10)
            self.kmeans.fit(preprocessed)
        else:
            self.kmeans = None

        self.model.fit(preprocessed, y)

        target_df = pd.DataFrame([_student_to_feature_row(target_student)])
        target_processed = self.preprocessor.transform(target_df[FEATURE_COLUMNS])

        class_probabilities = self.model.predict_proba(target_processed)[0]
        model_classes = list(self.model.classes_)
        if 1 in model_classes:
            class_one_idx = model_classes.index(1)
            prob_dropout = float(class_probabilities[class_one_idx])
        else:
            # With very small datasets RF can train on a single class only.
            # Fall back to deterministic heuristic probability for stable behavior.
            prob_dropout = _heuristic_probability(_student_to_feature_row(target_student))
        risk_score = round(prob_dropout * 100, 2)

        risk_level = self._risk_by_threshold(risk_score)
        if self.kmeans is not None:
            cluster_idx = int(self.kmeans.predict(target_processed)[0])
            risk_by_cluster = self._map_cluster_to_risk_label()
            risk_level = risk_by_cluster.get(cluster_idx, risk_level)

        top_contributing_features = self._top_feature_signals(target_student)
        reason_summary = " + ".join(top_contributing_features[:3]) + " contributed to risk level"
        prediction_label = "dropout_risk" if prob_dropout >= 0.5 else "stable"

        return PredictionResult(
            prediction_label=prediction_label,
            risk_score=risk_score,
            risk_level=risk_level,
            feature_importance=self._feature_importance(),
            top_contributing_features=top_contributing_features,
            reason_summary=reason_summary,
        )

    def _feature_importance(self) -> Dict[str, float]:
        importances = self.model.feature_importances_
        names = self.preprocessor.get_feature_names_out()
        paired = sorted(zip(names, importances), key=lambda x: x[1], reverse=True)[:8]
        cleaned = {name.replace("num__", "").replace("cat__", ""): round(float(score), 4) for name, score in paired}
        return cleaned

    def _top_feature_signals(self, student: Student) -> List[str]:
        signals: list[str] = []
        if student.attendance < 70:
            signals.append("Low attendance")
        if student.marks < 55:
            signals.append("Low exam score")
        if student.assignments_completed < 65:
            signals.append("Poor assignment completion")
        if student.fee_status in {"late", "very_late"}:
            signals.append("Fee payment delays")
        if student.engagement_score < 50:
            signals.append("Low engagement score")
        if not signals:
            signals.append("Consistent academic performance")
        return signals

    def _map_cluster_to_risk_label(self) -> Dict[int, str]:
        if self.kmeans is None:
            return {}

        centers = self.kmeans.cluster_centers_
        scaled_risk_axis = NUMERIC_FEATURES.index("attendance_percentage")
        attendance_values = centers[:, scaled_risk_axis]
        ordered_clusters = np.argsort(attendance_values)

        if len(ordered_clusters) == 2:
            return {
                int(ordered_clusters[0]): "High Risk",
                int(ordered_clusters[1]): "Low Risk",
            }

        return {
            int(ordered_clusters[0]): "High Risk",
            int(ordered_clusters[1]): "Medium Risk",
            int(ordered_clusters[2]): "Low Risk",
        }

    def _risk_by_threshold(self, risk_score: float) -> str:
        if risk_score >= 70:
            return "High Risk"
        if risk_score >= 40:
            return "Medium Risk"
        return "Low Risk"
