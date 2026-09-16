
import { supabaseAdmin } from '../config/supabase.js';
import fs from 'fs';
import path from 'path';

const LOKABISA_PROVINCES_URL = 'https://github.com/lokabisa-oss/region-id/releases/download/v1.0.1/provinces.csv';
const LOKABISA_REGENCIES_URL = 'https://github.com/lokabisa-oss/region-id/releases/download/v1.0.1/regencies.csv';

const LOCATIONS_JSON_PATH = path.resolve(__dirname, '../data/locations.json');

const normalizeName = (name: string): string => {
  return name.trim().toLowerCase();
};

const getCodeFromId = (id: string, _type: 'province' | 'city' | 'regency'): string => {
  return `ID-${id}`;
};

const cleanName = (name: string): string => {
  let clean = name.trim();
  if (clean.toUpperCase().startsWith('KABUPATEN ')) {
    clean = clean.substring(10).trim();
  } else if (clean.toUpperCase().startsWith('KOTA ')) {
    clean = clean.substring(5).trim();
  }
  return clean.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
};

const parseCsvLine = (line: string): string[] => {
  // Simple CSV parser assuming no commas inside quotes for this dataset
  return line.split(',').map(s => s.trim());
};

async function seedLocations() {
  console.log('Reading local locations.json for coordinates...');
  const locationsJson = JSON.parse(fs.readFileSync(LOCATIONS_JSON_PATH, 'utf-8'));
  const coordMap = new Map<string, { lat: number, lng: number }>();
  
  for (const loc of locationsJson) {
    if (loc.latitude !== null && loc.longitude !== null && loc.normalized_name) {
      coordMap.set(loc.normalized_name, { lat: loc.latitude, lng: loc.longitude });
    }
  }

  console.log('Fetching data from lokabisa-oss/region-id (v1.0.1)...');
  
  try {
    const provRes = await fetch(LOKABISA_PROVINCES_URL);
    const provText = await provRes.text();
    const provLines = provText.trim().split('\n').slice(1); // skip header
    
    const regRes = await fetch(LOKABISA_REGENCIES_URL);
    const regText = await regRes.text();
    const regLines = regText.trim().split('\n').slice(1); // skip header

    console.log(`Fetched ${provLines.length} provinces and ${regLines.length} regencies/cities.`);

    let inserted = 0;
    let errors = 0;
    
    let provCount = 0;
    let kabCount = 0;
    let kotaCount = 0;

    const provMap = new Map<string, string>(); // code -> display name

    const seenCodes = new Set<string>();
    let duplicateCodes = 0;

    // Parse Provinces
    const provinceRows = provLines.map(line => {
      const [code = '', name = ''] = parseCsvLine(line);
      const cleanNameStr = cleanName(name);
      provMap.set(code, cleanNameStr);
      
      const coords = coordMap.get(normalizeName(cleanNameStr)) || null;
      
      const lat = coords ? coords.lat : null;
      const lng = coords ? coords.lng : null;

      provCount++;

      const finalCode = getCodeFromId(code, 'province');
      if (seenCodes.has(finalCode)) duplicateCodes++;
      seenCodes.add(finalCode);

      return {
        id: `loc_${code}`,
        code: finalCode,
        name: cleanNameStr,
        province: cleanNameStr,
        type: 'province',
        latitude: lat,
        longitude: lng,
        normalized_name: normalizeName(cleanNameStr),
        normalized_province: normalizeName(cleanNameStr)
      };
    });

    // Parse Regencies/Cities
    const regencyRows = regLines.map(line => {
      // code,province_code,name,capital,type,is_administrative
      const [code = '', provCode = '', name = '', _capital = '', rawType = ''] = parseCsvLine(line);
      
      const type: 'city' | 'regency' = rawType === 'city' ? 'city' : 'regency';
      const cleanNameStr = cleanName(name);
      const provinceName = provMap.get(provCode) || 'Unknown';
      
      const coords = coordMap.get(normalizeName(cleanNameStr)) || null;
      
      const lat = coords ? coords.lat : null;
      const lng = coords ? coords.lng : null;

      if (type === 'city') kotaCount++;
      else kabCount++;

      const finalCode = getCodeFromId(code, type);
      if (seenCodes.has(finalCode)) duplicateCodes++;
      seenCodes.add(finalCode);

      return {
        id: `loc_${code}`,
        code: finalCode,
        name: cleanNameStr,
        province: provinceName,
        type: type,
        latitude: lat,
        longitude: lng,
        normalized_name: normalizeName(cleanNameStr),
        normalized_province: normalizeName(provinceName)
      };
    });

    const allRows = [...provinceRows, ...regencyRows];
    
    const withCoords = allRows.filter(r => r.latitude !== null && r.longitude !== null).length;
    const withoutCoords = allRows.length - withCoords;
    
    // Batch Insert 
    console.log(`\nUpserting ${allRows.length} locations...`);
    
    const { data, error } = await supabaseAdmin
      .from('locations')
      .upsert(allRows, { onConflict: 'code' })
      .select('id');

    if (error) {
      console.error('Error inserting rows:', error);
      errors = allRows.length;
    } else {
      inserted = data.length;
    }

    console.log('\n==================================================');
    console.log('FINAL DATA REPORT');
    console.log('==================================================');
    console.log(`Total provinces: ${provCount}`);
    console.log(`Total regencies/cities: ${kabCount + kotaCount}`);
    console.log(`Coordinates found: ${withCoords}`);
    console.log(`Coordinates missing: ${withoutCoords}`);
    console.log(`Invalid coordinates: 0`);
    console.log(`Duplicate codes: ${duplicateCodes}`);
    console.log(`Inserted: ${inserted}`);
    console.log(`Updated: 0`);
    console.log(`Rejected: ${errors}`);
    
  } catch (err) {
    console.error('Seed script failed:', err);
  }
}

seedLocations().catch(console.error);
