import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { DbVehicle, DbCity } from '@/lib/supabase';
import { CLASS_ORDER } from '@/lib/data';

const CURRENCIES = ['SAR','AED','USD','GBP','EUR','QAR','INR','BHD','CAD','MXN','RWF','KES','CHF','AUD','JPY','SGD','HKD','ZAR','TRY','THB'];
const COUNTRIES = ['KSA','UAE','International'];
const ADMIN_HASH = '819f46d51cd9757d03df7a5fa937147fc987c1e32452cfa5ce0c4ced086ece04';

async function hashPassword(pw: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(pw));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export function ManageLists({ vehicles, cities, onReload }: { vehicles: DbVehicle[]; cities: DbCity[]; onReload: () => void }) {
  const [vName, setVName] = useState('');
  const [vClass, setVClass] = useState('Sedan');
  const [cCountry, setCCountry] = useState('KSA');
  const [cCity, setCCity] = useState('');
  const [cCur, setCCur] = useState('SAR');
  const [msg, setMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);
  const [isAdmin, setIsAdmin] = useState(() => {
    try { return sessionStorage.getItem('frc_admin') === 'yes'; } catch { return false; }
  });
  const [showPw, setShowPw] = useState(false);
  const [pwInput, setPwInput] = useState('');
  const [pwError, setPwError] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  function checkAdmin(action: () => void) {
    if (isAdmin) { action(); return; }
    setPendingAction(() => action);
    setShowPw(true); setPwInput(''); setPwError(false);
  }

  async function submitPw() {
    const h = await hashPassword(pwInput);
    if (h === ADMIN_HASH) {
      setIsAdmin(true);
      try { sessionStorage.setItem('frc_admin', 'yes'); } catch {}
      setShowPw(false); setPwError(false);
      if (pendingAction) { pendingAction(); setPendingAction(null); }
    } else { setPwError(true); }
  }

  async function addVehicle() {
    if (!supabase || !vName.trim()) return setMsg({ kind: 'err', text: 'Enter the vehicle name.' });
    if (vehicles.some(v => v.name.toLowerCase() === vName.trim().toLowerCase())) return setMsg({ kind: 'err', text: 'This vehicle already exists.' });
    const { error } = await supabase.from('vehicles').insert({ name: vName.trim(), class: vClass });
    if (error) setMsg({ kind: 'err', text: 'Could not add vehicle. Try again.' });
    else { setMsg({ kind: 'ok', text: `${vName.trim()} added as ${vClass}.` }); setVName(''); onReload(); }
  }

  async function removeVehicle(id: string, name: string) {
    if (!supabase) return;
    const { error } = await supabase.from('vehicles').delete().eq('id', id);
    if (error) setMsg({ kind: 'err', text: 'Could not remove vehicle.' });
    else { setMsg({ kind: 'ok', text: `${name} removed.` }); onReload(); }
  }

  async function addCity() {
    if (!supabase || !cCity.trim()) return setMsg({ kind: 'err', text: 'Enter the city name.' });
    if (cities.some(c => c.country === cCountry && c.city.toLowerCase() === cCity.trim().toLowerCase())) return setMsg({ kind: 'err', text: 'This city already exists under this country.' });
    const { error } = await supabase.from('cities').insert({ country: cCountry, city: cCity.trim(), currency: cCur });
    if (error) setMsg({ kind: 'err', text: 'Could not add city. Try again.' });
    else { setMsg({ kind: 'ok', text: `${cCity.trim()} added under ${cCountry} (${cCur}).` }); setCCity(''); onReload(); }
  }

  async function removeCity(id: string, name: string) {
    if (!supabase) return;
    const { error } = await supabase.from('cities').delete().eq('id', id);
    if (error) setMsg({ kind: 'err', text: 'Could not remove city.' });
    else { setMsg({ kind: 'ok', text: `${name} removed.` }); onReload(); }
  }

  const groupedVehicles = CLASS_ORDER.map(k => ({ k, vs: vehicles.filter(v => v.class === k) })).filter(g => g.vs.length);

  return (
    <div className="manage-lists">
      <div className="manage-row">
        <section className="panel">
          <h3>Add a vehicle</h3>
          <p className="muted small">New vehicles appear in the Vehicle dropdown immediately.</p>
          <div className="manage-form">
            <input value={vName} onChange={e => setVName(e.target.value)} placeholder="e.g. Toyota Alphard" />
            <select value={vClass} onChange={e => setVClass(e.target.value)}>
              {CLASS_ORDER.map(c => <option key={c}>{c}</option>)}
            </select>
            <button className="primary small-btn" onClick={addVehicle}>Add</button>
          </div>
        </section>

        <section className="panel">
          <h3>Add a city</h3>
          <p className="muted small">New cities appear in the City filter immediately.</p>
          <div className="manage-form">
            <select value={cCountry} onChange={e => { setCCountry(e.target.value); setCCur(e.target.value === 'KSA' ? 'SAR' : e.target.value === 'UAE' ? 'AED' : 'USD'); }}>
              {COUNTRIES.map(c => <option key={c}>{c}</option>)}
            </select>
            <input value={cCity} onChange={e => setCCity(e.target.value)} placeholder="e.g. Muscat" />
            <select value={cCur} onChange={e => setCCur(e.target.value)}>
              {CURRENCIES.map(c => <option key={c}>{c}</option>)}
            </select>
            <button className="primary small-btn" onClick={addCity}>Add</button>
          </div>
        </section>
      </div>

      {msg && <p role="status" className={msg.kind === 'ok' ? 'notice' : 'caution'} style={{marginTop:12}}>{msg.text}</p>}

      <div className="manage-row" style={{marginTop: 20}}>
        <section className="panel">
          <h3>Vehicles ({vehicles.length})</h3>
          <div className="manage-scroll">
            {groupedVehicles.map(g => (
              <div key={g.k}>
                <div className="vgroup">{g.k}</div>
                {g.vs.map(v => (
                  <div key={v.id} className="manage-item">
                    <span>{v.name}</span>
                    <button className="remove-btn" onClick={() => checkAdmin(() => removeVehicle(v.id, v.name))}>Remove</button>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </section>

        <section className="panel">
          <h3>Cities ({cities.length})</h3>
          <div className="manage-scroll">
            {COUNTRIES.map(country => {
              const cs = cities.filter(c => c.country === country);
              if (!cs.length) return null;
              return (
                <div key={country}>
                  <div className="vgroup">{country}</div>
                  {cs.map(c => (
                    <div key={c.id} className="manage-item">
                      <span>{c.city} <span className="cur-tag">{c.currency}</span></span>
                      <button className="remove-btn" onClick={() => checkAdmin(() => removeCity(c.id, c.city))}>Remove</button>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {showPw && (
        <div className="pw-overlay" onClick={() => setShowPw(false)}>
          <div className="pw-modal" onClick={e => e.stopPropagation()}>
            <h3>Admin access required</h3>
            <p className="muted">Enter the admin password to remove vehicles or cities.</p>
            <input type="password" value={pwInput} onChange={e => { setPwInput(e.target.value); setPwError(false); }}
              onKeyDown={e => e.key === 'Enter' && submitPw()} placeholder="Admin password" autoFocus />
            {pwError && <p className="caution" style={{margin:'8px 0 0'}}>Wrong password. Try again.</p>}
            <div className="pw-actions">
              <button className="primary" onClick={submitPw}>Unlock</button>
              <button className="reject-btn" onClick={() => setShowPw(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
