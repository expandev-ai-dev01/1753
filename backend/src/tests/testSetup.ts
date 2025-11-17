/**
 * @summary
 * Global test setup and configuration
 * Provides shared test utilities and environment setup
 *
 * @module tests/testSetup
 */

import dotenv from 'dotenv';

dotenv.config({ path: '.env.test' });

/**
 * @summary
 * Setup function to run before all tests
 */
export function setupTests(): void {
  process.env.NODE_ENV = 'test';
  console.log('Test environment initialized');
}

/**
 * @summary
 * Teardown function to run after all tests
 */
export function teardownTests(): void {
  console.log('Test environment cleaned up');
}

beforeAll(() => {
  setupTests();
});

afterAll(() => {
  teardownTests();
});
