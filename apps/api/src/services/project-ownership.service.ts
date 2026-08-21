// apps/api/src/services/project-ownership.service.ts
import { projectRepository, ProjectRecord } from '../repositories/project.repository.js';
import { NotFoundError, ForbiddenError } from '../utils/errors.js';

export type ProjectOwnershipRecord = ProjectRecord;

/**
 * Asserts project ownership.
 * @param projectId - The target project ID (Param 1 from auth.test.ts)
 * @param userId - The authenticated user ID (Param 2 from auth.test.ts)
 */
export const assertProjectOwnership = async (
  projectId: string,
  userId: string
): Promise<ProjectRecord> => {
  const project = await projectRepository.findById(projectId);

  if (!project) {
    throw new NotFoundError('Project not found');
  }

  if (project.user_id !== userId) {
    throw new ForbiddenError('You do not have permission to access this project');
  }

  return project;
};

export class ProjectOwnershipService {
  async verifyOwnership(userId: string, projectId: string): Promise<ProjectRecord> {
    return assertProjectOwnership(projectId, userId);
  }
}

export const projectOwnershipService = new ProjectOwnershipService();