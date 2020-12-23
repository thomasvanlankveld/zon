import { ZonClient } from '../ZonClient';
import jestFn, { JestFn } from '../../../test-support/jestFn';

/**
 * Type of the client to mock zon data fetching
 */
interface ZonClientMock extends ZonClient {
  getProjectData: JestFn<ZonClient['getProjectData']>;
}

/**
 * Create a client to mock zon data fetching
 */
export default function createZonClientMock(): ZonClientMock {
  return {
    /**
     * Get the project's data
     */
    getProjectData: jestFn<ZonClient['getProjectData']>(),
  };
}
