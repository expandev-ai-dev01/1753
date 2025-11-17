/**
 * @service stockMovementService
 * @summary Service for stock movement operations using REST API
 * @domain stockMovement
 * @type rest-service
 * @apiContext internal
 */

import { authenticatedClient } from '@/core/lib/api';
import type {
  StockMovement,
  CreateStockMovementDto,
  StockMovementListParams,
  StockBalance,
  StockMovementHistoryParams,
} from '../types';

export const stockMovementService = {
  /**
   * @endpoint POST /api/v1/internal/stock-movement
   * @summary Creates a new stock movement
   */
  async create(data: CreateStockMovementDto): Promise<{ idStockMovement: number }> {
    const response = await authenticatedClient.post('/stock-movement', data);
    return response.data.data;
  },

  /**
   * @endpoint GET /api/v1/internal/stock-movement
   * @summary Lists stock movements with filters
   */
  async list(params: StockMovementListParams): Promise<StockMovement[]> {
    const response = await authenticatedClient.get('/stock-movement', { params });
    return response.data.data;
  },

  /**
   * @endpoint GET /api/v1/internal/stock-balance/:idProduct
   * @summary Gets current stock balance for a product
   */
  async getBalance(idProduct: number, referenceDate?: string): Promise<StockBalance> {
    const response = await authenticatedClient.get(`/stock-balance/${idProduct}`, {
      params: { referenceDate },
    });
    return response.data.data;
  },

  /**
   * @endpoint GET /api/v1/internal/stock-movement-history/:idProduct
   * @summary Gets complete movement history for a product
   */
  async getHistory(params: StockMovementHistoryParams): Promise<StockMovement[]> {
    const { idProduct, ...queryParams } = params;
    const response = await authenticatedClient.get(`/stock-movement-history/${idProduct}`, {
      params: queryParams,
    });
    return response.data.data;
  },
};
