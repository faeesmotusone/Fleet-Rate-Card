import { useEffect, useState, useCallback } from 'react';
import type { Country, RateType } from '@/lib/data';
import { CITIES, VEHICLES, CLASS_ORDER, ROUTES, fmt, monthLabel, getCurrency } from '@/lib/data';
import { supabase } from '@/lib/supabase';
import type { ManualRate } from '@/lib/supabase';

export interface Entry {
  id: string; country: Country; city: string; type: RateType; detail: string;
  vehicle: string; rate: number; currency: string; month: string; po?: string;
  note?: string; added_by?: string; created_at?: string;
}

const thisMonth = () => new Date().toISOString().slice(0, 7);
const STORAGE_NAME_KEY = 'frc_user_name';

export function AddRate({ entries, setEntries }: { entries: Entry[]; setEntries: (e: Entry[]) => void }) {
  const [status, setStatus] = useState<'loading' | 'ready' | 'off'>('loading');
  const [name, setName] = useState(() => {
    try { return localStorage.getItem(STORAGE_NAME_KEY) || ''; } catch { return ''; }
  });
  const [f, setF] = useState({
    country: 'KSA' as Country, city: CITIES.KSA[0], type: 'Daily' as RateType,
    detail: 'Airport', vehicle: '', rate: '', month: thisMonth(), po: '', note: ''
  });
  const [msg, setMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);
  const [saving, setSaving] = useState(false);

  const loadRates = useCallback(async () => {
    if (!supabase) { setStatus('off'); return; }
    const { data, error } = await supabase.from('manual_rates').select('*').order('created_at', { ascending: false });
    if (error) { console.error(error); setStatus('off'); return; }
    setEntries((data as ManualRate[]).map(r => ({
      id: r.id, country: r.country as Country, city: r.city, type: r.type as RateType,
      detail: r.detail, vehicle: r.vehicle, rate: r.rate, currency: r.currency,
      month: r.month, po: r.po ?? undefined, note: r.note ?? undefined,
      added_by: (r as any).added_by ?? undefined, created_at: r.created_at,
    })));
    setStatus('ready');
  }, [setEntries]);

  useEffect(() => {
    if (!supabase) { setStatus('off'); return; }
    loadRates();
    const channel = supabase.channel('manual_rates_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'manual_rates' }, () => loadRates())
      .subscribe();
    return () => { channel.unsubscribe(); };
  }, [loadRates]);

  const set = (k: string, v: string) => setF(p => ({ ...p, [k]: v }));
  const cur = getCurrency(f.country, f.city);

  async function save() {
    if (!supabase) return;
    const rate = Number(f.rate);
    if (!name.trim()) return setMsg({ kind: 'err', text: 'Enter your name so the team knows who added this rate.' });
    if (!f.vehicle) return setMsg({ kind: 'err', text: 'Choose a vehicle from the list.' });
    if (!(rate > 0)) return setMsg({ kind: 'err', text: 'Enter the agreed rate as a number above zero, without VAT.' });

    try { localStorage.setItem(STORAGE_NAME_KEY, name.trim()); } catch {}

    setSaving(true); setMsg(null);
    const { error } = await supabase.from('manual_rates').insert({
      country: f.country, city: f.city, type: f.type,
      detail: f.type === 'Daily' ? '12 hrs' : f.detail,
      vehicle: f.vehicle, rate, currency: cur,
      month: f.month, po: f.po.trim() || null,
      note: f.note.trim().slice(0, 200) || null,
      added_by: name.trim(),
    });
    setSaving(false);

    if (error) {
      console.error(error);
      setMsg({ kind: 'err', text: 'The rate was not saved. Check your connection and try again.' });
    } else {
      setMsg({ kind: 'ok', text: `Rate added: ${f.vehicle}, ${fmt(rate)} ${cur}. It now shows on the rate card.` });
      setF(p => ({ ...p, rate: '', po: '', note: '' }));
      loadRates();
    }
  }

  async function remove(id: string) {
    if (!supabase) return;
    const { error } = await supabase.from('manual_rates').delete().eq('id', id);
    if (error) setMsg({ kind: 'err', text: 'Could not remove that rate. Try again.' });
    else loadRates();
  }

  if (status === 'off') return (
    <section className="panel narrow">
      <h2>Add a rate</h2>
      <p>The database connection is not available. The rate card still works with the PO data, but new rates cannot be added right now.</p>
    </section>
  );

  const vehiclesByClass = CLASS_ORDER.map(k => ({ k, vs: VEHICLES.filter(v => v.c === k) })).filter(g => g.vs.length);

  return (
    <div className="add-layout">
      <section className="panel">
        <h2>Add a newly agreed rate</h2>
        <p className="muted">For rates confirmed with a supplier before the PO reaches the monthly export. Enter the unit rate without VAT.</p>
        <div className="form">
          <label>Your name
            <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Ahmed, Sarah" /></label>
          <label>Country
            <select value={f.country} onChange={e => { const c = e.target.value as Country; setF(p => ({ ...p, country: c, city: CITIES[c][0] })); }}>
              <option value="KSA">Saudi Arabia (SAR)</option><option value="UAE">UAE (AED)</option><option value="International">International</option>
            </select></label>
          <label>City
            <select value={f.city} onChange={e => set('city', e.target.value)}>
              {CITIES[f.country].map(c => <option key={c}>{c}</option>)}
            </select></label>
          <label>Booking
            <select value={f.type} onChange={e => set('type', e.target.value)}>
              <option value="Daily">Daily, 12 hrs incl. driver & fuel</option>
              <option value="Transfer">One-way transfer</option>
            </select></label>
          {f.type === 'Transfer' && <label>Route
            <select value={f.detail} onChange={e => set('detail', e.target.value)}>
              {ROUTES.map(r => <option key={r}>{r}</option>)}
            </select></label>}
          <label className="wide">Vehicle
            <select value={f.vehicle} onChange={e => set('vehicle', e.target.value)}>
              <option value="">Choose a vehicle</option>
              {vehiclesByClass.map(g => <optgroup key={g.k} label={g.k}>{g.vs.map(v => <option key={v.n}>{v.n}</option>)}</optgroup>)}
            </select></label>
          <label>Rate ({cur}, excl. VAT)
            <input inputMode="decimal" value={f.rate} onChange={e => set('rate', e.target.value.replace(/[^\d.]/g, ''))} placeholder="e.g. 950" /></label>
          <label>Effective month
            <input type="month" value={f.month} onChange={e => set('month', e.target.value)} /></label>
          <label>PO number (optional)
            <input value={f.po} onChange={e => set('po', e.target.value)} placeholder="PO-2021..." /></label>
          <label className="wide">Note (optional)
            <input value={f.note} maxLength={200} onChange={e => set('note', e.target.value)} placeholder="e.g. Event rate for F1 week" /></label>
          <div className="wide form-actions">
            <button className="primary" disabled={saving || status !== 'ready'} onClick={save}>{saving ? 'Adding...' : 'Add rate'}</button>
            {status === 'loading' && <span className="muted small">Connecting to the database...</span>}
          </div>
        </div>
        {msg && <p role="status" className={msg.kind === 'ok' ? 'notice' : 'caution'}>{msg.text}</p>}
      </section>

      <section className="panel">
        <h2>Added rates</h2>
        {!entries.length ? <p className="muted">No rates added yet. The first one you add appears here and on the rate card.</p> : (
          <div className="table-scroll">
            <table className="entries">
              <thead><tr><th>Vehicle</th><th>Where</th><th>Booking</th><th className="num">Rate</th><th>Month</th><th>Added by</th><th></th></tr></thead>
              <tbody>
                {entries.map(e => (
                  <tr key={e.id}>
                    <td>{e.vehicle}{e.note && <div className="muted small">{e.note}</div>}</td>
                    <td>{e.city}, {e.country}</td>
                    <td>{e.type === 'Daily' ? 'Daily' : `Transfer, ${e.detail.toLowerCase()}`}</td>
                    <td className="num">{fmt(e.rate)} {e.currency}</td>
                    <td>{monthLabel(e.month)}{e.po && <div className="muted small">{e.po}</div>}</td>
                    <td>{e.added_by || '—'}</td>
                    <td><button className="link-btn" onClick={() => remove(e.id)}>Remove</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
