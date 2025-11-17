/**
 * @component StockMovementForm
 * @summary Form for creating stock movements
 * @domain stockMovement
 * @type domain-component
 * @category form
 */

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useStockMovementCreate } from '../../hooks/useStockMovementCreate';
import { MovementType } from '../../types';
import type { StockMovementFormProps } from './types';

const formSchema = z.object({
  idProduct: z.number().int().positive('Produto é obrigatório'),
  movementType: z.number().int().min(0).max(4),
  quantity: z.number().refine((val) => val !== 0, 'Quantidade não pode ser zero'),
  unitCost: z.number().min(0).nullable().optional(),
  reason: z.string().max(255).nullable().optional(),
  referenceDocument: z.string().max(50).nullable().optional(),
  batchNumber: z.string().max(30).nullable().optional(),
  expirationDate: z.string().nullable().optional(),
  location: z.string().max(100).nullable().optional(),
});

type FormData = z.infer<typeof formSchema>;

export const StockMovementForm = (props: StockMovementFormProps) => {
  const { onSuccess, onCancel } = props;

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      movementType: MovementType.ENTRADA,
    },
  });

  const { create, isCreating } = useStockMovementCreate({
    onSuccess: (data) => {
      onSuccess?.(data);
    },
  });

  const movementType = watch('movementType');
  const requiresReason =
    movementType === MovementType.AJUSTE || movementType === MovementType.EXCLUSAO;

  const onSubmit = async (data: FormData) => {
    await create(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Movimentação</label>
        <select
          {...register('movementType', { valueAsNumber: true })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value={MovementType.ENTRADA}>Entrada</option>
          <option value={MovementType.SAIDA}>Saída</option>
          <option value={MovementType.AJUSTE}>Ajuste</option>
          <option value={MovementType.CRIACAO}>Criação</option>
          <option value={MovementType.EXCLUSAO}>Exclusão</option>
        </select>
        {errors.movementType && (
          <p className="text-sm text-red-600 mt-1">{errors.movementType.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">ID do Produto *</label>
        <input
          type="number"
          {...register('idProduct', { valueAsNumber: true })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.idProduct && (
          <p className="text-sm text-red-600 mt-1">{errors.idProduct.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Quantidade *</label>
        <input
          type="number"
          step="0.01"
          {...register('quantity', { valueAsNumber: true })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.quantity && <p className="text-sm text-red-600 mt-1">{errors.quantity.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Custo Unitário</label>
        <input
          type="number"
          step="0.01"
          {...register('unitCost', { valueAsNumber: true })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.unitCost && <p className="text-sm text-red-600 mt-1">{errors.unitCost.message}</p>}
      </div>

      {requiresReason && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Motivo *</label>
          <textarea
            {...register('reason')}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.reason && <p className="text-sm text-red-600 mt-1">{errors.reason.message}</p>}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Documento de Referência
        </label>
        <input
          type="text"
          {...register('referenceDocument')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Número do Lote</label>
        <input
          type="text"
          {...register('batchNumber')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Data de Validade</label>
        <input
          type="date"
          {...register('expirationDate')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Localização</label>
        <input
          type="text"
          {...register('location')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={isCreating}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isCreating ? 'Registrando...' : 'Registrar Movimentação'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
};
