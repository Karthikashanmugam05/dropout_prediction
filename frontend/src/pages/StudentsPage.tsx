import { FormEvent, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { createStudent, getStudents } from "../api/endpoints";
import { getRole } from "../auth";
import type { Student } from "../types";

const defaultForm = {
  name: "",
  age: 18,
  department: "Computer Science",
  attendance: 75,
  marks: 70,
  assignments_completed: 80,
  library_usage: 50,
  fee_status: "on_time" as const,
  engagement_score: 65,
};

export function StudentsPage() {
  const role = getRole() || "faculty";
  const [students, setStudents] = useState<Student[]>([]);
  const [formData, setFormData] = useState(defaultForm);
  const [error, setError] = useState("");

  const loadStudents = () =>
    getStudents()
      .then(setStudents)
      .catch((err: Error) => setError(err.message));

  useEffect(() => {
    loadStudents();
  }, []);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    try {
      await createStudent(formData);
      setFormData(defaultForm);
      loadStudents();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create student");
    }
  };

  return (
    <div className="space-y-6">
      {error && <p className="rounded bg-red-50 p-2 text-sm text-red-700">{error}</p>}
      {role === "admin" && (
        <section className="rounded-lg border border-slate-200 bg-white p-4">
        <h3 className="mb-4 text-sm font-semibold text-slate-800">Add Student Record</h3>
        <form onSubmit={onSubmit} className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <input className="input" placeholder="Student name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
          <input className="input" type="number" placeholder="Age" value={formData.age} onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })} required />
          <input className="input" placeholder="Department" value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} required />
          <input className="input" type="number" placeholder="Attendance %" value={formData.attendance} onChange={(e) => setFormData({ ...formData, attendance: Number(e.target.value) })} />
          <input className="input" type="number" placeholder="Marks" value={formData.marks} onChange={(e) => setFormData({ ...formData, marks: Number(e.target.value) })} />
          <input className="input" type="number" placeholder="Assignment Completion %" value={formData.assignments_completed} onChange={(e) => setFormData({ ...formData, assignments_completed: Number(e.target.value) })} />
          <input className="input" type="number" placeholder="Library Usage" value={formData.library_usage} onChange={(e) => setFormData({ ...formData, library_usage: Number(e.target.value) })} />
          <select className="input" value={formData.fee_status} onChange={(e) => setFormData({ ...formData, fee_status: e.target.value as "on_time" | "late" | "very_late" })}>
            <option value="on_time">On Time</option>
            <option value="late">Late</option>
            <option value="very_late">Very Late</option>
          </select>
          <input className="input" type="number" placeholder="Engagement Score" value={formData.engagement_score} onChange={(e) => setFormData({ ...formData, engagement_score: Number(e.target.value) })} />
          <button className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">Save Student</button>
        </form>
      </section>
      )}

      <section className="rounded-lg border border-slate-200 bg-white p-4">
        <h3 className="mb-3 text-sm font-semibold text-slate-800">Student Records</h3>
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-slate-200 text-slate-500">
            <tr>
              <th className="py-2">Name</th>
              <th className="py-2">Department</th>
              <th className="py-2">Attendance</th>
              <th className="py-2">Marks</th>
              <th className="py-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student.id} className="border-b border-slate-100">
                <td className="py-2">{student.name}</td>
                <td className="py-2">{student.department}</td>
                <td className="py-2">{student.attendance}%</td>
                <td className="py-2">{student.marks}</td>
                <td className="py-2">
                  <Link className="text-blue-600 hover:text-blue-800" to={`/students/${student.id}`}>
                    View Profile
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
