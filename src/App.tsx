import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { CartProvider } from './context/CartContext';
import Layout from './components/Layout';
import MenuPage from './pages/MenuPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import OrderStatusPage from './pages/OrderStatusPage';
import OrderDetailPage from './pages/OrderDetailPage';
import CustomerOrdersPage from './pages/CustomerOrdersPage';
import ContactPage from './pages/ContactPage';
import MerchantClosedModal from './components/MerchantClosedModal';
import { useMerchantStatus } from './hooks/useMerchantStatus';
import { getAnonymousUserId } from './utils';

function App() {
  const { merchantStatus, isLoading, forceRefresh } = useMerchantStatus();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Initialize anonymous user ID on app startup
  useEffect(() => {
    const userId = getAnonymousUserId();
    console.log('App initialized with user ID:', userId);
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await forceRefresh();
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <CartProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<MenuPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/order-confirmation/:orderId" element={<OrderConfirmationPage />} />
            <Route path="/order-status" element={<OrderStatusPage />} />
            <Route path="/order-detail/:orderId" element={<OrderDetailPage />} />
            <Route path="/my-orders" element={<CustomerOrdersPage />} />
            <Route path="/contact" element={<ContactPage />} />
          </Routes>
        </Layout>

        {/* Merchant Closed Modal - blocks everything when store is closed */}
        <MerchantClosedModal
          isOpen={!isLoading && merchantStatus.isClose}
          title={merchantStatus.closeTitle}
          message={merchantStatus.closeMessage}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
        />
      </Router>
    </CartProvider>
  );
}

export default App;