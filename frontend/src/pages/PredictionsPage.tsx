import { useEffect, useState } from "react";
import { getStudents, runPrediction } from "../api/endpoints";
import type { Prediction, Student } from "../types";

export function PredictionsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [error, setError] = useState<string>("");
  const [isPredicting, setIsPredicting] = useState(false);

  useEffect(() => {
    getStudents()
      .then(setStudents)
      .catch((err: Error) => setError(err.message));
  }, []);

  const triggerPrediction = async () => {
    if (!selectedStudentId) {
      setError("Please select a student first.");
      return;
    }
    setError("");
    setIsPredicting(true);
    try {
      const data = await runPrediction(selectedStudentId);
      setPrediction(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to generate prediction";
      setError(message);
    } finally {
      setIsPredicting(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-slate-200 bg-white p-5">
        <h3 className="mb-4 text-sm font-semibold text-slate-800">Run Dropout Prediction</h3>
        {error && <p className="mb-3 rounded bg-red-50 p-2 text-sm text-red-700">{error}</p>}
        <div className="flex flex-wrap items-center gap-3">
          <select
            className="input max-w-sm"
            onChange={(e) => setSelectedStudentId(Number(e.target.value))}
            defaultValue=""
          >
            <option value="" disabled>
              Select student
            </option>
            {students.map((student) => (
              <option key={student.id} value={student.id}>
                {student.name} - {student.department}
              </option>
            ))}
          </select>
          <button
            onClick={triggerPrediction}
            disabled={isPredicting}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
          >
            {isPredicting ? "Predicting..." : "Predict Risk"}
          </button>
        </div>
      </section>

      {prediction && (
        <section className="rounded-lg border border-slate-200 bg-white p-5">
          <h3 className="mb-4 text-sm font-semibold text-slate-800">Prediction Result</h3>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <div className="rounded-md bg-slate-50 p-3">
              <p className="text-xs text-slate-500">Risk Score</p>
              <p className="text-xl font-semibold text-slate-900">{prediction.risk_score}%</p>
            </div>
            <div className="rounded-md bg-slate-50 p-3">
              <p className="text-xs text-slate-500">Risk Level</p>
              <p className="text-xl font-semibold text-slate-900">{prediction.risk_level}</p>
            </div>
            <div className="rounded-md bg-slate-50 p-3">
              <p className="text-xs text-slate-500">Label</p>
              <p className="text-xl font-semibold text-slate-900">{prediction.prediction_label}</p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div>
              <h4 className="mb-2 text-sm font-semibold text-slate-800">Top Contributing Features</h4>
              <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">
                {prediction.top_contributing_features.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="mb-2 text-sm font-semibold text-slate-800">Feature Importance</h4>
              <div className="space-y-2">
                {Object.entries(prediction.feature_importance).map(([name, value]) => (
                  <div key={name}>
                    <div className="mb-1 flex justify-between text-xs text-slate-600">
                      <span>{name}</span>
                      <span>{Math.round(value * 100)}%</span>
                    </div>
                    <div className="h-2 rounded bg-slate-200">
                      <div className="h-2 rounded bg-blue-600" style={{ width: `${Math.round(value * 100)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <p className="mt-4 rounded bg-amber-50 p-3 text-sm text-amber-800">{prediction.reason_summary}</p>
        </section>
      )}
    </div>
  );
}
