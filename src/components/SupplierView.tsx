import { useMemo, useState } from 'react';
import type { Row } from '@/lib/data';
import { supplierName, fmt, shortVehicle, getCurrency, monthLabel } from '@/lib/data';

interface SupplierSummary {
  code: string;
  name: string;
  rows: number;
  countries: string[];
  types: string[];
  vehicles: number;
  cities: number;
}

const COUNTRY_OPTIONS: { value: string; label: string }[] = [
  { value: 'All', label: 'All regions' },
  { value: 'KSA', label: 'KSA' },
  { value: 'UAE', label: 'UAE' },
  { value: 'International', label: 'International' },
];

export function SupplierView({ rows }: { rows: Row[] }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [search, setSearch] = useState('');
  const [countryFilter, setCountryFilter] = useState('All');

  const suppliers = useMemo(() => {
    const map = new Map<string, Row[]>();
    for (const r of rows) {
      if (r.manual) continue;
      const existing = map.get(r.supplier) || [];
      existing.push(r);
      map.set(r.supplier, existing);
    }

    const list: SupplierSummary[] = [];
    for (const [code, sRows] of map) {
      list.push({
        code,
        name: supplierName(code),
        rows: sRows.length,
        countries: [...new Set(sRows.map(r => r.country))],
        types: [...new Set(sRows.map(r => r.type))],
        vehicles: new Set(sRows.map(r => r.vehicle)).size,
        cities: new Set(sRows.map(r => r.city)).size,
      });
    }
    return list.sort((a, b) => b.rows - a.rows);
  }, [rows]);

  const filteredSuppliers = useMemo(() => {
    let list = suppliers;
    if (countryFilter !== 'All') {
      list = list.filter(s => s.countries.includes(countryFilter));
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(s => s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q));
    }
    return list;
  }, [suppliers, countryFilter, search]);

  const selectedRows = useMemo(() => {
    if (!selected) return [];
    let filtered = rows.filter(r => r.supplier === selected);
    if (typeFilter !== 'All') filtered = filtered.filter(r => r.type === typeFilter);
    if (countryFilter !== 'All') filtered = filtered.filter(r => r.country === countryFilter);
    return filtered.sort((a, b) => a.city.localeCompare(b.city) || a.vehicle.localeCompare(b.vehicle));
  }, [rows, selected, typeFilter, countryFilter]);

  const selectedInfo = suppliers.find(s => s.code === selected);

  const groupedByType = useMemo(() => {
    const groups: Record<string, Row[]> = {};
    for (const r of selectedRows) {
      const key = r.type;
      if (!groups[key]) groups[key] = [];
      groups[key].push(r);
    }
    return groups;
  }, [selectedRows]);

  if (selected && selectedInfo) {
    const cur = (r: Row) => getCurrency(r.country, r.city);

    return (
      <div className="supplier-view">
        <button className="back-btn" onClick={() => { setSelected(null); setTypeFilter('All'); }}>← All suppliers</button>
        <div className="supplier-header">
          <h2>{selectedInfo.name}</h2>
          <div className="supplier-meta">
            <span>{selectedInfo.rows} rates</span>
            <span>{selectedInfo.countries.join(', ')}</span>
            <span>{selectedInfo.vehicles} vehicles</span>
            <span>{selectedInfo.cities} cities</span>
          </div>
        </div>

        <div className="supplier-filters">
          <div className="chips" role="radiogroup" aria-label="Type filter">
            {['All', ...selectedInfo.types].map(t => (
              <button key={t} role="radio" aria-checked={typeFilter === t} className={typeFilter === t ? 'on' : ''} onClick={() => setTypeFilter(t)}>{t}</button>
            ))}
          </div>
          <div className="chips" role="radiogroup" aria-label="Country filter">
            {COUNTRY_OPTIONS.filter(c => c.value === 'All' || selectedInfo.countries.includes(c.value)).map(c => (
              <button key={c.value} role="radio" aria-checked={countryFilter === c.value} className={countryFilter === c.value ? 'on' : ''} onClick={() => setCountryFilter(c.value)}>{c.label}</button>
            ))}
          </div>
        </div>

        {Object.entries(groupedByType).map(([type, tRows]) => (
          <section key={type} className="supplier-type-section">
            <h3>{type === 'Daily' ? 'Daily / Hourly' : type === 'Transfer' ? 'One-way Transfer' : 'Self-drive'}</h3>
            <div className="table-scroll">
              <table className="entries supplier-table">
                <thead>
                  <tr>
                    <th>Vehicle</th>
                    <th>City</th>
                    <th>{type === 'Daily' ? 'Hours' : type === 'Transfer' ? 'Route' : 'Duration'}</th>
                    <th className="num">Rate</th>
                    <th>Month</th>
                  </tr>
                </thead>
                <tbody>
                  {tRows.map((r, i) => (
                    <tr key={i}>
                      <td>{shortVehicle(r.vehicle)}<div className="muted small">{r.vclass}</div></td>
                      <td>{r.city}</td>
                      <td>{r.detail}</td>
                      <td className="num">{fmt(r.rate)} {cur(r)}</td>
                      <td>{monthLabel(r.month)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ))}

        {selectedRows.length === 0 && <p className="muted">No rates for this filter.</p>}
      </div>
    );
  }

  return (
    <div className="supplier-view">
      <h2>Suppliers</h2>
      <div className="supplier-toolbar">
        <input
          className="supplier-search"
          type="search"
          placeholder="Search suppliers…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div className="chips" role="radiogroup" aria-label="Region filter">
          {COUNTRY_OPTIONS.map(c => (
            <button key={c.value} role="radio" aria-checked={countryFilter === c.value} className={countryFilter === c.value ? 'on' : ''} onClick={() => setCountryFilter(c.value)}>{c.label}</button>
          ))}
        </div>
      </div>
      <p className="muted">{filteredSuppliers.length} supplier{filteredSuppliers.length !== 1 ? 's' : ''} · sorted by number of rates</p>
      <div className="supplier-grid">
        {filteredSuppliers.map(s => (
          <button key={s.code} className="supplier-card" onClick={() => setSelected(s.code)}>
            <div className="supplier-card-name">{s.name}</div>
            <div className="supplier-card-meta">
              <span>{s.rows} rates</span>
              <span>{s.countries.join(', ')}</span>
              <span>{s.types.join(' · ')}</span>
            </div>
            <div className="supplier-card-stats">
              <span>{s.vehicles} vehicles</span>
              <span>{s.cities} cities</span>
            </div>
          </button>
        ))}
      </div>
      {filteredSuppliers.length === 0 && <p className="muted">No suppliers match your search.</p>}
    </div>
  );
}
