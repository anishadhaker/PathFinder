import { Clock3 } from 'lucide-react';
import { recentSearches } from '../data/cities';

export default function RecentSearches() {
  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-soft sm:p-7">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
          <Clock3 className="h-5 w-5" />
        </div>
        <h3 className="text-2xl font-bold tracking-tight text-slate-900">Recent Searches</h3>
      </div>

      <div className="space-y-3">
        {recentSearches.map((item) => (
          <div
            key={`${item.source}-${item.destination}-${item.time}`}
            className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
          >
            <div>
              <div className="text-sm font-semibold text-slate-900">
                {item.source} → {item.destination}
              </div>
              <div className="mt-1 text-xs text-slate-500">{item.time}</div>
            </div>
            <div className="text-right">
              <div className="text-sm font-semibold text-slate-900">{item.distance} km</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
