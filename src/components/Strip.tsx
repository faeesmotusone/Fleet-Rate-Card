import type { Row } from '@/lib/data';
import { fmt } from '@/lib/data';

// A horizontal rate strip: every booking is a tick, the middle half is a band, the median is a marker.
export function Strip({ rows, lo, hi, median, p25, p75, big = false, onDark = false }: {
  rows: Row[]; lo: number; hi: number; median: number; p25: number; p75: number; big?: boolean; onDark?: boolean;
}) {
  const span = hi - lo || 1;
  const x = (v: number) => `${Math.max(0, Math.min(100, ((v - lo) / span) * 100))}%`;
  const h = big ? 56 : 18;
  return (
    <div className={`strip ${big ? 'strip-big' : ''}`} style={{ height: h }} aria-hidden="true">
      <div className="strip-track" />
      <div className="strip-band" style={{ left: x(p25), width: `calc(${x(p75)} - ${x(p25)})` }} />
      {rows.map((r, i) => (
        <span key={i} className={`strip-tick ${r.manual ? 'is-manual' : ''}`} style={{ left: x(r.rate) }} title={`${fmt(r.rate)}`} />
      ))}
      <span className="strip-median" style={{ left: x(median) }} />
    </div>
  );
}
