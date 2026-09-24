import { Bell, ChevronDown, MapPinned, Settings, UserRound } from 'lucide-react';

const navItems = ['Dashboard', 'Network', 'Algorithm', 'History'];

export default function Navbar() {
  return (
    <nav className="border-b border-slate-200 bg-white/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100 text-sky-700 shadow-sm">
            <MapPinned className="h-5 w-5" />
          </div>
          <div>
            <div className="text-lg font-bold tracking-tight text-slate-900">PathFinder</div>
          </div>
        </div>

        <div className="hidden items-center gap-1 rounded-full bg-slate-100 p-1 md:flex">
          {navItems.map((item) => (
            <button
              key={item}
              className={`rounded-full px-3 py-2 text-sm font-medium transition ${
                item === 'Dashboard'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-1.5 sm:flex">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-sky-700">
              Dijkstra's Algorithm
            </span>
          </div>

          <button className="rounded-full border border-slate-200 bg-white p-2 text-slate-600 transition hover:border-slate-300 hover:text-slate-900">
            <Bell className="h-4 w-4" />
          </button>
          <button className="rounded-full border border-slate-200 bg-white p-2 text-slate-600 transition hover:border-slate-300 hover:text-slate-900">
            <Settings className="h-4 w-4" />
          </button>
          <button className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-white shadow-sm">
            <UserRound className="h-4 w-4" />
          </button>
        </div>
      </div>
    </nav>
  );
}
