import type { StockMovementHistoryParams, StockMovement } from '../../types';

export interface UseStockHistoryOptions extends StockMovementHistoryParams {
  enabled?: boolean;
}

export interface UseStockHistoryReturn {
  history: StockMovement[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}
