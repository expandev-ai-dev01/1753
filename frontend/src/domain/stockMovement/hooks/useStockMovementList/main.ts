/**
 * @hook useStockMovementList
 * @summary Hook for listing stock movements with filters
 * @domain stockMovement
 * @type domain-hook
 * @category data
 */

import { useQuery } from '@tanstack/react-query';
import { stockMovementService } from '../../services';
import type { UseStockMovementListOptions, UseStockMovementListReturn } from './types';

export const useStockMovementList = (
  options: UseStockMovementListOptions = {}
): UseStockMovementListReturn => {
  const { filters = {}, enabled = true } = options;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['stock-movements', filters],
    queryFn: () => stockMovementService.list(filters),
    enabled,
    staleTime: 2 * 60 * 1000,
  });

  return {
    movements: data || [],
    isLoading,
    error,
    refetch,
  };
};
