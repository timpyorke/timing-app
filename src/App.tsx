import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { CartProvider } from './context/CartContext';
import Layout from './components/Layout';
import MenuPage from './pages/MenuPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import OrderStatusPage from './pages/OrderStatusPage';
import ContactPage from './pages/ContactPage';
import MerchantClosedModal from './components/MerchantClosedModal';
import { useMerchantStatus } from './hooks/useMerchantStatus';
import { getAnonymousUserId } from './utils';

function App() {
  const { merchantStatus, isLoading } = useMerchantStatus();

  // Initialize anonymous user ID on app startup
  useEffect(() => {
    getAnonymousUserId();
  }, []);

  return (
    <CartProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<MenuPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/order-confirmation/:orderId" element={<OrderConfirmationPage />} />
            <Route path="/order-status" element={<OrderStatusPage />} />
            <Route path="/contact" element={<ContactPage />} />
          </Routes>
        </Layout>

        {/* Merchant Closed Modal - blocks everything when store is closed */}
        <MerchantClosedModal
          isOpen={!isLoading && merchantStatus.isClose}
          title={merchantStatus.closeTitle}
          message={merchantStatus.closeMessage}
        />
      </Router>
    </CartProvider>
  );
}

export default App;