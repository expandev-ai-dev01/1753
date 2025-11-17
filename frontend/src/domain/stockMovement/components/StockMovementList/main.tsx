/**
 * @component StockMovementList
 * @summary Displays list of stock movements with filters
 * @domain stockMovement
 * @type domain-component
 * @category display
 */

import { format } from 'date-fns';
import { useStockMovementList } from '../../hooks/useStockMovementList';
import { MovementType } from '../../types';
import type { StockMovementListProps } from './types';

const movementTypeLabels: Record<MovementType, string> = {
  [MovementType.ENTRADA]: 'Entrada',
  [MovementType.SAIDA]: 'Saída',
  [MovementType.AJUSTE]: 'Ajuste',
  [MovementType.CRIACAO]: 'Criação',
  [MovementType.EXCLUSAO]: 'Exclusão',
};

export const StockMovementList = (props: StockMovementListProps) => {
  const { filters } = props;
  const { movements, isLoading, error } = useStockMovementList({ filters });

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-600">
        Erro ao carregar movimentações: {error.message}
      </div>
    );
  }

  if (movements.length === 0) {
    return <div className="text-center py-8 text-gray-500">Nenhuma movimentação encontrada</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Data/Hora
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Tipo
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Produto
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Quantidade
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Saldo
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Usuário
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {movements.map((movement) => (
            <tr key={movement.idStockMovement} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {format(new Date(movement.movementDate), 'dd/MM/yyyy HH:mm')}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                  {movementTypeLabels[movement.movementType]}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {movement.productName || `Produto #${movement.idProduct}`}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                {movement.quantity > 0 ? '+' : ''}
                {movement.quantity}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-gray-900">
                {movement.resultingBalance ?? '-'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {movement.userName || `Usuário #${movement.idUser}`}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
