import { supabaseAdmin } from '../config/supabase.js';

export interface LocationRecord {
  id: string;
  code: string;
  name: string;
  normalized_name: string;
  province: string;
  normalized_province: string;
  type: string;
  latitude: number | null;
  longitude: number | null;
  created_at?: string;
  updated_at?: string;
}

export class LocationService {
  public async search(query: string, limit: number = 10): Promise<LocationRecord[]> {
    if (!query || query.trim() === '') {
      return [];
    }

    const normalizedQuery = query.trim().toLowerCase();
    const cleanQuery = normalizedQuery.replace(/^(kota|kabupaten)\s+/i, '').trim();
    
    if (!cleanQuery) return [];
    
    // Search Supabase for potential matches using ILIKE
    const { data: locations, error } = await supabaseAdmin
      .from('locations')
      .select('*')
      .or(`normalized_name.ilike.%${cleanQuery}%,normalized_province.ilike.%${cleanQuery}%`)
      .limit(50); // Fetch up to 50 to rank them locally

    if (error) {
      console.error('Failed to search locations in Supabase:', error);
      return [];
    }

    if (!locations || locations.length === 0) {
      return [];
    }

    // Filter and score in-memory for precise ranking
    const scored = locations.map(loc => {
      let score = 0;
      
      const isExactName = loc.normalized_name === cleanQuery;
      const isPrefixName = loc.normalized_name.startsWith(cleanQuery);
      const isSubstringName = loc.normalized_name.includes(cleanQuery);
      const isSubstringProvince = loc.normalized_province.includes(cleanQuery);

      if (isExactName) {
        score = 100;
      } else if (isPrefixName) {
        score = 50;
      } else if (isSubstringName) {
        score = 10;
      } else if (isSubstringProvince) {
        score = 5;
      }

      return { loc, score };
    }).filter(item => item.score > 0);

    // Sort descending by score, then alphabetically by name
    scored.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.loc.name.localeCompare(b.loc.name);
    });

    return scored.slice(0, limit).map(item => item.loc);
  }

  public async findById(id: string): Promise<LocationRecord | null> {
    const { data, error } = await supabaseAdmin
      .from('locations')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return null;
    }
    return data;
  }

  public async findByIds(ids: string[]): Promise<LocationRecord[]> {
    if (!ids || ids.length === 0) return [];

    const { data, error } = await supabaseAdmin
      .from('locations')
      .select('*')
      .in('id', ids);

    if (error || !data) {
      return [];
    }
    return data;
  }
}

export const locationService = new LocationService();
