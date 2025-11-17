import type { StockMovementListParams, StockMovement } from '../../types';

export interface UseStockMovementListOptions {
  filters?: StockMovementListParams;
  enabled?: boolean;
}

export interface UseStockMovementListReturn {
  movements: StockMovement[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}
