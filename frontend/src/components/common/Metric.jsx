export function Metric({ label, value, tone }) {
  return (
    <div className="border border-slate-200 bg-white p-2">
      <div className={`mb-2 h-1.5 w-8 ${tone}`} />
      <p className="text-lg font-semibold">{value}</p>
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  );
}
