/**
 * @summary
 * Test helper functions
 * Provides utility functions for testing
 *
 * @module tests/helpers
 */

/**
 * @summary
 * Creates a mock Express request object
 *
 * @function mockRequest
 * @module tests/helpers
 *
 * @param {object} options - Request options
 *
 * @returns {object} Mock request object
 */
export function mockRequest(options: any = {}): any {
  return {
    params: options.params || {},
    query: options.query || {},
    body: options.body || {},
    headers: options.headers || {},
    ...options,
  };
}

/**
 * @summary
 * Creates a mock Express response object
 *
 * @function mockResponse
 * @module tests/helpers
 *
 * @returns {object} Mock response object
 */
export function mockResponse(): any {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
}

/**
 * @summary
 * Creates a mock Express next function
 *
 * @function mockNext
 * @module tests/helpers
 *
 * @returns {Function} Mock next function
 */
export function mockNext(): any {
  return jest.fn();
}
