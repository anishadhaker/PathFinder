import React from 'react';
import {
  X,
  Navigation,
  MapPin,
  Compass,
  Clock,
  Sparkles,
  CheckCircle2,
  BookOpen,
  ArrowRight,
  Route,
} from 'lucide-react';

export default function RouteDetailsDrawer({ isOpen, onClose, routeResult, darkMode = false }) {
  if (!isOpen || !routeResult) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer / Modal Container */}
      <div className="relative z-10 flex flex-col w-full max-w-xl max-h-[88vh] overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 p-5 pb-4 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-600 dark:bg-sky-500/20 dark:text-sky-400">
              <Route className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Turn-by-Turn Route Itinerary
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Segment Breakdown & Algorithm Analytics
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">
          {/* Summary Banner */}
          <div className="rounded-2xl border border-sky-100 bg-gradient-to-r from-sky-50 to-indigo-50/50 p-4 dark:border-sky-900/40 dark:from-sky-950/40 dark:to-indigo-950/30">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Total Distance
                </span>
                <div className="mt-0.5 text-xl font-black text-sky-600 dark:text-sky-400">
                  {routeResult.distance} km
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Total Stops
                </span>
                <div className="mt-0.5 text-xl font-black text-slate-800 dark:text-slate-200">
                  {routeResult.stopsCount}
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Est. Travel Time
                </span>
                <div className="mt-0.5 text-xl font-black text-slate-800 dark:text-slate-200">
                  {routeResult.travelTime}
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Algorithm
                </span>
                <div className="mt-0.5 text-xs font-black text-emerald-600 dark:text-emerald-400 mt-2">
                  Dijkstra
                </div>
              </div>
            </div>
          </div>

          {/* Turn by turn segments */}
          <div>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Navigation Steps
            </h3>

            <div className="relative pl-6 space-y-4">
              {/* Vertical connector track */}
              <div className="absolute left-2.5 top-3 bottom-3 w-0.5 bg-slate-200 dark:bg-slate-800" />

              {/* 1. Start Step */}
              <div className="relative flex items-start gap-3">
                <span className="absolute -left-6 mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-white ring-4 ring-white dark:ring-slate-900">
                  A
                </span>
                <div className="flex-1 rounded-2xl border border-slate-100 bg-slate-50/80 p-3.5 dark:border-slate-800 dark:bg-slate-800/60">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      Step 1 • Starting Point
                    </span>
                    <span className="text-[10px] font-medium text-slate-400">0 km</span>
                  </div>
                  <div className="mt-1 text-base font-extrabold text-slate-900 dark:text-white">
                    Start at {routeResult.source}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Depart from initial transit node and join highway corridor.
                  </p>
                </div>
              </div>

              {/* Intermediate Segments */}
              {routeResult.segments.map((seg, idx) => (
                <div key={idx} className="relative flex items-start gap-3">
                  <span className="absolute -left-6 mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-sky-500 text-[10px] font-bold text-white ring-4 ring-white dark:ring-slate-900">
                    {idx + 2}
                  </span>
                  <div className="flex-1 rounded-2xl border border-slate-100 bg-white p-3.5 shadow-sm dark:border-slate-800 dark:bg-slate-800/90">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-sky-600 dark:text-sky-400">
                        Step {idx + 2} • Highway Transit
                      </span>
                      <span className="rounded-md bg-sky-50 px-2 py-0.5 text-xs font-black text-sky-700 dark:bg-sky-950/60 dark:text-sky-300">
                        {seg.distance} km
                      </span>
                    </div>

                    <div className="mt-1 flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                      <span>{seg.from}</span>
                      <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
                      <span>{seg.to}</span>
                    </div>

                    <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      Via <span className="font-semibold text-slate-700 dark:text-slate-300">{seg.routeName}</span>
                    </div>
                  </div>
                </div>
              ))}

              {/* Final Destination Step */}
              <div className="relative flex items-start gap-3">
                <span className="absolute -left-6 mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-violet-500 text-[10px] font-bold text-white ring-4 ring-white dark:ring-slate-900">
                  B
                </span>
                <div className="flex-1 rounded-2xl border border-violet-100 bg-violet-50/60 p-3.5 dark:border-violet-900/40 dark:bg-violet-950/30">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-violet-600 dark:text-violet-400">
                      Step {routeResult.segments.length + 2} • Final Arrival
                    </span>
                    <span className="text-xs font-black text-violet-700 dark:text-violet-300">
                      Total: {routeResult.distance} km
                    </span>
                  </div>
                  <div className="mt-1 text-base font-extrabold text-slate-900 dark:text-white">
                    Arrive at {routeResult.destination}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Target destination reached along optimal graph route.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Academic & Viva Section */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-850/70">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
              <BookOpen className="h-4 w-4 text-indigo-500" />
              <span>B.Tech CSE Viva Explanation Note</span>
            </div>

            <div className="mt-2.5 text-xs text-slate-600 dark:text-slate-300 space-y-2 leading-relaxed">
              <p>
                <strong>Algorithm:</strong> Dijkstra's Single-Source Shortest Path algorithm on a non-negative weighted graph \(G = (V, E)\).
              </p>
              <div className="rounded-xl bg-white p-2.5 font-mono text-[11px] text-slate-800 dark:bg-slate-900 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                Relaxation: if (dist[u] + weight(u, v) &lt; dist[v]) {'{\n'}
                {'  '}dist[v] = dist[u] + weight(u, v);{'\n'}
                {'  '}prev[v] = u;{'\n'}
                {'}'}
              </div>
              <p>
                <strong>Time Complexity:</strong> \(\mathcal{O}((V + E) \log V)\) using Min-Priority Queue.
                <br />
                <strong>Space Complexity:</strong> \(\mathcal{O}(V + E)\) for adjacency list representation.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 p-4 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900/50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-slate-900 px-5 py-2 text-xs font-bold text-white transition hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
          >
            Close Itinerary
          </button>
        </div>
      </div>
    </div>
  );
}
