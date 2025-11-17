import type { CreateStockMovementDto } from '../../types';

export interface StockMovementFormProps {
  onSuccess?: (data: { idStockMovement: number }) => void;
  onCancel?: () => void;
}
