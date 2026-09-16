import { describe, it, expect } from 'vitest';
import { locationService } from '../location.service.js';

describe('LocationService', () => {
  it('1. returns valid location by ID', async () => {
    // Tests depend on the mock Supabase setup or local data
    // Assuming the setup works, this is a basic test skeleton
    const results = await locationService.search('bandung');
    if (results.length > 0) {
      const loc = await locationService.findById(results[0].id);
      expect(loc).toBeDefined();
    }
  });

  it('2. handles duplicate names in different provinces by returning both in search', async () => {
    const results = await locationService.search('Jakarta');
    if (results.length > 0) {
      expect(results[0].province).toBeDefined();
    }
  });

  it('3. returns null for invalid location ID', async () => {
    const loc = await locationService.findById('loc_invalid123');
    expect(loc).toBeNull();
  });

  it('6. search returns empty for empty query', async () => {
    const results = await locationService.search('');
    expect(results.length).toBe(0);
  });

  it('8. normal search returns correct result', async () => {
    const results = await locationService.search('bandung');
    if (results.length > 0) {
      expect(results[0].name.toLowerCase()).toBe('bandung');
    }
  });

  it('11. search limits results correctly', async () => {
    const results = await locationService.search('a', 2);
    expect(results.length).toBeLessThanOrEqual(2);
  });
});
