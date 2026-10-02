import type { Row } from '@/lib/data';
import { fmt, monthLabel } from '@/lib/data';

export function Trend({ rows, currency }: { rows: Row[]; currency: string }) {
  const by: Record<string, number[]> = {};
  rows.forEach(r => (by[r.month] ??= []).push(r.rate));
  const months = Object.keys(by).sort();
  if (months.length < 2) return <p className="muted">Bookings fall in a single month, so there is no trend to show yet.</p>;
  const med = months.map(m => { const s = by[m].sort((a, b) => a - b); const k = (s.length - 1) / 2; return (s[Math.floor(k)] + s[Math.ceil(k)]) / 2; });
  const max = Math.max(...med) * 1.15, W = 640, H = 170, pad = 28, bw = Math.min(46, (W - pad * 2) / months.length - 8);
  return (
    <div className="trend-wrap">
      <svg viewBox={`0 0 ${W} ${H + 34}`} role="img" aria-label={`Monthly median rate in ${currency}`}>
        <line x1={pad} x2={W - pad} y1={H} y2={H} className="trend-axis" />
        {months.map((m, i) => {
          const cx = pad + ((W - pad * 2) / months.length) * (i + 0.5), bh = (med[i] / max) * (H - 18);
          return (
            <g key={m}>
              <rect x={cx - bw / 2} y={H - bh} width={bw} height={bh} rx={2} className="trend-bar" />
              <text x={cx} y={H - bh - 6} textAnchor="middle" className="trend-val">{fmt(med[i])}</text>
              <text x={cx} y={H + 16} textAnchor="middle" className="trend-lbl">{monthLabel(m).split(' ')[0]}</text>
              <text x={cx} y={H + 29} textAnchor="middle" className="trend-lbl trend-n">{by[m].length}×</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
