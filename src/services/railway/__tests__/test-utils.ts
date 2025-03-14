
/**
 * Testing utilities for Railway DB services
 */
import { QueryResult } from "../types";

/**
 * Mock response creator for Railway DB API calls
 */
export function createMockQueryResult<T>(
  data: T[] | null = null, 
  error: string | null = null
): QueryResult<T> {
  return {
    data,
    count: data?.length || 0,
    error
  };
}

/**
 * Fixture creator for mocking fetch responses from Railway DB Edge Function
 */
export function mockFetchResponse(responseData: any, ok = true, status = 200): Response {
  return {
    ok,
    status,
    json: async () => Promise.resolve(responseData),
    text: async () => Promise.resolve(JSON.stringify(responseData)),
  } as Response;
}

/**
 * Spy on console logging methods
 */
export function spyOnConsole() {
  const spies = {
    log: jest.spyOn(console, 'log').mockImplementation(),
    warn: jest.spyOn(console, 'warn').mockImplementation(),
    error: jest.spyOn(console, 'error').mockImplementation(),
  };
  
  return {
    ...spies,
    reset: () => {
      spies.log.mockReset();
      spies.warn.mockReset();
      spies.error.mockReset();
    },
    restore: () => {
      spies.log.mockRestore();
      spies.warn.mockRestore();
      spies.error.mockRestore();
    }
  };
}
