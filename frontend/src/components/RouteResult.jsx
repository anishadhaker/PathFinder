import { CheckCircle2, Clock3, Compass, MapPinned, Route } from 'lucide-react';

export default function RouteResult({ result, onDetails, onReset }) {
  if (!result) {
    return (
      <section className="rounded-[28px] border border-dashed border-slate-300 bg-slate-50/80 p-8 text-center shadow-soft">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-sky-100 text-sky-600">
          <Route className="h-6 w-6" />
        </div>
        <h3 className="mt-5 text-xl font-semibold text-slate-800">Select locations to find the shortest route.</h3>
        <p className="mt-2 text-sm text-slate-500">Choose a starting point and destination to discover the optimal route.</p>
      </section>
    );
  }

  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-soft sm:p-7">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-slate-900">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <h3 className="text-2xl font-bold tracking-tight">Shortest Route Found</h3>
        </div>
        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-emerald-700">
          Optimal Route
        </span>
      </div>

      <div className="space-y-5">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="text-xs uppercase tracking-[0.12em] text-slate-500">Route</div>
          <div className="mt-2 flex items-center gap-2 text-lg font-semibold text-slate-900">
            <span>{result.path.join(' → ')}</span>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.12em] text-slate-500">
              <Compass className="h-4 w-4 text-sky-600" />
              Total Distance
            </div>
            <div className="mt-3 text-2xl font-bold text-slate-900">{result.distance} km</div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.12em] text-slate-500">
              <MapPinned className="h-4 w-4 text-sky-600" />
              Nodes Visited
            </div>
            <div className="mt-3 text-2xl font-bold text-slate-900">{result.nodesVisited}</div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.12em] text-slate-500">
              <Clock3 className="h-4 w-4 text-sky-600" />
              Estimated Travel Time
            </div>
            <div className="mt-3 text-2xl font-bold text-slate-900">{result.travelTime}</div>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onDetails}
            className="flex-1 rounded-2xl border border-slate-200 bg-slate-900 px-4 py-3 font-semibold text-white transition hover:bg-slate-800"
          >
            View Route Details
          </button>
          <button
            type="button"
            onClick={onReset}
            className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
          >
            Try Another Route
          </button>
        </div>
      </div>
    </section>
  );
}
