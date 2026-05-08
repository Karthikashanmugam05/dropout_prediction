type TopBarProps = {
  role: string;
  onLogout: () => void;
};

export function TopBar({ role, onLogout }: TopBarProps) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
      <div>
        <h2 className="text-sm font-semibold text-slate-800">Student Dropout Prediction Platform</h2>
        <p className="text-xs text-slate-500">Institution-level risk intelligence dashboard</p>
      </div>
      <div className="flex items-center gap-2">
        <div className="rounded-md bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
          {role === "admin" ? "Admin View" : "Faculty View"}
        </div>
        <button onClick={onLogout} className="rounded-md border border-slate-300 px-3 py-1 text-xs text-slate-600 hover:bg-slate-100">
          Logout
        </button>
      </div>
    </header>
  );
}
