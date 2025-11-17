import { useNavigate } from 'react-router-dom';

/**
 * @page HomePage
 * @summary Welcome page for StockBox application.
 * @domain core
 * @type landing-page
 * @category public
 */
export const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">StockBox</h1>
        <p className="text-lg text-gray-600 mb-8">Sistema de Controle de Estoque</p>
        <button
          onClick={() => navigate('/stock-movements')}
          className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Acessar Movimentações
        </button>
      </div>
    </div>
  );
};

export default HomePage;
