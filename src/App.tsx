import { Routes, Route } from 'react-router-dom';
import MarketplaceSelector from './pages/MarketplaceSelector';
import ProductDetails from './pages/ProductDetails';
import ProtectedRoute from './components/ProtectedRoute';
import ProfilePage from './components/ProfilePage';

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
            <Route
                path="/profile"
                element={
                    <ProtectedRoute>
                        <ProfilePage />
                    </ProtectedRoute>
                }
            />
        </Routes>
    );
}

export default App;