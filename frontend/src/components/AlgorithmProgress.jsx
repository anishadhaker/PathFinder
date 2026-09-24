import React, { useState } from 'react';
import {
  Cpu,
  CheckCircle2,
  Clock,
  Sparkles,
  ChevronRight,
  Minimize2,
  Maximize2,
  X,
  Code,
} from 'lucide-react';

export default function AlgorithmProgress({
  isCalculating,
  executionLog = [],
  onClose,
  isOpen = true,
  darkMode = false,
}) {
  const [activeTab, setActiveTab] = useState('steps'); // 'steps' | 'log'
  const [isMinimized, setIsMinimized] = useState(false);

  if (!isOpen) return null;

  // Viva standard 7 stages as requested in prompt:
  const algorithmChecklist = [
    { title: 'Initialize source', desc: 'Set dist[source] = 0, dist[others] = ∞' },
    { title: 'Explore connected locations', desc: 'Query adjacent highway roads' },
    { title: 'Calculate distances', desc: 'Compute cumulative road weights (km)' },
    { title: 'Update shortest paths', desc: 'Perform edge relaxation condition' },
    { title: 'Select minimum-distance node', desc: 'Extract min from priority queue' },
    { title: 'Reconstruct route', desc: 'Backtrack predecessor map pointers' },
    { title: 'Shortest path found', desc: 'Optimal path verified with minimum km' },
  ];

  return (
    <div className="fixed top-4 right-4 sm:right-6 z-30 w-[calc(100vw-32px)] sm:w-80 overflow-hidden rounded-3xl border border-slate-200/90 bg-white/95 shadow-2xl backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95 transition-all duration-200">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 p-3.5 pb-3 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-500/10 text-sky-600 dark:bg-sky-500/20 dark:text-sky-400">
            <Cpu className={`h-4 w-4 ${isCalculating ? 'animate-spin' : ''}`} />
          </span>
          <div>
            <h3 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
              Route Calculation
            </h3>
            <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
              {isCalculating ? 'Executing Algorithm...' : 'Dijkstra Visualization'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setIsMinimized(!isMinimized)}
            className="flex h-6 w-6 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
            title={isMinimized ? 'Expand' : 'Minimize'}
          >
            {isMinimized ? <Maximize2 className="h-3 w-3" /> : <Minimize2 className="h-3 w-3" />}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex h-6 w-6 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
            title="Close"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <div className="p-3.5">
          {/* Tabs for Viva checklist vs Detailed Execution log */}
          <div className="mb-3 grid grid-cols-2 rounded-xl bg-slate-100 p-0.5 text-[11px] font-bold dark:bg-slate-800">
            <button
              type="button"
              onClick={() => setActiveTab('steps')}
              className={`rounded-lg py-1 transition ${
                activeTab === 'steps'
                  ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
              }`}
            >
              Algorithm Stages
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('log')}
              className={`rounded-lg py-1 transition ${
                activeTab === 'log'
                  ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
              }`}
            >
              Trace Log ({executionLog.length})
            </button>
          </div>

          {activeTab === 'steps' ? (
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">
              {algorithmChecklist.map((step, idx) => {
                // Completed if not calculating or progressive
                const isComplete = !isCalculating || idx < 5;

                return (
                  <div
                    key={idx}
                    className="flex items-start gap-2.5 rounded-xl border border-slate-100 bg-slate-50/70 p-2 text-left dark:border-slate-800/80 dark:bg-slate-800/40"
                  >
                    <CheckCircle2
                      className={`h-4 w-4 shrink-0 mt-0.5 ${
                        isComplete
                          ? 'text-emerald-500 fill-emerald-100 dark:fill-emerald-950/40'
                          : 'text-slate-300 dark:text-slate-600'
                      }`}
                    />
                    <div>
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {step.title}
                      </div>
                      <div className="text-[10px] text-slate-400 leading-tight">{step.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1 font-mono text-[10.5px] scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">
              {executionLog.length === 0 ? (
                <div className="p-4 text-center text-slate-400">
                  Run a route query to view detailed heap & edge relaxation traces.
                </div>
              ) : (
                executionLog.map((entry, idx) => (
                  <div
                    key={idx}
                    className="rounded-lg border border-slate-100 bg-slate-50 p-2 dark:border-slate-800 dark:bg-slate-850"
                  >
                    <div className="flex items-center justify-between font-sans text-[10px] font-bold text-sky-600 dark:text-sky-400">
                      <span>{entry.title}</span>
                      <span className="text-slate-400">#{idx + 1}</span>
                    </div>
                    <div className="mt-1 text-slate-600 dark:text-slate-300 leading-relaxed font-sans text-[11px]">
                      {entry.description}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          <div className="mt-3 border-t border-slate-100 pt-2 text-center text-[10px] text-slate-400 dark:border-slate-800">
            Dijkstra Complexity: O((V + E) log V) • Priority Queue
          </div>
        </div>
      )}
    </div>
  );
}
