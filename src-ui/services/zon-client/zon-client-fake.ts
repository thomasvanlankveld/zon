import { ZonClient } from './zon-client';
import tokeiAdapter from '../../adapters/tokeiAdapter';
import { Project } from '../../project/Project';

/**
 * Create a client to fetch fake zon data
 */
export default function createZonClientFake(): ZonClient {
  return {
    /**
     * Get the project's data
     */
    async getProjectData(): Promise<Project> {
      const reduxData = await import('../../../input/redux.json');
      return tokeiAdapter(reduxData, 'redux');
    },
  };
}
