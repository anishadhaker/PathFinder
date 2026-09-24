import React from 'react';
import {
  CheckCircle2,
  Compass,
  MapPin,
  Clock3,
  ListOrdered,
  RotateCcw,
  Sparkles,
  Route as RouteIcon,
  ChevronRight,
} from 'lucide-react';

export default function RouteResultCard({
  routeResult,
  onOpenDetails,
  onExploreNearby,
  onResetRoute,
  darkMode = false,
}) {
  if (!routeResult) return null;

  return (
    <div className="fixed bottom-5 left-4 right-4 sm:left-auto sm:right-6 sm:w-[540px] z-30 animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className="overflow-hidden rounded-3xl border border-slate-200/90 bg-white/95 p-5 shadow-2xl backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95">
        {/* Top Header & Status */}
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-md shadow-emerald-500/25">
              <CheckCircle2 className="h-4 w-4" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white">
                  Optimal Route
                </h3>
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:border-emerald-800/60 dark:bg-emerald-950/60 dark:text-emerald-300">
                  Shortest Path Found
                </span>
              </div>
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                Calculated via Dijkstra's Algorithm
              </p>
            </div>
          </div>

          <div className="text-right">
            <div className="text-2xl font-black text-sky-600 dark:text-sky-400 leading-tight">
              {routeResult.distance} <span className="text-sm font-semibold">km</span>
            </div>
            <div className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
              Total Distance
            </div>
          </div>
        </div>

        {/* Route Path Display with Visual Arrows */}
        <div className="mt-3.5 flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none">
          {routeResult.path.map((city, idx) => {
            const isFirst = idx === 0;
            const isLast = idx === routeResult.path.length - 1;

            return (
              <React.Fragment key={city}>
                <div
                  className={`flex items-center gap-1.5 rounded-xl px-2.5 py-1 text-xs font-bold shrink-0 ${
                    isFirst
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                      : isLast
                      ? 'bg-violet-50 text-violet-700 border border-violet-200 dark:bg-violet-950/60 dark:text-violet-300 dark:border-violet-800'
                      : 'bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                  }`}
                >
                  <span
                    className={`h-2 w-2 rounded-full ${
                      isFirst ? 'bg-emerald-500' : isLast ? 'bg-violet-500' : 'bg-sky-500'
                    }`}
                  />
                  <span>{city}</span>
                </div>

                {idx < routeResult.path.length - 1 && (
                  <div className="flex flex-col items-center shrink-0 px-1">
                    <span className="text-[9px] font-bold text-sky-600 dark:text-sky-400">
                      {routeResult.segments[idx]?.distance} km
                    </span>
                    <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Key Stats Chips */}
        <div className="mt-3.5 grid grid-cols-3 gap-2">
          <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-2.5 text-center dark:border-slate-800 dark:bg-slate-850/50">
            <div className="flex items-center justify-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              <Compass className="h-3 w-3 text-sky-500" />
              Route Stops
            </div>
            <div className="mt-1 text-sm font-extrabold text-slate-800 dark:text-slate-100">
              {routeResult.stopsCount} Locations
            </div>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-2.5 text-center dark:border-slate-800 dark:bg-slate-850/50">
            <div className="flex items-center justify-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              <Clock3 className="h-3 w-3 text-sky-500" />
              Est. Time
            </div>
            <div className="mt-1 text-sm font-extrabold text-slate-800 dark:text-slate-100">
              {routeResult.travelTime}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-2.5 text-center dark:border-slate-800 dark:bg-slate-850/50">
            <div className="flex items-center justify-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              <Sparkles className="h-3 w-3 text-sky-500" />
              Algorithm
            </div>
            <div className="mt-1 text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
              Dijkstra
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="mt-3.5 flex flex-wrap items-center gap-2 pt-1">
          <button
            type="button"
            onClick={onOpenDetails}
            className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 px-3 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
          >
            <ListOrdered className="h-3.5 w-3.5" />
            Route Details
          </button>

          <button
            type="button"
            onClick={onExploreNearby}
            className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-sky-200 bg-sky-50 px-3 py-2 text-xs font-bold text-sky-700 transition hover:bg-sky-100 dark:border-sky-800 dark:bg-sky-950/60 dark:text-sky-300"
          >
            <MapPin className="h-3.5 w-3.5" />
            Explore Nearby
          </button>

          <button
            type="button"
            onClick={onResetRoute}
            className="inline-flex items-center justify-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
            title="Reset Route"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}
