import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { DbVehicle, DbCity } from '@/lib/supabase';
import { VEHICLES, CITIES, CITY_CURRENCY } from '@/lib/data';

function bakedVehicles(): DbVehicle[] {
  return VEHICLES.map((v, i) => ({ id: 'b-v-' + i, name: v.n, class: v.c }));
}

function bakedCities(): DbCity[] {
  const out: DbCity[] = [];
  for (const [country, cityList] of Object.entries(CITIES)) {
    for (const city of cityList) {
      const cur = country === 'KSA' ? 'SAR' : country === 'UAE' ? 'AED' : (CITY_CURRENCY[city] || 'USD');
      out.push({ id: 'b-c-' + country + '-' + city, country, city, currency: cur });
    }
  }
  return out;
}

function mergeVehicles(baked: DbVehicle[], db: DbVehicle[]): DbVehicle[] {
  const merged = [...baked];
  for (const v of db) {
    if (!merged.some(m => m.name.toLowerCase() === v.name.toLowerCase())) {
      merged.push(v);
    }
  }
  return merged;
}

function mergeCities(baked: DbCity[], db: DbCity[]): DbCity[] {
  const merged = [...baked];
  for (const c of db) {
    if (!merged.some(m => m.country === c.country && m.city.toLowerCase() === c.city.toLowerCase())) {
      merged.push(c);
    }
  }
  return merged;
}

export function useDbLists() {
  const bv = bakedVehicles();
  const bc = bakedCities();
  const [dbVehicles, setDbVehicles] = useState<DbVehicle[]>([]);
  const [dbCities, setDbCities] = useState<DbCity[]>([]);
  const [ready, setReady] = useState(false);

  const loadVehicles = useCallback(async () => {
    if (!supabase) return;
    try {
      const { data, error } = await supabase.from('vehicles').select('*').order('class').order('name');
      if (!error && data) setDbVehicles(data);
    } catch {}
  }, []);

  const loadCities = useCallback(async () => {
    if (!supabase) return;
    try {
      const { data, error } = await supabase.from('cities').select('*').order('country').order('city');
      if (!error && data) setDbCities(data);
    } catch {}
  }, []);

  useEffect(() => {
    Promise.all([loadVehicles(), loadCities()]).then(() => setReady(true));
    if (!supabase) { setReady(true); return; }
    const vCh = supabase.channel('vehicles_ch').on('postgres_changes', { event: '*', schema: 'public', table: 'vehicles' }, () => loadVehicles()).subscribe();
    const cCh = supabase.channel('cities_ch').on('postgres_changes', { event: '*', schema: 'public', table: 'cities' }, () => loadCities()).subscribe();
    return () => { vCh.unsubscribe(); cCh.unsubscribe(); };
  }, [loadVehicles, loadCities]);

  const vehicles = mergeVehicles(bv, dbVehicles);
  const cities = mergeCities(bc, dbCities);

  return { vehicles, cities, ready, reloadVehicles: loadVehicles, reloadCities: loadCities };
}
