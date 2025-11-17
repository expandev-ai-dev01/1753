/**
 * @hook useStockMovementCreate
 * @summary Hook for creating stock movements
 * @domain stockMovement
 * @type domain-hook
 * @category data
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { stockMovementService } from '../../services';
import type { UseStockMovementCreateOptions, UseStockMovementCreateReturn } from './types';

export const useStockMovementCreate = (
  options: UseStockMovementCreateOptions = {}
): UseStockMovementCreateReturn => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: stockMovementService.create,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['stock-movements'] });
      queryClient.invalidateQueries({ queryKey: ['stock-balance'] });
      queryClient.invalidateQueries({ queryKey: ['stock-history'] });
      options.onSuccess?.(data);
    },
    onError: (error: Error) => {
      options.onError?.(error);
    },
  });

  return {
    create: mutation.mutateAsync,
    isCreating: mutation.isPending,
    error: mutation.error,
  };
};
