import { ArrowRightLeft, Navigation, Route } from 'lucide-react';

export default function RouteSelector({
  source,
  destination,
  cities,
  onSourceChange,
  onDestinationChange,
  onSwap,
  onSearch,
  loading,
  hasError,
  errorMessage,
}) {
  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-soft sm:p-7">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Find Shortest Route</h2>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-medium text-slate-600">
          <Route className="h-4 w-4 text-sky-600" />
          Live query
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_auto_1fr] lg:items-end">
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-700">Starting Location</label>
          <select
            value={source}
            onChange={(e) => onSourceChange(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-base text-slate-800 transition focus:border-sky-400 focus:bg-white"
          >
            <option value="">Select source</option>
            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={onSwap}
          className="flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-600 transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700"
          aria-label="Swap route ends"
        >
          <ArrowRightLeft className="h-5 w-5" />
        </button>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-700">Destination</label>
          <select
            value={destination}
            onChange={(e) => onDestinationChange(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-base text-slate-800 transition focus:border-sky-400 focus:bg-white"
          >
            <option value="">Select destination</option>
            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>
      </div>

      {hasError && (
        <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {errorMessage}
        </div>
      )}

      <button
        type="button"
        onClick={onSearch}
        disabled={loading}
        className="mt-6 inline-flex w-full items-center justify-center gap-3 rounded-2xl bg-slate-900 px-5 py-3.5 text-base font-semibold text-white shadow-lg shadow-slate-900/10 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
      >
        <Navigation className="h-5 w-5" />
        {loading ? 'Calculating optimal route...' : 'Find Shortest Path'}
      </button>
    </section>
  );
}
