import { useMemo, useState } from 'react';
import type { Row, Country } from '@/lib/data';
import { SUPPLIER_NAMES, supplierName, fmt, shortVehicle, getCurrency, CLASS_ORDER, monthLabel } from '@/lib/data';

interface SupplierSummary {
  code: string;
  name: string;
  rows: number;
  countries: string[];
  types: string[];
  vehicles: number;
  cities: number;
}

export function SupplierView({ rows }: { rows: Row[] }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<string>('All');

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

  const selectedRows = useMemo(() => {
    if (!selected) return [];
    let filtered = rows.filter(r => r.supplier === selected);
    if (typeFilter !== 'All') filtered = filtered.filter(r => r.type === typeFilter);
    return filtered.sort((a, b) => a.city.localeCompare(b.city) || a.vehicle.localeCompare(b.vehicle));
  }, [rows, selected, typeFilter]);

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
    const types = [...new Set(selectedRows.length ? selectedRows.map(r => r.type) : selectedInfo.types)];

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

        <div className="chips" role="radiogroup" aria-label="Type filter">
          {['All', ...selectedInfo.types].map(t => (
            <button key={t} role="radio" aria-checked={typeFilter === t} className={typeFilter === t ? 'on' : ''} onClick={() => setTypeFilter(t)}>{t}</button>
          ))}
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
      <p className="muted">Select a supplier to view all their rates. Sorted by number of rates.</p>
      <div className="supplier-grid">
        {suppliers.map(s => (
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
    </div>
  );
}
