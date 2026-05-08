import { useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { clearAuth, getRole, getToken } from "./auth";
import { Layout } from "./components/Layout";
import { AnalyticsPage } from "./pages/AnalyticsPage";
import { DashboardPage } from "./pages/DashboardPage";
import { LoginPage } from "./pages/LoginPage";
import { PredictionsPage } from "./pages/PredictionsPage";
import { StudentDetailPage } from "./pages/StudentDetailPage";
import { StudentsPage } from "./pages/StudentsPage";

function App() {
  const [isAuthed, setIsAuthed] = useState(Boolean(getToken()));
  const role = getRole() || "faculty";

  if (!isAuthed) {
    return <LoginPage onLogin={() => setIsAuthed(true)} />;
  }

  return (
    <Layout
      role={role}
      onLogout={() => {
        clearAuth();
        setIsAuthed(false);
      }}
    >
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/students" element={<StudentsPage />} />
        <Route path="/students/:id" element={<StudentDetailPage />} />
        <Route path="/predictions" element={<PredictionsPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

export default App;
