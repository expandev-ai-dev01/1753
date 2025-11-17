/**
 * @summary
 * Test data fixtures
 * Provides reusable test data for unit and integration tests
 *
 * @module tests/fixtures
 */

/**
 * @summary
 * Sample account fixture
 */
export const mockAccount = {
  idAccount: 1,
  name: 'Test Account',
  active: true,
};

/**
 * @summary
 * Sample user fixture
 */
export const mockUser = {
  idUser: 1,
  idAccount: 1,
  name: 'Test User',
  email: 'test@example.com',
};

/**
 * @summary
 * Sample credential fixture
 */
export const mockCredential = {
  idAccount: 1,
  idUser: 1,
};
