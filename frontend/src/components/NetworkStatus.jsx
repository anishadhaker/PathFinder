import React from 'react';
import { Activity, ShieldCheck, MapPin, Route } from 'lucide-react';

export default function NetworkStatus({ darkMode = false }) {
  return (
    <div className="fixed top-4 left-4 sm:left-[435px] z-20 hidden md:flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white/90 px-3.5 py-2 shadow-lg backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/90">
      <div className="flex items-center gap-2">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
        </span>
        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
          Network Ready
        </span>
      </div>

      <div className="h-3 w-px bg-slate-200 dark:bg-slate-700" />

      <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400">
        <MapPin className="h-3.5 w-3.5 text-sky-500" />
        <span>10 Main Locations</span>
      </div>

      <div className="h-3 w-px bg-slate-200 dark:bg-slate-700" />

      <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400">
        <Route className="h-3.5 w-3.5 text-sky-500" />
        <span>13 Roads</span>
      </div>

      <div className="h-3 w-px bg-slate-200 dark:bg-slate-700" />

      <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
        Dijkstra's Algorithm
      </span>
    </div>
  );
}
