import { useEffect, useState } from "react";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useParams } from "react-router-dom";
import { getStudentById, runPrediction } from "../api/endpoints";
import type { Prediction, Student } from "../types";

export function StudentDetailPage() {
  const { id } = useParams();
  const [student, setStudent] = useState<Student | null>(null);
  const [prediction, setPrediction] = useState<Prediction | null>(null);

  useEffect(() => {
    if (!id) return;
    getStudentById(id).then(setStudent).catch(console.error);
  }, [id]);

  const history = student
    ? [
        { label: "Attendance", value: student.attendance },
        { label: "Marks", value: student.marks },
        { label: "Assignments", value: student.assignments_completed },
        { label: "Library", value: student.library_usage },
        { label: "Engagement", value: student.engagement_score },
      ]
    : [];

  return (
    <div className="space-y-6">
      {!student ? (
        <p className="text-sm text-slate-500">Loading student profile...</p>
      ) : (
        <>
          <section className="rounded-lg border border-slate-200 bg-white p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">{student.name}</h3>
                <p className="text-sm text-slate-600">
                  {student.department} | Age {student.age}
                </p>
              </div>
              <button
                onClick={async () => setPrediction(await runPrediction(student.id))}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Generate Prediction
              </button>
            </div>
          </section>

          {prediction && (
            <section className="rounded-lg border border-slate-200 bg-white p-5">
              <h4 className="mb-3 text-sm font-semibold text-slate-800">Risk Assessment</h4>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-md bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">Risk Score</p>
                  <p className="text-xl font-semibold">{prediction.risk_score}%</p>
                </div>
                <div className="rounded-md bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">Risk Level</p>
                  <p className="text-xl font-semibold">{prediction.risk_level}</p>
                </div>
                <div className="rounded-md bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">Prediction Label</p>
                  <p className="text-xl font-semibold">{prediction.prediction_label}</p>
                </div>
              </div>
              <p className="mt-4 rounded bg-amber-50 p-3 text-sm text-amber-800">{prediction.reason_summary}</p>
            </section>
          )}

          <section className="rounded-lg border border-slate-200 bg-white p-5">
            <h4 className="mb-3 text-sm font-semibold text-slate-800">Academic Performance Timeline</h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={history}>
                  <XAxis dataKey="label" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
