import { Project } from '../../project/Project';

/**
 * A zon client
 */
export interface ZonClient {
  /**
   * Get the project's data
   */
  getProjectData(): Promise<Project>;
}
