import { api } from "./client";
import type { DashboardStats, Prediction, Student } from "../types";

export const getStudents = async () => {
  const { data } = await api.get<Student[]>("/students/");
  return data;
};

export const getStudentById = async (id: string) => {
  const { data } = await api.get<Student>(`/students/${id}`);
  return data;
};

export const createStudent = async (payload: Omit<Student, "id" | "created_at">) => {
  const { data } = await api.post<Student>("/students/", payload);
  return data;
};

export const runPrediction = async (studentId: number) => {
  const { data } = await api.post<Prediction>(`/predict/${studentId}`);
  return data;
};

export const getDashboardStats = async () => {
  const { data } = await api.get<DashboardStats>("/dashboard/stats");
  return data;
};

export const login = async (payload: { username: string; password: string }) => {
  const { data } = await api.post<{ access_token: string; token_type: string; role: string }>(
    "/auth/login",
    payload
  );
  return data;
};
