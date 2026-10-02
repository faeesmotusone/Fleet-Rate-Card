import { useMemo, useState } from 'react';
import type { Row } from '@/lib/data';
import { PO_ROWS, DATA, classOf, getCurrency } from '@/lib/data';
import { RateCard } from '@/components/RateCard';
import { AddRate } from '@/components/AddRate';
import type { Entry } from '@/components/AddRate';
import { About } from '@/components/About';
import logo from '@/data/logo';
import { ThemeToggle } from '@/components/ThemeToggle';

type Tab = 'card' | 'add' | 'about';

export default function App() {
  const [tab, setTab] = useState<Tab>('card');
  const [entries, setEntries] = useState<Entry[]>([]);
  const [includeManual, setIncludeManual] = useState(true);

  const rows: Row[] = useMemo(() => [
    ...PO_ROWS,
    ...entries.filter(e => e.vehicle && e.rate > 0 && e.status === 'approved').map(e => ({
      country: e.country, city: e.city, type: e.type, detail: e.detail,
      vehicle: e.vehicle, vclass: classOf(e.vehicle),
      rate: Number(e.rate), month: e.month,
      supplier: 'manual', po: 'm' + e.id, manual: true, note: e.note,
    } as Row)),
  ], [entries]);

  return (
    <div className="app">
      <header className="top">
        <div className="brand">
          <span className="logo-plate"><img src={logo} alt="Motus One" /></span>
          <div>
            <h1>Fleet rate card</h1>
            <p>Rates paid on purchase orders, {DATA.period}</p>
          </div>
        </div>
        <nav className="tabs" aria-label="Sections">
          {([['card', 'Rate card'], ['add', 'Add a rate'], ['about', 'About the data']] as [Tab, string][]).map(([k, l]) => (
            <button key={k} aria-current={tab === k ? 'page' : undefined} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>
              {l}{k === 'add' && entries.filter(e => e.status === 'pending').length > 0 && <span className="badge">{entries.filter(e => e.status === 'pending').length}</span>}
            </button>
          ))}
        </nav>
        <ThemeToggle />
      </header>
      {tab === 'card' && <RateCard rows={rows} includeManual={includeManual} setIncludeManual={setIncludeManual} manualCount={entries.filter(e => e.status === 'approved').length} />}
      {tab === 'add' && <AddRate entries={entries} setEntries={setEntries} />}
      {tab === 'about' && <About />}
    </div>
  );
}
