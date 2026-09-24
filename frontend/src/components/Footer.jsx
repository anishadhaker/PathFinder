export default function Footer() {
  return (
    <footer className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-slate-200 bg-white/60 px-4 py-5 text-sm text-slate-500 sm:flex-row sm:px-6 lg:px-8">
      <div>© 2026 PathFinder</div>
      <div className="flex items-center gap-4">
        <span>Weighted Graph</span>
        <span>•</span>
        <span>Dijkstra</span>
        <span>•</span>
        <span>Shortest Path</span>
      </div>
    </footer>
  );
}
