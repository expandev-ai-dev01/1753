/**
 * @module stockMovement
 * @summary Stock movement domain module for managing inventory transactions
 * @domain functional
 * @version 1.0.0
 */

export * from './types';
export * from './services';
export * from './hooks/useStockMovementCreate';
export * from './hooks/useStockMovementList';
export * from './hooks/useStockBalance';
export * from './hooks/useStockHistory';
export * from './components/StockMovementForm';
export * from './components/StockMovementList';

export const moduleMetadata = {
  name: 'stockMovement',
  domain: 'functional',
  version: '1.0.0',
  publicComponents: ['StockMovementForm', 'StockMovementList'],
  publicHooks: [
    'useStockMovementCreate',
    'useStockMovementList',
    'useStockBalance',
    'useStockHistory',
  ],
  publicServices: ['stockMovementService'],
  dependencies: {
    internal: ['@/core/lib/api', '@/core/lib/queryClient'],
    external: ['react', 'react-hook-form', 'zod', '@tanstack/react-query', 'axios', 'date-fns'],
    domains: [],
  },
  exports: {
    components: ['StockMovementForm', 'StockMovementList'],
    hooks: ['useStockMovementCreate', 'useStockMovementList', 'useStockBalance', 'useStockHistory'],
    services: ['stockMovementService'],
    types: [
      'StockMovement',
      'CreateStockMovementDto',
      'StockMovementListParams',
      'StockBalance',
      'MovementType',
    ],
  },
} as const;
