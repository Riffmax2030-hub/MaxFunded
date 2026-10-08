/**
 * Shared skeleton/loading primitives for admin pages.
 * Import and use instead of full-page spinners for instant perceived performance.
 */

export function SkeletonRow({ cols = 5 }: { cols?: number }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-5 py-4">
          <div className="h-3.5 bg-slate-800 rounded animate-pulse w-3/4" />
        </td>
      ))}
    </tr>
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3 animate-pulse">
      <div className="h-3 bg-slate-800 rounded w-1/3" />
      <div className="h-3 bg-slate-800 rounded w-2/3" />
      <div className="h-3 bg-slate-800 rounded w-1/2" />
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 6 }: { rows?: number; cols?: number }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
      <div className="h-10 bg-slate-800/60 border-b border-slate-800 animate-pulse" />
      <table className="w-full">
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <SkeletonRow key={i} cols={cols} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function SkeletonStat() {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 animate-pulse">
      <div className="h-2.5 bg-slate-800 rounded w-1/2 mb-3" />
      <div className="h-7 bg-slate-800 rounded w-1/3" />
    </div>
  );
}

export function PageError({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-3">
        <span className="text-red-400 text-lg">!</span>
      </div>
      <p className="text-slate-400 text-sm mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-300 transition"
        >
          Try again
        </button>
      )}
    </div>
  );
}
