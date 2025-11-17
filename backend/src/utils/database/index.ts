/**
 * @summary
 * Database utility functions
 * Provides helpers for database operations
 *
 * @module utils/database
 */

import { getPool, ExpectedReturn, IRecordSet } from '@/instances/database';

/**
 * @summary
 * Executes a stored procedure
 *
 * @function dbRequest
 * @module utils/database
 *
 * @param {string} procedure - Stored procedure name
 * @param {object} parameters - Procedure parameters
 * @param {ExpectedReturn} expectedReturn - Expected return type
 * @param {any} transaction - Optional transaction
 * @param {string[]} resultSetNames - Optional result set names
 *
 * @returns {Promise<any>} Query result
 *
 * @throws {Error} When query fails
 */
export async function dbRequest(
  procedure: string,
  parameters: { [key: string]: any },
  expectedReturn: ExpectedReturn,
  transaction?: any,
  resultSetNames?: string[]
): Promise<any> {
  const pool = await getPool();
  const request = transaction ? transaction.request() : pool.request();

  for (const [key, value] of Object.entries(parameters)) {
    request.input(key, value);
  }

  const result = await request.execute(procedure);

  switch (expectedReturn) {
    case ExpectedReturn.None:
      return null;
    case ExpectedReturn.Single:
      return result.recordset[0];
    case ExpectedReturn.Multi:
      if (resultSetNames && resultSetNames.length > 0) {
        const namedResults: { [key: string]: any } = {};
        resultSetNames.forEach((name, index) => {
          namedResults[name] = result.recordsets[index];
        });
        return namedResults;
      }
      return result.recordsets;
    default:
      return result.recordset;
  }
}

/**
 * @summary
 * Begins a database transaction
 *
 * @function beginTransaction
 * @module utils/database
 *
 * @returns {Promise<any>} Transaction object
 */
export async function beginTransaction(): Promise<any> {
  const pool = await getPool();
  const transaction = pool.transaction();
  await transaction.begin();
  return transaction;
}

/**
 * @summary
 * Commits a database transaction
 *
 * @function commitTransaction
 * @module utils/database
 *
 * @param {any} transaction - Transaction object
 *
 * @returns {Promise<void>}
 */
export async function commitTransaction(transaction: any): Promise<void> {
  await transaction.commit();
}

/**
 * @summary
 * Rolls back a database transaction
 *
 * @function rollbackTransaction
 * @module utils/database
 *
 * @param {any} transaction - Transaction object
 *
 * @returns {Promise<void>}
 */
export async function rollbackTransaction(transaction: any): Promise<void> {
  await transaction.rollback();
}
