import { Request, Response } from 'express';
import { locationService } from '../services/location.service.js';

export const locationController = {
  search: async (req: Request, res: Response) => {
    try {
      const q = req.query.q as string;
      if (!q || typeof q !== 'string' || q.trim().length === 0) {
        return res.status(200).json([]);
      }

      // Max query length validation to prevent abuse
      if (q.length > 100) {
        return res.status(400).json({ error: 'Query is too long' });
      }

      const results = await locationService.search(q, 10);
      
      // Return only what the UI needs, matching the requested format
      const uiResults = results.map(loc => ({
        id: loc.id,
        name: loc.name,
        province: loc.province_name,
        administrativeLevel: loc.administrative_level,
        latitude: loc.latitude,
        longitude: loc.longitude,
      }));

      return res.status(200).json(uiResults);
    } catch (error) {
      console.error('Location search error:', error);
      return res.status(500).json({ error: 'Failed to search locations' });
    }
  }
};
