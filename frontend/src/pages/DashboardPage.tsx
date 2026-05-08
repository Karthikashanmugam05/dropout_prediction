import { useEffect, useState } from "react";
import { Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { getDashboardStats } from "../api/endpoints";
import { StatCard } from "../components/StatCard";
import type { DashboardStats } from "../types";

const pieColors = ["#22c55e", "#f59e0b", "#ef4444"];

export function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    getDashboardStats()
      .then(setStats)
      .catch((err: Error) => setError(err.message));
  }, []);

  if (error) {
    return <div className="rounded bg-red-50 p-3 text-sm text-red-700">{error}</div>;
  }

  if (!stats) {
    return <div className="text-sm text-slate-500">Loading dashboard analytics...</div>;
  }

  const pieData = Object.entries(stats.risk_distribution).map(([name, value]) => ({ name, value }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <StatCard label="Total Students" value={stats.total_students} accent="blue" />
        <StatCard label="At-Risk Students" value={stats.at_risk_students} accent="red" />
        <StatCard label="High Risk" value={stats.high_risk_count} accent="amber" />
        <StatCard label="Low Risk" value={stats.low_risk_count} accent="green" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h3 className="mb-4 text-sm font-semibold text-slate-800">Risk Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={90}>
                  {pieData.map((entry, index) => (
                    <Cell key={entry.name} fill={pieColors[index % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h3 className="mb-4 text-sm font-semibold text-slate-800">Prediction Trend</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.trend}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#2563eb" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <h3 className="mb-3 text-sm font-semibold text-slate-800">Recent Predictions</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-slate-500">
              <tr>
                <th className="py-2">Student</th>
                <th className="py-2">Risk Score</th>
                <th className="py-2">Risk Level</th>
                <th className="py-2">Prediction Date</th>
              </tr>
            </thead>
            <tbody>
              {stats.recent_predictions.map((item) => (
                <tr key={`${item.student_id}-${item.prediction_date}`} className="border-b border-slate-100">
                  <td className="py-2">{item.student_name}</td>
                  <td className="py-2">{item.risk_score}%</td>
                  <td className="py-2">{item.risk_level}</td>
                  <td className="py-2">{item.prediction_date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
