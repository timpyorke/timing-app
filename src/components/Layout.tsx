import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Header from './Header';
import BottomNav from './BottomNav';
import CartDrawer from './CartDrawer';
import { useCart } from '../hooks/useCart';
import { CONSTANTS } from '../utils';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const { customer, setCustomer } = useCart();
  const hideBottomNav = ['/checkout', '/order-confirmation'].some(path => 
    location.pathname.includes(path)
  );

  // Capture table param from URL and store/update cart customer
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const table = params.get('table');
    if (table && table.trim()) {
      try {
        localStorage.setItem(CONSTANTS.STORAGE_KEYS.TABLE_NUMBER, table.trim());
      } catch (e) {
        // Ignore storage errors
      }
      setCustomer({
        name: customer?.name || '',
        phone: customer?.phone || '',
        tableNumber: table.trim(),
      });
    }
  }, [location.search]);

  return (
    <div className="min-h-screen bg-base-100">
      <Header />
      <main className={`pb-${hideBottomNav ? '4' : '20'} pt-16`}>
        {children}
      </main>
      {!hideBottomNav && <BottomNav />}
      <CartDrawer />
    </div>
  );
};

export default Layout;
