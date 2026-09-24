import { BarChart3, MapPinned, Route, Zap } from 'lucide-react';

const stats = [
  { label: 'Total Locations', value: '10', icon: MapPinned },
  { label: 'Total Roads', value: '15+', icon: Route },
  { label: 'Shortest Distance', value: '395 km', icon: Zap },
  { label: 'Algorithm', value: 'Dijkstra', icon: BarChart3 },
];

export default function StatisticsCards() {
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {stats.map(({ label, value, icon: Icon }) => (
        <div key={label} className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-soft">
          <div className="flex items-center justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-100 text-sky-700">
              <Icon className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-5 text-sm uppercase tracking-[0.12em] text-slate-500">{label}</div>
          <div className="mt-2 text-2xl font-bold text-slate-900">{value}</div>
        </div>
      ))}
    </section>
  );
}
