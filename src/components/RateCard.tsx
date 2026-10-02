import { useMemo, useState, useEffect } from 'react';
import type { Row, Country, RateType, Stats } from '@/lib/data';
import { CITIES, CLASS_ORDER, ROUTES, stats, fmt, monthLabel, shortVehicle, classOf, getCurrency, CITY_CURRENCY } from '@/lib/data';
import { Strip } from './Strip';
import { Trend } from './Trend';
import { cap } from '@/lib/claude';

const ALL = '__all__';

function Seg<T extends string>({ value, options, onChange, label }: { value: T; options: { v: T; l: string }[]; onChange: (v: T) => void; label: string }) {
  return (
    <div className="seg" role="radiogroup" aria-label={label}>
      {options.map(o => (
        <button key={o.v} role="radio" aria-checked={value === o.v} className={value === o.v ? 'on' : ''} onClick={() => onChange(o.v)}>{o.l}</button>
      ))}
    </div>
  );
}

export function RateCard({ rows, includeManual, setIncludeManual, manualCount }: { rows: Row[]; includeManual: boolean; setIncludeManual: (b: boolean) => void; manualCount: number }) {
  const [country, setCountry] = useState<Country>('KSA');
  const [type, setType] = useState<RateType>('Daily');
  const [route, setRoute] = useState<string>(ALL);
  const [city, setCity] = useState<string>(ALL);
  const [vehicle, setVehicle] = useState<string>('');
  const [q, setQ] = useState('');
  const [downloads, setDownloads] = useState<any>(null);
  useEffect(() => { cap('downloads').then(setDownloads); }, []);

  const cur = getCurrency(country, city);
  const base = useMemo(() => rows.filter(r => r.country === country && r.type === type && (includeManual || !r.manual) && (type === 'Daily' || route === ALL || r.detail === route)), [rows, country, type, route, includeManual]);
  const inCity = useMemo(() => base.filter(r => city === ALL || r.city === city), [base, city]);

  const vehicleList = useMemo(() => {
    const m: Record<string, number> = {};
    inCity.forEach(r => { m[r.vehicle] = (m[r.vehicle] ?? 0) + 1; });
    return Object.entries(m).map(([n, c]) => ({ n, c, k: classOf(n) }))
      .sort((a, b) => CLASS_ORDER.indexOf(a.k) - CLASS_ORDER.indexOf(b.k) || b.c - a.c);
  }, [inCity]);

  // keep a valid vehicle selected: most-booked when the current one has no data here
  useEffect(() => {
    if (!vehicleList.find(v => v.n === vehicle)) {
      const top = [...vehicleList].sort((a, b) => b.c - a.c)[0];
      setVehicle(top?.n ?? '');
    }
  }, [vehicleList, vehicle]);

  const sel = inCity.filter(r => r.vehicle === vehicle);
  const st = stats(sel);
  const cityName = city === ALL ? (country === 'KSA' ? 'all of Saudi Arabia' : country === 'UAE' ? 'all of the UAE' : 'all international cities') : city;

  // ladder: other vehicles in this city
  const ladder = useMemo(() => vehicleList.map(v => ({ ...v, s: stats(inCity.filter(r => r.vehicle === v.n))! })), [vehicleList, inCity]);
  const ladderLo = Math.min(...ladder.map(l => l.s.min)), ladderHi = Math.max(...ladder.map(l => l.s.max));

  // same vehicle across cities
  const across = useMemo(() => CITIES[country].map(c => ({ c, rows: base.filter(r => r.city === c && r.vehicle === vehicle) }))
    .filter(x => x.rows.length).map(x => ({ ...x, s: stats(x.rows)! })).sort((a, b) => a.s.median - b.s.median), [base, vehicle, country]);
  const acrossLo = Math.min(...across.map(a => a.s.min)), acrossHi = Math.max(...across.map(a => a.s.max));

  // transfer vs daily
  const other = rows.filter(r => r.country === country && r.vehicle === vehicle && (city === ALL || r.city === city) && (includeManual || !r.manual));
  const dSt = stats(other.filter(r => r.type === 'Daily'));
  const tSt = stats(other.filter(r => r.type === 'Transfer' && r.detail !== 'Intercity'));

  const filteredVehicles = vehicleList.filter(v => v.n.toLowerCase().includes(q.toLowerCase()));
  const grouped = CLASS_ORDER.map(k => ({ k, vs: filteredVehicles.filter(v => v.k === k) })).filter(g => g.vs.length);

  async function download() {
    if (!downloads) return;
    const head = ['Country', 'City', 'Booking type', 'Route', 'Vehicle', 'Class', 'Bookings', 'Lowest', 'Median', 'Highest', 'Currency', 'Latest booking'];
    const lines = [head.join(',')];
    ladder.forEach(l => lines.push([country, city === ALL ? 'All' : city, type, type === 'Daily' ? '12 hrs / full day' : (route === ALL ? 'All' : route), `"${l.n}"`, l.k, l.s.n, Math.round(l.s.min), Math.round(l.s.median), Math.round(l.s.max), getCurrency(country, city === ALL ? undefined : city), monthLabel(l.s.latest)].join(',')));
    try { await downloads.save({ filename: `Fleet rates ${country} ${type} ${city === ALL ? 'all cities' : city}.csv`, data: lines.join('\n') }); } catch { /* viewer declined */ }
  }

  return (
    <div className="card-layout">
      <aside className="rail" aria-label="Filters">
        <div className="field">
          <span className="field-label">Country</span>
          <Seg label="Country" value={country} onChange={v => { setCountry(v); setCity(ALL); }} options={[{ v: 'KSA', l: 'Saudi Arabia' }, { v: 'UAE', l: 'UAE' }, { v: 'International', l: 'International' }]} />
        </div>
        <div className="field">
          <span className="field-label">Booking</span>
          <Seg label="Booking type" value={type} onChange={v => { setType(v); setRoute(ALL); }} options={[{ v: 'Daily', l: 'Daily, 12 hrs' }, { v: 'Transfer', l: 'One-way transfer' }]} />
          {type === 'Transfer' && (
            <div className="chips" role="radiogroup" aria-label="Transfer route">
              {[ALL, ...ROUTES].map(r => <button key={r} role="radio" aria-checked={route === r} className={route === r ? 'on' : ''} onClick={() => setRoute(r)}>{r === ALL ? 'All routes' : r}</button>)}
            </div>
          )}
        </div>
        <div className="field">
          <span className="field-label">City</span>
          <div className="citylist" role="radiogroup" aria-label="City">
            {[ALL, ...CITIES[country]].map(c => {
              const n = c === ALL ? base.length : base.filter(r => r.city === c).length;
              return <button key={c} role="radio" aria-checked={city === c} disabled={!n} className={city === c ? 'on' : ''} onClick={() => setCity(c)}><span>{c === ALL ? 'All cities' : c}{country === 'International' && c !== ALL && CITY_CURRENCY[c] ? <em className="cur-tag">{CITY_CURRENCY[c]}</em> : null}</span><span className="count">{n}</span></button>;
            })}
          </div>
        </div>
        <div className="field">
          <label className="field-label" htmlFor="vsearch">Vehicle</label>
          <input id="vsearch" className="search" placeholder="Search, e.g. Yukon, Staria, coach" value={q} onChange={e => setQ(e.target.value)} />
          <div className="vlist">
            {grouped.map(g => (
              <div key={g.k}>
                <div className="vgroup">{g.k}</div>
                {g.vs.map(v => <button key={v.n} className={v.n === vehicle ? 'on' : ''} onClick={() => setVehicle(v.n)}><span>{shortVehicle(v.n)}</span><span className="count">{v.c}</span></button>)}
              </div>
            ))}
            {!grouped.length && <p className="muted small">No vehicle matches “{q}” here. Try another city or clear the search.</p>}
          </div>
        </div>
        {manualCount > 0 && (
          <label className="toggle"><input type="checkbox" checked={includeManual} onChange={e => setIncludeManual(e.target.checked)} /> Include {manualCount} added rate{manualCount > 1 ? 's' : ''}</label>
        )}
      </aside>

      <main className="main">
        {!st ? (
          <section className="hero empty">
            <h2>No bookings for this selection</h2>
            <p>Pick another city or switch the booking type. Every vehicle listed on the left has at least one paid rate.</p>
          </section>
        ) : (
          <>
            <section className="hero">
              <div className="hero-head">
                <div>
                  <p className="hero-kicker">{type === 'Daily' ? 'Daily rate, 12 hrs incl. driver & fuel' : `One-way transfer${route !== ALL ? `, ${route.toLowerCase()}` : ''}`} in {cityName}</p>
                  <h2 className="hero-title">{vehicle}</h2>
                  <p className="hero-class">{classOf(vehicle)}</p>
                </div>
                <div className="hero-median">
                  <span className="hero-median-label">Typical rate (median)</span>
                  <span className="hero-median-num">{fmt(st.median)}<small>{cur}</small></span>
                </div>
              </div>
              <Strip big rows={sel} lo={st.min} hi={st.max === st.min ? st.min + 1 : st.max} median={st.median} p25={st.p25} p75={st.p75} />
              <div className="hero-scale"><span>{fmt(st.min)}</span><span>{fmt(st.max)}</span></div>

              {country === 'International' && city === ALL && <p className="local-cur-note">Rates are in each city's local currency. Select a city for comparable rates in one currency.</p>}
              <dl className="facts">
                <div><dt>Lowest paid</dt><dd>{fmt(st.min)} {cur}</dd></div>
                <div><dt>Middle half of bookings</dt><dd>{fmt(st.p25)} – {fmt(st.p75)}</dd></div>
                <div><dt>Highest paid</dt><dd>{fmt(st.max)} {cur}</dd></div>
                <div><dt>Bookings</dt><dd>{st.n}{st.manual ? <span className="tag">{st.manual} added</span> : null}</dd></div>
                <div><dt>Suppliers</dt><dd>{st.suppliers}</dd></div>
                <div><dt>Latest booking</dt><dd>{monthLabel(st.latest)}</dd></div>
              </dl>
              {st.n < 3 && <p className="caution">Only {st.n} booking{st.n > 1 ? 's' : ''} here, so treat this as a reference point rather than a market range.</p>}
              {dSt && tSt && (
                <p className="insight">
                  A full day ({fmt(dSt.median)} {cur}) costs about the same as <strong>{(dSt.median / tSt.median).toFixed(1)} one-way transfers</strong> ({fmt(tSt.median)} {cur} each) for this vehicle in {cityName}. Booking the day pays off from {Math.ceil(dSt.median / tSt.median)} transfers.
                </p>
              )}
            </section>

            <section className="panel">
              <div className="panel-head">
                <h3>Every vehicle in {cityName}</h3>
                {downloads && <button className="link-btn" onClick={download}>Download as CSV</button>}
              </div>
              <p className="muted small">Same scale for every row, so you can compare vehicles at a glance. Select a row to open it above.</p>
              <ol className="ladder">
                {ladder.map(l => (
                  <li key={l.n}>
                    <button className={l.n === vehicle ? 'on' : ''} onClick={() => { setVehicle(l.n); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
                      <span className="ladder-name">{shortVehicle(l.n)}<em>{l.k}</em></span>
                      <span className="ladder-strip"><Strip rows={inCity.filter(r => r.vehicle === l.n)} lo={ladderLo} hi={ladderHi} median={l.s.median} p25={l.s.p25} p75={l.s.p75} /></span>
                      <span className="ladder-med">{fmt(l.s.median)}</span>
                      <span className="ladder-range">{fmt(l.s.min)}–{fmt(l.s.max)}</span>
                      <span className="ladder-n">{l.s.n}</span>
                    </button>
                  </li>
                ))}
              </ol>
              <div className="ladder-foot"><span>Median, {cur}</span><span>Range</span><span>Bookings</span></div>
            </section>

            <div className="two">
              <section className="panel">
                <h3>{shortVehicle(vehicle)} across cities</h3>
                {country === 'International' && across.length > 1 && <p className="muted small">Each city is in its own currency, so the bars are not directly comparable.</p>}
                {across.length < 2 ? <p className="muted">Booked in one city only so far.</p> : (
                  <ul className="across">
                    {across.map(a => (
                      <li key={a.c} className={a.c === city ? 'on' : ''}>
                        <span className="across-city">{a.c}<em className="cur-tag">{country === 'International' ? getCurrency(country, a.c) : ''}</em></span>
                        <span className="across-strip"><Strip rows={a.rows} lo={acrossLo} hi={acrossHi} median={a.s.median} p25={a.s.p25} p75={a.s.p75} /></span>
                        <span className="across-med">{fmt(a.s.median)}</span>
                        <span className="across-n">{a.s.n}×</span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
              <section className="panel">
                <h3>Median by month</h3>
                <p className="muted small">{shortVehicle(vehicle)}, {cityName}, {cur}. The small number is the bookings that month.</p>
                <Trend rows={sel} currency={cur} />
              </section>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
export type { Stats };
