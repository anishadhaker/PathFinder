import React from 'react';
import {
  Plus,
  Minus,
  Crosshair,
  RotateCcw,
  Moon,
  Sun,
  Cpu,
  Layers,
} from 'lucide-react';

export default function MapControls({
  zoom,
  onZoomIn,
  onZoomOut,
  onCenter,
  onResetView,
  darkMode,
  onToggleDarkMode,
  showAlgorithmPanel,
  onToggleAlgorithmPanel,
}) {
  return (
    <div className="fixed right-4 bottom-24 sm:bottom-6 z-30 flex flex-col gap-2">
      {/* Zoom & Pan Controls Group */}
      <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white/95 shadow-xl backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95">
        <button
          type="button"
          onClick={onZoomIn}
          className="flex h-10 w-10 items-center justify-center text-slate-700 hover:bg-slate-100 hover:text-sky-600 transition dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-sky-400"
          title="Zoom In"
        >
          <Plus className="h-4 w-4" />
        </button>

        <div className="h-px bg-slate-100 dark:bg-slate-800" />

        <button
          type="button"
          onClick={onZoomOut}
          className="flex h-10 w-10 items-center justify-center text-slate-700 hover:bg-slate-100 hover:text-sky-600 transition dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-sky-400"
          title="Zoom Out"
        >
          <Minus className="h-4 w-4" />
        </button>

        <div className="h-px bg-slate-100 dark:bg-slate-800" />

        <button
          type="button"
          onClick={onCenter}
          className="flex h-10 w-10 items-center justify-center text-slate-700 hover:bg-slate-100 hover:text-sky-600 transition dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-sky-400"
          title="Center Network"
        >
          <Crosshair className="h-4 w-4" />
        </button>

        <div className="h-px bg-slate-100 dark:bg-slate-800" />

        <button
          type="button"
          onClick={onResetView}
          className="flex h-10 w-10 items-center justify-center text-slate-700 hover:bg-slate-100 hover:text-sky-600 transition dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-sky-400"
          title="Reset View"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>

      {/* Utility Controls (Dark Mode & Algorithm Inspector) */}
      <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white/95 shadow-xl backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95">
        <button
          type="button"
          onClick={onToggleDarkMode}
          className="flex h-10 w-10 items-center justify-center text-slate-700 hover:bg-slate-100 hover:text-amber-500 transition dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-amber-400"
          title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        <div className="h-px bg-slate-100 dark:bg-slate-800" />

        <button
          type="button"
          onClick={onToggleAlgorithmPanel}
          className={`flex h-10 w-10 items-center justify-center transition ${
            showAlgorithmPanel
              ? 'bg-sky-500 text-white dark:bg-sky-600'
              : 'text-slate-700 hover:bg-slate-100 hover:text-sky-600 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-sky-400'
          }`}
          title="Toggle Viva Algorithm Panel"
        >
          <Cpu className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
