import { ZonClient } from '../zon-client';
import jestFn from '../../../utils/test-support/jestFn';

/**
 * Create a client to mock zon data fetching
 */
export default function createZonClientMock(): ZonClient {
  return {
    /**
     * Get the project's data
     */
    getProjectData: jestFn<ZonClient['getProjectData']>(),
  };
}
