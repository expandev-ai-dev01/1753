/**
 * @summary
 * Stock movement type definitions
 * Defines interfaces and types for stock movement operations
 *
 * @module services/stockMovement/stockMovementTypes
 */

/**
 * @enum MovementType
 * @description Stock movement types
 */
export enum MovementType {
  ENTRADA = 0,
  SAIDA = 1,
  AJUSTE = 2,
  CRIACAO = 3,
  EXCLUSAO = 4,
}

/**
 * @interface StockMovementCreateRequest
 * @description Request parameters for creating stock movement
 */
export interface StockMovementCreateRequest {
  idAccount: number;
  idUser: number;
  idProduct: number;
  movementType: number;
  quantity: number;
  unitCost?: number | null;
  reason?: string | null;
  referenceDocument?: string | null;
  batchNumber?: string | null;
  expirationDate?: Date | null;
  location?: string | null;
}

/**
 * @interface StockMovementListRequest
 * @description Request parameters for listing stock movements
 */
export interface StockMovementListRequest {
  idAccount: number;
  startDate?: Date | null;
  endDate?: Date | null;
  movementType?: number | null;
  idProduct?: number | null;
  idUser?: number | null;
  orderBy?: string;
  limitRecords?: number;
}

/**
 * @interface StockBalanceRequest
 * @description Request parameters for stock balance query
 */
export interface StockBalanceRequest {
  idAccount: number;
  idProduct: number;
  referenceDate?: Date | null;
}

/**
 * @interface StockMovementHistoryRequest
 * @description Request parameters for movement history query
 */
export interface StockMovementHistoryRequest {
  idAccount: number;
  idProduct: number;
  startDate?: Date | null;
  endDate?: Date | null;
  movementType?: number | null;
}

/**
 * @interface StockMovementEntity
 * @description Stock movement entity structure
 */
export interface StockMovementEntity {
  idStockMovement: number;
  idAccount: number;
  idProduct: number;
  idUser: number;
  movementType: number;
  quantity: number;
  unitCost: number | null;
  reason: string | null;
  referenceDocument: string | null;
  batchNumber: string | null;
  expirationDate: Date | null;
  location: string | null;
  dateCreated: Date;
}

/**
 * @interface StockBalanceEntity
 * @description Stock balance entity structure
 */
export interface StockBalanceEntity {
  idProduct: number;
  currentQuantity: number;
  totalValue: number;
  averageCost: number;
  lastMovementDate: Date | null;
  referenceDate: Date;
}
