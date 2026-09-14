import { readFile } from 'fs/promises';
import path from 'path';

export interface LocationRecord {
  id: string;
  name: string;
  normalized_name: string;
  province_name: string;
  regency_name: string;
  administrative_level: string;
  latitude: number;
  longitude: number;
  psh: number;
}

export class LocationService {
  private locationsCache: LocationRecord[] | null = null;
  private readonly dataPath = path.join(__dirname, '..', 'data', 'locations.json');

  private async getLocations(): Promise<LocationRecord[]> {
    if (this.locationsCache) {
      return this.locationsCache;
    }
    
    try {
      const data = await readFile(this.dataPath, 'utf-8');
      this.locationsCache = JSON.parse(data) as LocationRecord[];
      return this.locationsCache;
    } catch (error) {
      console.error('Failed to load locations dataset:', error);
      return [];
    }
  }

  public async search(query: string, limit: number = 10): Promise<LocationRecord[]> {
    const locations = await this.getLocations();
    if (!query || query.trim() === '') {
      return [];
    }

    const normalizedQuery = query.trim().toLowerCase();
    
    // Filter and score
    const results = locations.filter(loc => 
      loc.normalized_name.includes(normalizedQuery) ||
      loc.province_name.toLowerCase().includes(normalizedQuery) ||
      loc.regency_name.toLowerCase().includes(normalizedQuery)
    );

    return results.slice(0, limit);
  }

  public async findById(id: string): Promise<LocationRecord | null> {
    const locations = await this.getLocations();
    return locations.find(loc => loc.id === id) || null;
  }
}

export const locationService = new LocationService();
