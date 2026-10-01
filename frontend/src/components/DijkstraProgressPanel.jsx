import React, { useState } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Zap,
  ArrowRightLeft,
  ChevronDown,
  ChevronUp,
  Cpu,
  Route,
  CheckCircle2,
  Clock,
  BookOpen,
  Code2,
  GitBranch,
  Layers,
  Sparkles,
  Info,
} from 'lucide-react';
import { CITIES } from '../data/graphData';
import { DIJKSTRA_PSEUDOCODE } from '../services/shortestPathService';

export default function DijkstraProgressPanel({
  source,
  destination,
  onSourceChange,
  onDestinationChange,
  onSwap,
  // Animation / execution state
  currentStep,
  currentStepIndex,
  totalSteps,
  isPlaying,
  isPaused,
  isComplete,
  speed,
  onSpeedChange,
  onRun,
  onPause,
  onResume,
  onReset,
  onRunInstantly,
  finalResult,
  errorMessage,
  darkMode = false,
}) {
  const [activeTab, setActiveTab] = useState('progress'); // 'progress' | 'table' | 'alternatives' | 'learn'
  const [isPseudocodeOpen, setIsPseudocodeOpen] = useState(true);
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false);

  const activeLine = currentStep?.pseudocodeLine || 0;
  const distances = currentStep?.distances || {};
  const previous = currentStep?.previous || {};
  const visitedSet = new Set(currentStep?.visited || []);

  // Compute reconstructed predecessor chain from current snapshot
  const getPredecessorChain = () => {
    if (!destination || !source) return [];
    if (source === destination) return [source];
    if (distances[destination] === Infinity || distances[destination] === undefined) {
      return ['Not yet reached (∞)'];
    }

    const chain = [];
    let curr = destination;
    while (curr) {
      chain.unshift(curr);
      curr = previous[curr];
      if (chain.length > CITIES.length) break; // cycle protection
    }
    return chain;
  };

  const predecessorChain = getPredecessorChain();

  return (
    <div className="flex flex-col h-full overflow-hidden bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800">
      {/* 1. TOP BRANDING & MODE TITLE */}
      <div className="p-4 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/20">
            <Route className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-black tracking-tight text-slate-900 dark:text-white">
                Dijkstra Shortest Path
              </h2>
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
                Academic Core
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Find the shortest path between two locations using Dijkstra's Algorithm.
            </p>
          </div>
        </div>
      </div>

      {/* 2. SOURCE & DESTINATION SELECTION + SWAP */}
      <div className="p-3.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-850/50 space-y-2.5">
        <div className="grid grid-cols-[1fr,auto,1fr] items-center gap-2">
          {/* Source Selector */}
          <div className="space-y-1">
            <label className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Source (A)
            </label>
            <select
              value={source}
              onChange={(e) => onSourceChange(e.target.value)}
              disabled={isPlaying}
              className="w-full rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-800 shadow-sm transition focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            >
              <option value="">Select Source</option>
              {CITIES.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          {/* Swap Button */}
          <button
            type="button"
            onClick={onSwap}
            disabled={isPlaying}
            className="mt-4 flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:scale-110 hover:border-emerald-300 hover:text-emerald-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
            title="Swap Source and Destination"
          >
            <ArrowRightLeft className="h-3.5 w-3.5" />
          </button>

          {/* Destination Selector */}
          <div className="space-y-1">
            <label className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400">
              <span className="h-2 w-2 rounded-full bg-violet-500" />
              Destination (B)
            </label>
            <select
              value={destination}
              onChange={(e) => onDestinationChange(e.target.value)}
              disabled={isPlaying}
              className="w-full rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-800 shadow-sm transition focus:border-violet-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            >
              <option value="">Select Destination</option>
              {CITIES.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* CONTROLS BAR: Run, Pause/Resume, Reset, Instant */}
        <div className="flex items-center gap-1.5 pt-1">
          {!isPlaying && !isPaused ? (
            <button
              type="button"
              onClick={onRun}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 py-2 text-xs font-bold text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-500 transition active:scale-95"
            >
              <Play className="h-3.5 w-3.5 fill-current" />
              <span>Run Dijkstra</span>
            </button>
          ) : isPlaying ? (
            <button
              type="button"
              onClick={onPause}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-amber-500 py-2 text-xs font-bold text-white shadow-md shadow-amber-500/20 hover:bg-amber-400 transition active:scale-95"
            >
              <Pause className="h-3.5 w-3.5 fill-current" />
              <span>Pause</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onResume}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 py-2 text-xs font-bold text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-500 transition active:scale-95"
            >
              <Play className="h-3.5 w-3.5 fill-current" />
              <span>Resume</span>
            </button>
          )}

          <button
            type="button"
            onClick={onReset}
            className="flex items-center justify-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-750 transition"
            title="Reset algorithm state"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset</span>
          </button>

          <button
            type="button"
            onClick={onRunInstantly}
            className="flex items-center justify-center gap-1 rounded-xl border border-sky-200 bg-sky-50 px-3 py-2 text-xs font-bold text-sky-700 shadow-sm hover:bg-sky-100 dark:border-sky-800 dark:bg-sky-950/60 dark:text-sky-300 transition"
            title="Skip animation and display final result immediately"
          >
            <Zap className="h-3.5 w-3.5 fill-current" />
            <span>Instant</span>
          </button>
        </div>

        {/* SPEED SELECTOR & PROGRESS BAR */}
        <div className="flex items-center justify-between text-[11px] pt-1">
          <div className="flex items-center gap-1">
            <span className="font-semibold text-slate-500 dark:text-slate-400">Speed:</span>
            {[
              { label: 'Slow', val: 1200 },
              { label: 'Normal', val: 600 },
              { label: 'Fast', val: 200 },
            ].map(({ label, val }) => (
              <button
                key={label}
                type="button"
                onClick={() => onSpeedChange(val)}
                className={`rounded-lg px-2 py-0.5 font-bold transition ${
                  speed === val
                    ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {totalSteps > 0 && (
            <div className="font-mono text-[10.5px] font-bold text-slate-600 dark:text-slate-300">
              Step {currentStepIndex + 1} / {totalSteps}
            </div>
          )}
        </div>

        {/* Progress Bar */}
        {totalSteps > 0 && (
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-500 transition-all duration-300"
              style={{
                width: `${Math.round(((currentStepIndex + 1) / totalSteps) * 100)}%`,
              }}
            />
          </div>
        )}

        {errorMessage && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-2 text-xs font-semibold text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/40 dark:text-rose-300">
            {errorMessage}
          </div>
        )}
      </div>

      {/* 3. NAVIGATION TABS */}
      <div className="px-3 pt-2.5 pb-1 border-b border-slate-100 dark:border-slate-800">
        <div className="grid grid-cols-4 rounded-xl bg-slate-100 p-0.5 text-[11px] font-bold dark:bg-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab('progress')}
            className={`rounded-lg py-1.5 transition ${
              activeTab === 'progress'
                ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
            }`}
          >
            Step
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('table')}
            className={`rounded-lg py-1.5 transition ${
              activeTab === 'table'
                ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
            }`}
          >
            Table
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('alternatives')}
            className={`rounded-lg py-1.5 transition ${
              activeTab === 'alternatives'
                ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
            }`}
          >
            Routes
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('learn')}
            className={`rounded-lg py-1.5 transition ${
              activeTab === 'learn'
                ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
            }`}
          >
            Viva
          </button>
        </div>
      </div>

      {/* 4. SCROLLABLE TAB CONTENT */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">
        {/* TAB 1: CURRENT STEP & PSEUDOCODE */}
        {activeTab === 'progress' && (
          <div className="space-y-3">
            {/* Current Step Card */}
            {currentStep ? (
              <div className="rounded-2xl border border-amber-200/80 bg-amber-50/70 p-3.5 text-xs text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-black uppercase tracking-wider text-[10px] text-amber-700 dark:text-amber-400">
                    <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                    <span>Current Algorithm Step</span>
                  </div>
                  <span className="rounded-full bg-amber-200/80 px-2 py-0.5 font-mono text-[9px] font-bold text-amber-900 dark:bg-amber-900 dark:text-amber-200">
                    #{currentStep.stepNumber}
                  </span>
                </div>

                <div className="text-sm font-extrabold text-slate-900 dark:text-white">
                  {currentStep.stepTitle}
                </div>

                <p className="text-[11px] leading-relaxed text-slate-700 dark:text-slate-300">
                  {currentStep.message}
                </p>

                {currentStep.formula && (
                  <div className="rounded-xl border border-amber-200/70 bg-white/80 p-2 font-mono text-[11px] font-bold text-amber-900 dark:border-amber-900/40 dark:bg-slate-900/80 dark:text-amber-300">
                    {currentStep.formula}
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 text-center text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-850/60 dark:text-slate-400">
                Click <span className="font-bold text-emerald-600 dark:text-emerald-400">Run Dijkstra</span> to watch the algorithm explore nodes and relax edges step-by-step.
              </div>
            )}

            {/* Predecessor Chain Card */}
            <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-3 text-xs dark:border-slate-800 dark:bg-slate-850/60 space-y-1.5">
              <div className="flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <GitBranch className="h-3.5 w-3.5 text-sky-500" />
                <span>Predecessor / Parent Chain</span>
              </div>
              <div className="flex items-center gap-1 overflow-x-auto py-1 font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
                {predecessorChain.map((node, i) => (
                  <React.Fragment key={node}>
                    <span className="rounded-lg bg-white px-2 py-0.5 border border-slate-200 shadow-sm dark:bg-slate-800 dark:border-slate-700 shrink-0">
                      {node}
                    </span>
                    {i < predecessorChain.length - 1 && (
                      <span className="text-slate-400">←</span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Pseudocode Accordion */}
            <div className="rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 overflow-hidden shadow-sm">
              <button
                type="button"
                onClick={() => setIsPseudocodeOpen(!isPseudocodeOpen)}
                className="flex w-full items-center justify-between p-3 text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-850"
              >
                <div className="flex items-center gap-2">
                  <Code2 className="h-4 w-4 text-emerald-500" />
                  <span>Dijkstra Pseudocode Execution</span>
                </div>
                {isPseudocodeOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>

              {isPseudocodeOpen && (
                <div className="border-t border-slate-100 bg-slate-950 p-3 font-mono text-[11px] text-slate-300 dark:border-slate-800 space-y-0.5">
                  {DIJKSTRA_PSEUDOCODE.map((item) => {
                    const isHighlighted = activeLine === item.line;
                    return (
                      <div
                        key={item.line}
                        className={`flex items-start gap-2 rounded px-2 py-0.5 transition-colors ${
                          isHighlighted
                            ? 'bg-emerald-500/25 text-emerald-300 font-bold border-l-2 border-emerald-400'
                            : 'text-slate-400'
                        }`}
                      >
                        <span className="w-4 select-none opacity-40 text-right">{item.line}</span>
                        <span>{item.text}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Live Algorithm Stats Summary */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-2 dark:border-slate-800 dark:bg-slate-850/50">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Visited</div>
                <div className="text-sm font-black text-slate-800 dark:text-white">
                  {visitedSet.size} / 10
                </div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-2 dark:border-slate-800 dark:bg-slate-850/50">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Edges Checked</div>
                <div className="text-sm font-black text-slate-800 dark:text-white">
                  {currentStep?.stats?.edgesChecked || 0}
                </div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-2 dark:border-slate-800 dark:bg-slate-850/50">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Steps</div>
                <div className="text-sm font-black text-slate-800 dark:text-white">
                  {currentStepIndex >= 0 ? currentStepIndex + 1 : 0}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: LIVE DISTANCE TABLE */}
        {activeTab === 'table' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800 dark:text-slate-200">
                Live Dijkstra Distance Table
              </span>
              <span className="text-[10px] text-slate-400">
                Updates dynamically per step
              </span>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                  <tr>
                    <th className="py-2 px-3">Node</th>
                    <th className="py-2 px-2 text-right">Distance</th>
                    <th className="py-2 px-2 text-center">Status</th>
                    <th className="py-2 px-3 text-right">Parent</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  {CITIES.map((city) => {
                    const dist = distances[city];
                    const isVisited = visitedSet.has(city);
                    const isCurrent = city === currentStep?.currentNode;
                    const parent = previous[city] || '—';

                    let distDisplay = '∞';
                    if (dist === 0) distDisplay = '0 km';
                    else if (dist < Infinity && dist !== undefined) distDisplay = `${dist} km`;

                    return (
                      <tr
                        key={city}
                        className={`transition-colors ${
                          isCurrent
                            ? 'bg-amber-50/80 font-bold dark:bg-amber-950/40 text-amber-900 dark:text-amber-200'
                            : isVisited
                            ? 'bg-slate-50/40 dark:bg-slate-850/40 text-slate-500'
                            : 'text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        <td className="py-2 px-3">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`h-2 w-2 rounded-full ${
                                city === source
                                  ? 'bg-emerald-500'
                                  : city === destination
                                  ? 'bg-violet-500'
                                  : isCurrent
                                  ? 'bg-amber-500'
                                  : isVisited
                                  ? 'bg-slate-400'
                                  : 'bg-slate-300 dark:bg-slate-600'
                              }`}
                            />
                            <span>{city}</span>
                          </div>
                        </td>
                        <td className="py-2 px-2 text-right font-mono font-bold">
                          {distDisplay}
                        </td>
                        <td className="py-2 px-2 text-center">
                          <span
                            className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase ${
                              isCurrent
                                ? 'bg-amber-200 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
                                : isVisited
                                ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                                : 'bg-slate-100 text-slate-400 dark:bg-slate-800/60'
                            }`}
                          >
                            {isCurrent ? 'Current' : isVisited ? 'Visited' : 'Unvisited'}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-right font-mono text-slate-500 dark:text-slate-400">
                          {parent}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: ALTERNATIVE ROUTES & MATHEMATICAL COMPARISON */}
        {activeTab === 'alternatives' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800 dark:text-slate-200">
                Alternative Graph Routes
              </span>
              <span className="text-[10px] text-slate-400">
                Computed on road network
              </span>
            </div>

            {finalResult?.alternativePaths && finalResult.alternativePaths.length > 0 ? (
              <div className="space-y-2">
                {finalResult.alternativePaths.map((alt, idx) => {
                  const isShortest = idx === 0;
                  return (
                    <div
                      key={idx}
                      className={`rounded-2xl border p-3 text-xs transition ${
                        isShortest
                          ? 'border-emerald-200 bg-emerald-50/70 dark:border-emerald-900/50 dark:bg-emerald-950/40'
                          : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-850/60'
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold">
                        <span className={isShortest ? 'text-emerald-700 dark:text-emerald-300' : 'text-slate-700 dark:text-slate-300'}>
                          {isShortest ? '⭐ Shortest (Dijkstra Optimal)' : `Alternative Route #${idx}`}
                        </span>
                        <span className="font-mono text-sm text-slate-900 dark:text-white">
                          {alt.distance} km
                        </span>
                      </div>
                      <div className="mt-1 font-mono text-[11px] text-slate-600 dark:text-slate-400">
                        {alt.path.join(' → ')}
                      </div>
                      {isShortest && finalResult.alternativePaths.length > 1 && (
                        <div className="mt-2 text-[10px] font-semibold text-emerald-800 dark:text-emerald-300">
                          Saves {finalResult.alternativePaths[1].distance - alt.distance} km compared to Alternative #1!
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center text-xs text-slate-400 dark:border-slate-800 dark:bg-slate-850">
                Run Dijkstra to calculate and compare all valid alternative paths.
              </div>
            )}

            {/* Why this is the shortest path section */}
            {finalResult?.explanation && (
              <div className="rounded-2xl border border-sky-200 bg-sky-50/70 p-3.5 text-xs text-sky-950 dark:border-sky-900/50 dark:bg-sky-950/30 dark:text-sky-200 space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-sky-700 dark:text-sky-300">
                  <Sparkles className="h-4 w-4" />
                  <span>Why this path? (Mathematical Proof)</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  {finalResult.explanation}
                </p>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: VIVA & HOW DIJKSTRA WORKS */}
        {activeTab === 'learn' && (
          <div className="space-y-3 text-xs">
            {/* Complexity Cards */}
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-850/50">
                <div className="text-[10px] font-bold uppercase text-slate-400">Time Complexity</div>
                <div className="text-sm font-black text-slate-800 dark:text-white mt-0.5">
                  O((V + E) log V)
                </div>
                <div className="text-[9px] text-slate-400 mt-1">Min-Priority Queue / Binary Heap</div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-850/50">
                <div className="text-[10px] font-bold uppercase text-slate-400">Space Complexity</div>
                <div className="text-sm font-black text-slate-800 dark:text-white mt-0.5">
                  O(V + E)
                </div>
                <div className="text-[9px] text-slate-400 mt-1">Adjacency List + Distance Maps</div>
              </div>
            </div>

            {/* 9 Standard Dijkstra Steps */}
            <div className="rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-850 space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                <BookOpen className="h-4 w-4 text-emerald-500" />
                <span>How Dijkstra's Algorithm Works (9 Steps)</span>
              </div>
              <ol className="list-decimal pl-4 space-y-1.5 text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                <li>Start from the designated source node.</li>
                <li>Set source distance to 0 km.</li>
                <li>Set all other node tentative distances to infinity (∞).</li>
                <li>Select the unvisited node with the smallest tentative distance.</li>
                <li>Explore all neighboring nodes connected by weighted roads.</li>
                <li>Relax edges: update neighbor distance if a shorter path is found.</li>
                <li>Record the predecessor / previous node for path backtracking.</li>
                <li>Mark the current node as finalized / visited.</li>
                <li>Repeat until destination is reached, then backtrack predecessor pointers.</li>
              </ol>
            </div>

            {/* Viva Edge Relaxation Formula */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900 font-mono text-[10.5px] space-y-1 text-slate-700 dark:text-slate-300">
              <div className="font-bold text-slate-900 dark:text-white font-sans text-xs">
                Edge Relaxation Condition:
              </div>
              <div className="rounded-lg bg-white p-2 border border-slate-200 dark:bg-slate-950 dark:border-slate-800">
                if (dist[u] + weight(u, v) &lt; dist[v]) &#123;<br />
                &nbsp;&nbsp;dist[v] = dist[u] + weight(u, v);<br />
                &nbsp;&nbsp;prev[v] = u;<br />
                &#125;
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 5. FOOTER SUMMARY BAR */}
      {finalResult && isComplete && (
        <div className="p-3.5 border-t border-slate-200 dark:border-slate-800 bg-emerald-50/80 dark:bg-emerald-950/60">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                Shortest Path Found
              </div>
              <div className="font-mono text-xs font-black text-slate-900 dark:text-white">
                {finalResult.path.join(' → ')}
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                {finalResult.distance} km
              </div>
              <div className="text-[10px] font-semibold text-slate-400">
                {finalResult.travelTime} est.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
