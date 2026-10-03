import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { DbVehicle, DbCity } from '@/lib/supabase';

export function useDbLists() {
  const [vehicles, setVehicles] = useState<DbVehicle[]>([]);
  const [cities, setCities] = useState<DbCity[]>([]);
  const [ready, setReady] = useState(false);

  async function loadVehicles() {
    if (!supabase) return;
    const { data } = await supabase.from('vehicles').select('*').order('class').order('name');
    if (data) setVehicles(data);
  }

  async function loadCities() {
    if (!supabase) return;
    const { data } = await supabase.from('cities').select('*').order('country').order('city');
    if (data) setCities(data);
  }

  useEffect(() => {
    if (!supabase) return;
    Promise.all([loadVehicles(), loadCities()]).then(() => setReady(true));

    const vCh = supabase.channel('vehicles_ch').on('postgres_changes', { event: '*', schema: 'public', table: 'vehicles' }, () => loadVehicles()).subscribe();
    const cCh = supabase.channel('cities_ch').on('postgres_changes', { event: '*', schema: 'public', table: 'cities' }, () => loadCities()).subscribe();
    return () => { vCh.unsubscribe(); cCh.unsubscribe(); };
  }, []);

  return { vehicles, cities, ready, reloadVehicles: loadVehicles, reloadCities: loadCities };
}
