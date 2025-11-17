/**
 * @summary
 * Internal API routes configuration
 * Authenticated endpoints for business operations
 *
 * @module routes/v1/internalRoutes
 */

import { Router } from 'express';
import * as stockMovementController from '@/api/v1/internal/stock-movement/controller';
import * as stockBalanceController from '@/api/v1/internal/stock-balance/controller';
import * as stockMovementHistoryController from '@/api/v1/internal/stock-movement-history/controller';

const router = Router();

/**
 * Stock movement routes
 */
router.post('/stock-movement', stockMovementController.postHandler);
router.get('/stock-movement', stockMovementController.getHandler);

/**
 * Stock balance routes
 */
router.get('/stock-balance/:idProduct', stockBalanceController.getHandler);

/**
 * Stock movement history routes
 */
router.get('/stock-movement-history/:idProduct', stockMovementHistoryController.getHandler);

export default router;
