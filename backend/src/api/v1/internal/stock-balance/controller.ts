/**
 * @summary
 * Stock balance controller
 * Handles HTTP requests for stock balance queries
 *
 * @module api/v1/internal/stock-balance
 */

import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import {
  CrudController,
  errorResponse,
  StatusGeneralError,
  successResponse,
} from '@/middleware/crud';
import { stockBalanceGet } from '@/services/stockMovement';
import { zID, zDate } from '@/utils/zodValidation';

const securable = 'STOCK_BALANCE';

/**
 * @api {get} /api/v1/internal/stock-balance/:idProduct Get Stock Balance
 * @apiName GetStockBalance
 * @apiGroup StockBalance
 * @apiVersion 1.0.0
 *
 * @apiDescription Gets current stock balance for a product
 *
 * @apiParam {Number} idProduct Product identifier
 * @apiParam {Date} [referenceDate] Reference date for balance calculation
 *
 * @apiSuccess {Number} idProduct Product identifier
 * @apiSuccess {Number} currentQuantity Current stock quantity
 * @apiSuccess {Number} totalValue Total stock value
 * @apiSuccess {Number} averageCost Average unit cost
 * @apiSuccess {DateTime} lastMovementDate Last movement date
 * @apiSuccess {Date} referenceDate Reference date
 *
 * @apiError {String} ValidationError Invalid parameters
 * @apiError {String} NotFoundError Product not found
 * @apiError {String} ServerError Internal server error
 */
export async function getHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  const operation = new CrudController([{ securable, permission: 'READ' }]);

  const paramsSchema = z.object({
    idProduct: zID,
    referenceDate: zDate.nullable().optional(),
  });

  const [validated, error] = await operation.read(req, paramsSchema);

  if (!validated) {
    return next(error);
  }

  try {
    const data = await stockBalanceGet({
      ...validated.credential,
      ...validated.params,
    });

    res.json(successResponse(data));
  } catch (error: any) {
    if (error.number === 51000) {
      res.status(400).json(errorResponse(error.message));
    } else {
      next(StatusGeneralError);
    }
  }
}
