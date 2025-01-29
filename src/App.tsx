import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MarketplaceSelector from './pages/MarketplaceSelector';
import ProductDetails from './pages/ProductDetails';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Routes>
      <Route path="/" element={<MarketplaceSelector />} />
      <Route
        path="/product-details"
        element={
          <ProtectedRoute>
            <ProductDetails />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;