import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Store,
  Building2,
  ShoppingCart,
  Package,
  Building,
  Check,
  X
} from 'lucide-react';
import Header from '../components/Header';
import { supabase } from '../lib/supabase';

interface Marketplace {
  id: string;
  name: string;
  icon: React.ReactNode;
  selected: boolean;
}

export default function MarketplaceSelector() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [marketplaces, setMarketplaces] = useState<Marketplace[]>([
    { id: 'mercadolivre', name: 'Mercado Livre', icon: <ShoppingBag className="w-6 h-6" />, selected: false },
    { id: 'amazon', name: 'Amazon', icon: <ShoppingCart className="w-6 h-6" />, selected: false },
    { id: 'shopee', name: 'Shopee', icon: <Store className="w-6 h-6" />, selected: false },
    { id: 'shein', name: 'Shein', icon: <Package className="w-6 h-6" />, selected: false },
    { id: 'magalu', name: 'Magazine Luiza', icon: <Building2 className="w-6 h-6" />, selected: false },
    { id: 'olx', name: 'OLX', icon: <Building className="w-6 h-6" />, selected: false },
  ]);

  // Verifica a autenticação ao carregar o componente
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const toggleMarketplace = useCallback((id: string) => {
    if (!isAuthenticated) {
      alert('Por favor, faça login para selecionar marketplaces');
      return;
    }
    setMarketplaces(prev =>
        prev.map(marketplace =>
            marketplace.id === id
                ? { ...marketplace, selected: !marketplace.selected }
                : marketplace
        )
    );
  }, [isAuthenticated]);

  const handleSubmit = useCallback(() => {
    if (!isAuthenticated) {
      alert('Por favor, faça login para continuar');
      return;
    }

    const selectedMarketplaces = marketplaces.filter(m => m.selected);
    if (selectedMarketplaces.length === 0) {
      alert('Por favor, selecione pelo menos um marketplace');
      return;
    }
    // Navega para a página de detalhes do produto, passando os marketplaces selecionados
    navigate('/product-details', {
      state: {
        selectedMarketplaces: selectedMarketplaces.map(m => ({ id: m.id, name: m.name }))
      }
    });
  }, [isAuthenticated, marketplaces, navigate]);

  return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Cadastro Multi-Marketplace</h1>
            <p className="text-gray-600 mb-8">
              {isAuthenticated
                  ? 'Selecione as plataformas onde deseja publicar seu produto'
                  : 'Faça login para começar a cadastrar seus produtos'}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {marketplaces.map(marketplace => (
                  <MarketplaceCard
                      key={marketplace.id}
                      marketplace={marketplace}
                      onClick={() => toggleMarketplace(marketplace.id)}
                      disabled={!isAuthenticated}
                  />
              ))}
            </div>

            <div className="flex justify-end">
              <button
                  onClick={handleSubmit}
                  disabled={!isAuthenticated}
                  className={`px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium transition-colors duration-200 
                ${!isAuthenticated ? 'opacity-50 cursor-not-allowed' : 'hover:bg-indigo-700'}`}
              >
                Continuar
              </button>
            </div>

            {isAuthenticated && marketplaces.some(m => m.selected) && (
                <div className="mt-6 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-800 mb-3">Plataformas selecionadas:</h2>
                  <div className="flex flex-wrap gap-2">
                    {marketplaces
                        .filter(m => m.selected)
                        .map(marketplace => (
                            <span
                                key={marketplace.id}
                                className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium flex items-center gap-2"
                            >
                      {marketplace.icon}
                              {marketplace.name}
                    </span>
                        ))}
                  </div>
                </div>
            )}
          </div>
        </div>
      </div>
  );
}

interface MarketplaceCardProps {
  marketplace: Marketplace;
  onClick: () => void;
  disabled: boolean;
}

function MarketplaceCard({ marketplace, onClick, disabled }: MarketplaceCardProps) {
  const cardClasses = `
    p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer 
    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
    ${marketplace.selected
      ? 'border-indigo-500 bg-indigo-50'
      : 'border-gray-200 hover:border-indigo-200 bg-white'}
  `;

  return (
      <div className={cardClasses} onClick={!disabled ? onClick : undefined}>
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-full ${marketplace.selected ? 'bg-indigo-100' : 'bg-gray-100'}`}>
            {marketplace.icon}
          </div>
          <span className="flex-grow font-medium text-gray-700">
          {marketplace.name}
        </span>
          {marketplace.selected ? (
              <Check className="w-6 h-6 text-indigo-500" />
          ) : (
              <X className="w-6 h-6 text-gray-300" />
          )}
        </div>
      </div>
  );
}
