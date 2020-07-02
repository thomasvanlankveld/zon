import { ZonClient } from './ZonClient';
import zonAdapter from '../../adapters/zonAdapter';
import { Project } from '../../project/Project';

/**
 * Create a client to fetch zon data over HTTP
 */
export default function createZonClientHTTP(url: string): ZonClient {
  return {
    /**
     * Get the project's data
     */
    async getProjectData(): Promise<Project> {
      const response = await fetch(`${url}/input`);
      const json = await response.json();
      return zonAdapter(json);
    },
  };
}
