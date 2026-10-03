import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { DbVehicle, DbCity } from '@/lib/supabase';
import { VEHICLES, CITIES, CITY_CURRENCY } from '@/lib/data';

// Fallback: convert baked-in data to the same shape as Supabase rows
function fallbackVehicles(): DbVehicle[] {
  return VEHICLES.map((v, i) => ({ id: 'baked-' + i, name: v.n, class: v.c }));
}

function fallbackCities(): DbCity[] {
  const out: DbCity[] = [];
  for (const [country, cityList] of Object.entries(CITIES)) {
    for (const city of cityList) {
      const cur = country === 'KSA' ? 'SAR' : country === 'UAE' ? 'AED' : (CITY_CURRENCY[city] || 'USD');
      out.push({ id: 'baked-' + country + '-' + city, country, city, currency: cur });
    }
  }
  return out;
}

export function useDbLists() {
  const [vehicles, setVehicles] = useState<DbVehicle[]>(fallbackVehicles());
  const [cities, setCities] = useState<DbCity[]>(fallbackCities());
  const [ready, setReady] = useState(false);

  const loadVehicles = useCallback(async () => {
    if (!supabase) return;
    try {
      const { data, error } = await supabase.from('vehicles').select('*').order('class').order('name');
      if (error) { console.error('Failed to load vehicles:', error); return; }
      if (data && data.length > 0) setVehicles(data);
    } catch (e) { console.error('Vehicle fetch error:', e); }
  }, []);

  const loadCities = useCallback(async () => {
    if (!supabase) return;
    try {
      const { data, error } = await supabase.from('cities').select('*').order('country').order('city');
      if (error) { console.error('Failed to load cities:', error); return; }
      if (data && data.length > 0) setCities(data);
    } catch (e) { console.error('City fetch error:', e); }
  }, []);

  useEffect(() => {
    if (!supabase) { setReady(true); return; }
    Promise.all([loadVehicles(), loadCities()]).then(() => setReady(true));

    const vCh = supabase.channel('vehicles_ch')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'vehicles' }, () => loadVehicles())
      .subscribe();
    const cCh = supabase.channel('cities_ch')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'cities' }, () => loadCities())
      .subscribe();
    return () => { vCh.unsubscribe(); cCh.unsubscribe(); };
  }, [loadVehicles, loadCities]);

  return { vehicles, cities, ready, reloadVehicles: loadVehicles, reloadCities: loadCities };
}
