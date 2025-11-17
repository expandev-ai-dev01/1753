/**
 * @module domain/stockMovement/types
 * @summary Type definitions for stock movement domain
 */

export enum MovementType {
  ENTRADA = 0,
  SAIDA = 1,
  AJUSTE = 2,
  CRIACAO = 3,
  EXCLUSAO = 4,
}

export interface StockMovement {
  idStockMovement: number;
  idProduct: number;
  movementType: MovementType;
  quantity: number;
  unitCost?: number | null;
  reason?: string | null;
  referenceDocument?: string | null;
  batchNumber?: string | null;
  expirationDate?: string | null;
  location?: string | null;
  movementDate: string;
  idUser: number;
  userName?: string;
  productName?: string;
  resultingBalance?: number;
}

export interface CreateStockMovementDto {
  idProduct: number;
  movementType: MovementType;
  quantity: number;
  unitCost?: number | null;
  reason?: string | null;
  referenceDocument?: string | null;
  batchNumber?: string | null;
  expirationDate?: string | null;
  location?: string | null;
}

export interface StockMovementListParams {
  startDate?: string | null;
  endDate?: string | null;
  movementType?: MovementType | null;
  idProduct?: number | null;
  idUser?: number | null;
  orderBy?: 'DATE_DESC' | 'DATE_ASC' | 'PRODUCT' | 'TYPE' | 'QUANTITY';
  limitRecords?: number;
}

export interface StockBalance {
  idProduct: number;
  currentQuantity: number;
  totalValue: number;
  averageCost: number;
  lastMovementDate: string;
  referenceDate: string;
}

export interface StockMovementHistoryParams {
  idProduct: number;
  startDate?: string | null;
  endDate?: string | null;
  movementType?: MovementType | null;
}
