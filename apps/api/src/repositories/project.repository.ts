// apps/api/src/repositories/project.repository.ts
import { supabaseAdmin } from '../config/supabase.js';
import { CreateProjectInput, UpdateProjectInput } from '../schemas/project.schema.js';

export interface ProjectRecord {
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

export class ProjectRepository {
  async create(userId: string, data: CreateProjectInput): Promise<ProjectRecord> {
    const { data: created, error } = await supabaseAdmin
      .from('projects')
      .insert({
        user_id: userId,
        building_type: data.building_type,
        location: data.location,
        roof_area: data.roof_area ?? null,
        monthly_bill: data.monthly_bill,
        budget: data.budget,
        objective: data.objective,
      })
      .select()
      .single();

    if (error || !created) {
      throw new Error(`Failed to create project in database: ${error?.message}`);
    }

    return created as ProjectRecord;
  }

  async findById(projectId: string): Promise<ProjectRecord | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .maybeSingle();

      if (error || !data) {
        return null;
      }

      return data as ProjectRecord;
    } catch {
      return null;
    }
  }

  async findByUserId(
    userId: string,
    page: number,
    limit: number
  ): Promise<{ data: ProjectRecord[]; total: number }> {
    const offset = (page - 1) * limit;

    const { data, error, count } = await supabaseAdmin
      .from('projects')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new Error(`Failed to list projects: ${error.message}`);
    }

    return {
      data: (data as ProjectRecord[]) || [],
      total: count ?? 0,
    };
  }

  async update(projectId: string, data: UpdateProjectInput): Promise<ProjectRecord> {
    const { data: updated, error } = await supabaseAdmin
      .from('projects')
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq('id', projectId)
      .select()
      .single();

    if (error || !updated) {
      throw new Error(`Failed to update project: ${error?.message}`);
    }

    return updated as ProjectRecord;
  }

  async delete(projectId: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from('projects')
      .delete()
      .eq('id', projectId);

    if (error) {
      throw new Error(`Failed to delete project: ${error.message}`);
    }
  }
}

export const projectRepository = new ProjectRepository();