/**
 * @summary
 * Stock movement business rules
 * Contains business logic for stock movement operations
 *
 * @module services/stockMovement/stockMovementRules
 */

import { dbRequest, ExpectedReturn } from '@/utils/database';
import {
  StockMovementCreateRequest,
  StockMovementListRequest,
  StockBalanceRequest,
  StockMovementHistoryRequest,
} from './stockMovementTypes';

/**
 * @summary
 * Creates a new stock movement
 *
 * @function stockMovementCreate
 * @module services/stockMovement
 *
 * @param {StockMovementCreateRequest} params - Movement creation parameters
 *
 * @returns {Promise<any>} Created movement data
 *
 * @throws {Error} When validation fails or business rules are violated
 */
export async function stockMovementCreate(params: StockMovementCreateRequest): Promise<any> {
  const result = await dbRequest(
    '[functional].[spStockMovementCreate]',
    {
      idAccount: params.idAccount,
      idUser: params.idUser,
      idProduct: params.idProduct,
      movementType: params.movementType,
      quantity: params.quantity,
      unitCost: params.unitCost || null,
      reason: params.reason || null,
      referenceDocument: params.referenceDocument || null,
      batchNumber: params.batchNumber || null,
      expirationDate: params.expirationDate || null,
      location: params.location || null,
    },
    ExpectedReturn.Single
  );

  return result;
}

/**
 * @summary
 * Lists stock movements with filtering
 *
 * @function stockMovementList
 * @module services/stockMovement
 *
 * @param {StockMovementListRequest} params - List parameters
 *
 * @returns {Promise<any[]>} List of movements
 *
 * @throws {Error} When validation fails
 */
export async function stockMovementList(params: StockMovementListRequest): Promise<any[]> {
  const result = await dbRequest(
    '[functional].[spStockMovementList]',
    {
      idAccount: params.idAccount,
      startDate: params.startDate || null,
      endDate: params.endDate || null,
      movementType: params.movementType || null,
      idProduct: params.idProduct || null,
      idUser: params.idUser || null,
      orderBy: params.orderBy || 'DATE_DESC',
      limitRecords: params.limitRecords || 100,
    },
    ExpectedReturn.Multi
  );

  return result;
}

/**
 * @summary
 * Gets stock balance for a product
 *
 * @function stockBalanceGet
 * @module services/stockMovement
 *
 * @param {StockBalanceRequest} params - Balance request parameters
 *
 * @returns {Promise<any>} Stock balance data
 *
 * @throws {Error} When product not found or validation fails
 */
export async function stockBalanceGet(params: StockBalanceRequest): Promise<any> {
  const result = await dbRequest(
    '[functional].[spStockBalanceGet]',
    {
      idAccount: params.idAccount,
      idProduct: params.idProduct,
      referenceDate: params.referenceDate || null,
    },
    ExpectedReturn.Single
  );

  return result;
}

/**
 * @summary
 * Gets movement history for a product
 *
 * @function stockMovementHistoryGet
 * @module services/stockMovement
 *
 * @param {StockMovementHistoryRequest} params - History request parameters
 *
 * @returns {Promise<any[]>} Movement history
 *
 * @throws {Error} When product not found or validation fails
 */
export async function stockMovementHistoryGet(params: StockMovementHistoryRequest): Promise<any[]> {
  const result = await dbRequest(
    '[functional].[spStockMovementHistoryGet]',
    {
      idAccount: params.idAccount,
      idProduct: params.idProduct,
      startDate: params.startDate || null,
      endDate: params.endDate || null,
      movementType: params.movementType || null,
    },
    ExpectedReturn.Multi
  );

  return result;
}
