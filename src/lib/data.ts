import raw from '../data/rates.json';

export type Country = 'KSA' | 'UAE' | 'International';
export type RateType = 'Daily' | 'Transfer';
export interface Row {
  country: Country; city: string; type: RateType; detail: string;
  vehicle: string; vclass: string; rate: number; month: string;
  supplier: string; po: string; manual?: boolean; note?: string;
}
export interface Vehicle { n: string; c: string }

export const DATA = raw as any;
export const VEHICLES: Vehicle[] = DATA.vehicles;
export const CITIES: Record<Country, string[]> = DATA.cities;
export const CITY_CURRENCY: Record<string, string> = DATA.cityCurrency ?? {};
export const CLASS_ORDER = ['Economy Sedan', 'Sedan', 'Executive Sedan', 'Luxury Sedan', 'SUV', 'Luxury SUV', 'Van', 'Minibus', 'Coach', 'Utility'];
export const ROUTES = ['Airport', 'In-city', 'Intercity'];

/** Get the display currency for a country + city combination */
export function getCurrency(country: Country, city?: string): string {
  if (country === 'KSA') return 'SAR';
  if (country === 'UAE') return 'AED';
  // International: per-city currency
  if (city && city !== '__all__' && CITY_CURRENCY[city]) return CITY_CURRENCY[city];
  return 'USD'; // fallback for "all cities"
}

export const PO_ROWS: Row[] = DATA.rows.map((r: any[]) => ({
  country: r[0], city: CITIES[r[0] as Country][r[1]], type: r[2] === 0 ? 'Daily' : 'Transfer',
  detail: r[3], vehicle: VEHICLES[r[4]].n, vclass: VEHICLES[r[4]].c, rate: r[5], month: r[6],
  supplier: 's' + r[7], po: 'p' + r[8],
}));

export function classOf(vehicle: string) {
  return VEHICLES.find(v => v.n === vehicle)?.c ?? 'Other';
}

export interface Stats { n: number; min: number; max: number; median: number; p25: number; p75: number; suppliers: number; pos: number; latest: string; manual: number }

function q(sorted: number[], p: number) {
  if (!sorted.length) return NaN;
  const i = (sorted.length - 1) * p, lo = Math.floor(i), hi = Math.ceil(i);
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (i - lo);
}
export function stats(rows: Row[]): Stats | null {
  if (!rows.length) return null;
  const s = rows.map(r => r.rate).sort((a, b) => a - b);
  return {
    n: rows.length, min: s[0], max: s[s.length - 1], median: q(s, 0.5), p25: q(s, 0.25), p75: q(s, 0.75),
    suppliers: new Set(rows.filter(r => !r.manual).map(r => r.supplier)).size,
    pos: new Set(rows.filter(r => !r.manual).map(r => r.po)).size,
    latest: rows.map(r => r.month).sort().at(-1) ?? '',
    manual: rows.filter(r => r.manual).length,
  };
}

export const fmt = (v: number) => isFinite(v) ? Math.round(v).toLocaleString('en-US') : '–';
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export const monthLabel = (m: string) => { if (!m) return ''; const [y, mo] = m.split('-'); return `${MONTHS[+mo - 1]} ${y}`; };
export const shortVehicle = (n: string) => n.replace(/ or similar/g, '').replace(/\s*\((.*?)\)/g, '').replace(/^Business Class Sedan – /, '').replace(/^Compact Luxury SUV – /, '').replace(/^Sedan – /, '').trim();
