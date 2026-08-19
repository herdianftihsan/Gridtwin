import { supabaseAdmin } from '../config/supabase.js';
import { NotFoundError, ForbiddenError, InternalError } from '../utils/errors.js';

export interface ProjectContext {
  id: string;
  user_id: string;
  building_type: 'Ruko' | 'Residential' | 'Office';
  location: string;
  roof_area: number | null;
  monthly_bill: number;
  budget: number;
  objective: 'save_money' | 'reduce_co2' | 'independence';
  created_at: string;
  updated_at: string;
}

export const assertProjectOwnership = async (
  projectId: string,
  userId: string
): Promise<ProjectContext> => {
  const { data, error } = await supabaseAdmin
    .from('projects')
    .select('id, user_id, building_type, location, roof_area, monthly_bill, budget, objective, created_at, updated_at')
    .eq('id', projectId)
    .maybeSingle();

  if (error) {
    throw new InternalError('Database query failed during project ownership verification');
  }

  if (!data) {
    throw new NotFoundError('Project not found');
  }

  if (data.user_id !== userId) {
    throw new ForbiddenError('You do not have permission to access this project');
  }

  return data as ProjectContext;
};