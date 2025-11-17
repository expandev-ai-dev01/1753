/**
 * @summary
 * Stock movement controller
 * Handles HTTP requests for stock movement operations
 *
 * @module api/v1/internal/stock-movement
 */

import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import {
  CrudController,
  errorResponse,
  StatusGeneralError,
  successResponse,
} from '@/middleware/crud';
import {
  stockMovementCreate,
  stockMovementList,
  stockBalanceGet,
  stockMovementHistoryGet,
} from '@/services/stockMovement';
import {
  zID,
  zPositiveNumber,
  zNonNegativeNumber,
  zNullableString,
  zDate,
} from '@/utils/zodValidation';

const securable = 'STOCK_MOVEMENT';

/**
 * @api {post} /api/v1/internal/stock-movement Create Stock Movement
 * @apiName CreateStockMovement
 * @apiGroup StockMovement
 * @apiVersion 1.0.0
 *
 * @apiDescription Creates a new stock movement transaction
 *
 * @apiParam {Number} idProduct Product identifier
 * @apiParam {Number} movementType Movement type (0=ENTRADA, 1=SAIDA, 2=AJUSTE, 3=CRIACAO, 4=EXCLUSAO)
 * @apiParam {Number} quantity Movement quantity
 * @apiParam {Number} [unitCost] Unit cost
 * @apiParam {String} [reason] Movement reason (required for AJUSTE and EXCLUSAO)
 * @apiParam {String} [referenceDocument] Reference document
 * @apiParam {String} [batchNumber] Batch number
 * @apiParam {Date} [expirationDate] Expiration date
 * @apiParam {String} [location] Storage location
 *
 * @apiSuccess {Number} idStockMovement Created movement identifier
 *
 * @apiError {String} ValidationError Invalid parameters provided
 * @apiError {String} BusinessRuleError Business rule violation
 * @apiError {String} ServerError Internal server error
 */
export async function postHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  const operation = new CrudController([{ securable, permission: 'CREATE' }]);

  const bodySchema = z.object({
    idProduct: zID,
    movementType: z.coerce.number().int().min(0).max(4),
    quantity: z.coerce.number(),
    unitCost: z.coerce.number().min(0).nullable().optional(),
    reason: zNullableString(255).optional(),
    referenceDocument: zNullableString(50).optional(),
    batchNumber: zNullableString(30).optional(),
    expirationDate: zDate.nullable().optional(),
    location: zNullableString(100).optional(),
  });

  const [validated, error] = await operation.create(req, bodySchema);

  if (!validated) {
    return next(error);
  }

  try {
    const data = await stockMovementCreate({
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

/**
 * @api {get} /api/v1/internal/stock-movement List Stock Movements
 * @apiName ListStockMovements
 * @apiGroup StockMovement
 * @apiVersion 1.0.0
 *
 * @apiDescription Lists stock movements with filtering options
 *
 * @apiParam {Date} [startDate] Filter start date
 * @apiParam {Date} [endDate] Filter end date
 * @apiParam {Number} [movementType] Filter by movement type
 * @apiParam {Number} [idProduct] Filter by product
 * @apiParam {Number} [idUser] Filter by user
 * @apiParam {String} [orderBy] Sort order (DATE_DESC, DATE_ASC, PRODUCT, TYPE, QUANTITY)
 * @apiParam {Number} [limitRecords] Maximum records (1-1000)
 *
 * @apiSuccess {Array} movements List of movements
 *
 * @apiError {String} ValidationError Invalid parameters
 * @apiError {String} ServerError Internal server error
 */
export async function getHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  const operation = new CrudController([{ securable, permission: 'READ' }]);

  const querySchema = z.object({
    startDate: zDate.nullable().optional(),
    endDate: zDate.nullable().optional(),
    movementType: z.coerce.number().int().min(0).max(4).nullable().optional(),
    idProduct: zID.nullable().optional(),
    idUser: zID.nullable().optional(),
    orderBy: z.enum(['DATE_DESC', 'DATE_ASC', 'PRODUCT', 'TYPE', 'QUANTITY']).optional(),
    limitRecords: z.coerce.number().int().min(1).max(1000).optional(),
  });

  const [validated, error] = await operation.list(req, querySchema);

  if (!validated) {
    return next(error);
  }

  try {
    const data = await stockMovementList({
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
