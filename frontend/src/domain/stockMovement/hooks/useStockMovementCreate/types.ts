import type { CreateStockMovementDto } from '../../types';

export interface UseStockMovementCreateOptions {
  onSuccess?: (data: { idStockMovement: number }) => void;
  onError?: (error: Error) => void;
}

export interface UseStockMovementCreateReturn {
  create: (data: CreateStockMovementDto) => Promise<{ idStockMovement: number }>;
  isCreating: boolean;
  error: Error | null;
}
