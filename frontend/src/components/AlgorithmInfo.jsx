import { ArrowRight, Gauge, Layers3, Route } from 'lucide-react';
import { algorithmSteps } from '../data/cities';

export default function AlgorithmInfo() {
  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-soft sm:p-7">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100 text-sky-700">
          <Route className="h-5 w-5" />
        </div>
        <h3 className="text-2xl font-bold tracking-tight text-slate-900">Dijkstra's Algorithm</h3>
      </div>

      <p className="text-base text-slate-600">
        Dijkstra's Algorithm explores the weighted graph and determines the minimum-cost path from the selected source to the destination.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {algorithmSteps.map((step, index) => (
          <div key={step} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-[0.12em] text-sky-700">
                Step {index + 1}
              </span>
              {index < algorithmSteps.length - 1 && (
                <ArrowRight className="h-4 w-4 text-slate-400" />
              )}
            </div>
            <div className="mt-3 text-lg font-semibold text-slate-900">{step}</div>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.12em] text-slate-600">
            <Gauge className="h-4 w-4 text-sky-600" />
            Time Complexity
          </div>
          <div className="text-xl font-bold text-slate-900">O((V + E) log V)</div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.12em] text-slate-600">
            <Layers3 className="h-4 w-4 text-sky-600" />
            Space Complexity
          </div>
          <div className="text-xl font-bold text-slate-900">O(V + E)</div>
        </div>
      </div>
    </section>
  );
}
