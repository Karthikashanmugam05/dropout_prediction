type StatCardProps = {
  label: string;
  value: number | string;
  accent?: "blue" | "red" | "amber" | "green";
};

const colorMap = {
  blue: "border-blue-200 bg-blue-50 text-blue-700",
  red: "border-red-200 bg-red-50 text-red-700",
  amber: "border-amber-200 bg-amber-50 text-amber-700",
  green: "border-green-200 bg-green-50 text-green-700",
};

export function StatCard({ label, value, accent = "blue" }: StatCardProps) {
  return (
    <div className={`rounded-lg border p-4 ${colorMap[accent]}`}>
      <p className="text-xs font-medium uppercase tracking-wide">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </div>
  );
}
