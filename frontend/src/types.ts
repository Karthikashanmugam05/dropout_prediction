export type Student = {
  id: number;
  name: string;
  age: number;
  department: string;
  attendance: number;
  marks: number;
  assignments_completed: number;
  library_usage: number;
  fee_status: "on_time" | "late" | "very_late";
  engagement_score: number;
  created_at: string;
};

export type Prediction = {
  student_id: number;
  prediction_label: "dropout_risk" | "stable";
  risk_score: number;
  risk_level: "Low Risk" | "Medium Risk" | "High Risk";
  feature_importance: Record<string, number>;
  top_contributing_features: string[];
  reason_summary: string;
  prediction_date: string;
};

export type DashboardStats = {
  total_students: number;
  at_risk_students: number;
  low_risk_count: number;
  medium_risk_count: number;
  high_risk_count: number;
  risk_distribution: Record<string, number>;
  trend: { date: string; count: number }[];
  recent_predictions: {
    student_id: number;
    student_name: string;
    risk_score: number;
    risk_level: string;
    prediction_date: string;
  }[];
};
