import { MapPinned, Route as RouteIcon, Sparkles } from 'lucide-react';

const nodePositions = {
  Delhi: { x: 20, y: 42 },
  Jaipur: { x: 42, y: 28 },
  Ajmer: { x: 58, y: 34 },
  Kota: { x: 52, y: 59 },
  Udaipur: { x: 70, y: 56 },
  Jodhpur: { x: 63, y: 18 },
  Bikaner: { x: 80, y: 18 },
  Agra: { x: 34, y: 62 },
  Chandigarh: { x: 17, y: 20 },
  Amritsar: { x: 10, y: 8 },
};

const roadMap = [
  { from: 'Delhi', to: 'Jaipur', distance: 280 },
  { from: 'Delhi', to: 'Agra', distance: 230 },
  { from: 'Delhi', to: 'Chandigarh', distance: 245 },
  { from: 'Delhi', to: 'Bikaner', distance: 450 },
  { from: 'Jaipur', to: 'Ajmer', distance: 135 },
  { from: 'Jaipur', to: 'Kota', distance: 250 },
  { from: 'Jaipur', to: 'Jodhpur', distance: 330 },
  { from: 'Ajmer', to: 'Udaipur', distance: 260 },
  { from: 'Ajmer', to: 'Jodhpur', distance: 210 },
  { from: 'Kota', to: 'Udaipur', distance: 290 },
  { from: 'Jodhpur', to: 'Udaipur', distance: 250 },
  { from: 'Jodhpur', to: 'Bikaner', distance: 250 },
  { from: 'Chandigarh', to: 'Amritsar', distance: 225 },
  { from: 'Agra', to: 'Jaipur', distance: 310 },
  { from: 'Kota', to: 'Ajmer', distance: 190 },
];

function getLineCoordinates(from, to) {
  const start = nodePositions[from];
  const end = nodePositions[to];

  const midX = (start.x + end.x) / 2;
  const midY = (start.y + end.y) / 2;

  return { start, end, midX, midY };
}

export default function NetworkGraph({ source, destination, activePath = [] }) {
  const pathSet = new Set(activePath);

  const svgRoads = roadMap.map(({ from, to, distance }) => {
    const { start, end, midX, midY } = getLineCoordinates(from, to);
    const isActivePath =
      (activePath[0] === from && activePath.includes(to)) ||
      (activePath[0] === to && activePath.includes(from));

    return {
      from,
      to,
      distance,
      start,
      end,
      midX,
      midY,
      isActivePath,
    };
  });

  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-soft sm:p-6">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">City Network</h2>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-medium text-slate-600">
          <MapPinned className="h-4 w-4 text-sky-600" />
          Weighted graph
        </div>
      </div>

      <div className="relative h-[440px] overflow-hidden rounded-[22px] border border-slate-200 bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.08),_transparent_30%),linear-gradient(180deg,#f8fafc_0%,#eef6ff_100%)]">
        <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full">
          {svgRoads.map(({ from, to, start, end, midX, midY, distance, isActivePath }) => {
            const activeStroke = pathSet.has(from) && pathSet.has(to);

            return (
              <g key={`${from}-${to}`}>
                <line
                  x1={start.x}
                  y1={start.y}
                  x2={end.x}
                  y2={end.y}
                  stroke={activeStroke ? '#0ea5e9' : '#cbd5e1'}
                  strokeWidth={activeStroke ? 1.4 : 0.7}
                  strokeLinecap="round"
                  opacity={activeStroke ? 1 : 0.7}
                  className={activeStroke ? 'drop-shadow-[0_0_6px_rgba(14,165,233,0.6)]' : ''}
                />
                <text
                  x={midX}
                  y={midY}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="3.2"
                  fill={activeStroke ? '#0369a1' : '#64748b'}
                  fontWeight="600"
                >
                  {distance}km
                </text>
              </g>
            );
          })}
        </svg>

        {Object.entries(nodePositions).map(([city, pos]) => {
          const isSource = source === city;
          const isDestination = destination === city;
          const isOnPath = pathSet.has(city);

          return (
            <div
              key={city}
              className="absolute"
              style={{ left: `${pos.x}%`, top: `${pos.y}%`, transform: 'translate(-50%, -50%)' }}
            >
              <div
                className={`flex items-center justify-center rounded-full border transition-all duration-300 ${
                  isSource
                    ? 'h-14 w-14 border-emerald-300 bg-emerald-500 text-white shadow-lg shadow-emerald-500/40'
                    : isDestination
                    ? 'h-14 w-14 border-violet-300 bg-violet-500 text-white shadow-lg shadow-violet-500/40'
                    : isOnPath
                    ? 'h-12 w-12 border-sky-300 bg-sky-500 text-white shadow-lg shadow-sky-500/30'
                    : 'h-11 w-11 border-slate-200 bg-white text-slate-700 shadow-sm'
                }`}
              >
                <span className="text-[10px] font-bold tracking-wide">{city.slice(0, 2).toUpperCase()}</span>
              </div>
              <div
                className={`mt-2 text-center text-[10px] font-semibold ${
                  isSource || isDestination || isOnPath ? 'text-slate-900' : 'text-slate-600'
                }`}
              >
                {city}
              </div>
            </div>
          );
        })}

        <div className="absolute bottom-4 left-4 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white/90 px-3 py-2 shadow-sm backdrop-blur-sm">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <span className="h-2.5 w-2.5 rounded-full bg-slate-400" />
            Location
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <span className="h-2.5 w-2.5 rounded-full bg-sky-500" />
            Shortest Path
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
            Start
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <span className="h-2.5 w-2.5 rounded-full bg-violet-500" />
            Destination
          </div>
        </div>
      </div>
    </section>
  );
}
