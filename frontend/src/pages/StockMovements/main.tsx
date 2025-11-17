/**
 * @page StockMovementsPage
 * @summary Page for managing stock movements
 * @domain stockMovement
 * @type management-page
 * @category stock-management
 */

import { useState } from 'react';
import { StockMovementForm } from '@/domain/stockMovement/components/StockMovementForm';
import { StockMovementList } from '@/domain/stockMovement/components/StockMovementList';
import type { StockMovementsPageProps } from './types';

export const StockMovementsPage = (props: StockMovementsPageProps) => {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Movimentações de Estoque</h1>
          <p className="mt-2 text-sm text-gray-600">
            Registre e consulte todas as movimentações do estoque
          </p>
        </div>

        <div className="mb-6">
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            {showForm ? 'Ocultar Formulário' : 'Nova Movimentação'}
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Registrar Movimentação</h2>
            <StockMovementForm
              onSuccess={() => {
                setShowForm(false);
              }}
              onCancel={() => setShowForm(false)}
            />
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Histórico de Movimentações</h2>
          </div>
          <StockMovementList />
        </div>
      </div>
    </div>
  );
};

export default StockMovementsPage;
