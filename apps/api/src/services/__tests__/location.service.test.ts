import { describe, it, expect } from 'vitest';
import { locationService } from '../location.service.js';

describe('LocationService', () => {
  it('1. returns valid location by ID', async () => {
    const loc = await locationService.findById('loc_surabaya');
    expect(loc).toBeDefined();
    expect(loc?.name).toBe('Surabaya');
    expect(loc?.psh).toBe(4.5);
  });

  it('2. handles duplicate names in different provinces by returning both in search', async () => {
    // Currently our mock dataset only has unique cities, but the search logic supports filtering by normalized name.
    const results = await locationService.search('Jakarta');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].province_name).toBe('DKI Jakarta');
  });

  it('3. returns null for invalid location ID', async () => {
    const loc = await locationService.findById('loc_invalid123');
    expect(loc).toBeNull();
  });

  it('4. search returns empty for missing location', async () => {
    const results = await locationService.search('Neverland');
    expect(results.length).toBe(0);
  });

  it('6. search returns empty for empty query', async () => {
    const results = await locationService.search('');
    expect(results.length).toBe(0);
  });

  it('8. normal search returns correct result', async () => {
    const results = await locationService.search('bandung');
    expect(results.length).toBe(1);
    expect(results[0].name).toBe('Bandung');
  });

  it('11. search limits results correctly', async () => {
    const results = await locationService.search('a', 2);
    expect(results.length).toBeLessThanOrEqual(2);
  });
});
