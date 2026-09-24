import { Activity, Route, Sparkles } from 'lucide-react';

export default function HeroHeader() {
  return (
    <section className="mt-8 rounded-[28px] border border-slate-200 bg-white p-6 shadow-soft sm:p-8">
      <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Algorithm Ready
            </span>
          </div>

          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Shortest Path Navigation System
            </h1>
            <p className="mt-3 max-w-2xl text-base text-slate-600 sm:text-lg">
              Find the optimal route through a weighted city network using Dijkstra's Algorithm.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:min-w-[420px]">
          {[
            { label: 'Locations', value: '10' },
            { label: 'Roads', value: '15+' },
            { label: 'Algorithm', value: 'Dijkstra' },
            { label: 'Status', value: 'Ready' },
          ].map((item) => (
            <div key={item.label} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
              <div className="text-xs uppercase tracking-[0.14em] text-slate-500">{item.label}</div>
              <div className="mt-2 text-lg font-bold text-slate-900">{item.value}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
