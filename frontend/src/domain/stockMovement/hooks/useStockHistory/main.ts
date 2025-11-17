/**
 * @hook useStockHistory
 * @summary Hook for fetching movement history of a product
 * @domain stockMovement
 * @type domain-hook
 * @category data
 */

import { useQuery } from '@tanstack/react-query';
import { stockMovementService } from '../../services';
import type { UseStockHistoryOptions, UseStockHistoryReturn } from './types';

export const useStockHistory = (options: UseStockHistoryOptions): UseStockHistoryReturn => {
  const { idProduct, startDate, endDate, movementType, enabled = true } = options;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['stock-history', idProduct, startDate, endDate, movementType],
    queryFn: () => stockMovementService.getHistory({ idProduct, startDate, endDate, movementType }),
    enabled: enabled && !!idProduct,
    staleTime: 2 * 60 * 1000,
  });

  return {
    history: data || [],
    isLoading,
    error,
    refetch,
  };
};
