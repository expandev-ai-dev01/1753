/**
 * @summary
 * Stock movement history controller
 * Handles HTTP requests for product movement history
 *
 * @module api/v1/internal/stock-movement-history
 */

import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import {
  CrudController,
  errorResponse,
  StatusGeneralError,
  successResponse,
} from '@/middleware/crud';
import { stockMovementHistoryGet } from '@/services/stockMovement';
import { zID, zDate } from '@/utils/zodValidation';

const securable = 'STOCK_MOVEMENT_HISTORY';

/**
 * @api {get} /api/v1/internal/stock-movement-history/:idProduct Get Movement History
 * @apiName GetMovementHistory
 * @apiGroup StockMovementHistory
 * @apiVersion 1.0.0
 *
 * @apiDescription Gets complete movement history for a product
 *
 * @apiParam {Number} idProduct Product identifier
 * @apiParam {Date} [startDate] Filter start date
 * @apiParam {Date} [endDate] Filter end date
 * @apiParam {Number} [movementType] Filter by movement type
 *
 * @apiSuccess {Array} movements Complete movement history
 *
 * @apiError {String} ValidationError Invalid parameters
 * @apiError {String} NotFoundError Product not found
 * @apiError {String} ServerError Internal server error
 */
export async function getHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  const operation = new CrudController([{ securable, permission: 'READ' }]);

  const paramsSchema = z.object({
    idProduct: zID,
    startDate: zDate.nullable().optional(),
    endDate: zDate.nullable().optional(),
    movementType: z.coerce.number().int().min(0).max(4).nullable().optional(),
  });

  const [validated, error] = await operation.read(req, paramsSchema);

  if (!validated) {
    return next(error);
  }

  try {
    const data = await stockMovementHistoryGet({
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
