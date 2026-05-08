import type { PropsWithChildren } from "react";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";

type LayoutProps = PropsWithChildren<{
  role: string;
  onLogout: () => void;
}>;

export function Layout({ children, role, onLogout }: LayoutProps) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <TopBar role={role} onLogout={onLogout} />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
