import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { CartProvider } from './context/CartContext';
import Layout from './components/Layout';
import MenuPage from './pages/MenuPage';
import MenuDetailsPage from './pages/MenuDetailsPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import OrderStatusPage from './pages/OrderStatusPage';
import OrderDetailPage from './pages/OrderDetailPage';
import CustomerOrdersPage from './pages/CustomerOrdersPage';
import { getAnonymousUserId } from './utils';

function App() {
  // Initialize anonymous user ID on app startup
  useEffect(() => {
    const userId = getAnonymousUserId();
    console.log('App initialized with user ID:', userId);
  }, []);

  return (
    <CartProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<MenuPage />} />
            <Route path="/drink/:id" element={<MenuDetailsPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/order-confirmation/:orderId" element={<OrderConfirmationPage />} />
            <Route path="/order-status" element={<OrderStatusPage />} />
            <Route path="/order-detail/:orderId" element={<OrderDetailPage />} />
            <Route path="/my-orders" element={<CustomerOrdersPage />} />
          </Routes>
        </Layout>
      </Router>
    </CartProvider>
  );
}

export default App;