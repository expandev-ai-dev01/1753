/**
 * @hook useStockBalance
 * @summary Hook for fetching stock balance of a product
 * @domain stockMovement
 * @type domain-hook
 * @category data
 */

import { useQuery } from '@tanstack/react-query';
import { stockMovementService } from '../../services';
import type { UseStockBalanceOptions, UseStockBalanceReturn } from './types';

export const useStockBalance = (options: UseStockBalanceOptions): UseStockBalanceReturn => {
  const { idProduct, referenceDate, enabled = true } = options;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['stock-balance', idProduct, referenceDate],
    queryFn: () => stockMovementService.getBalance(idProduct, referenceDate),
    enabled: enabled && !!idProduct,
    staleTime: 2 * 60 * 1000,
  });

  return {
    balance: data || null,
    isLoading,
    error,
    refetch,
  };
};
