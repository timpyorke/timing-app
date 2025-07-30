import React from 'react';
import { useLocation } from 'react-router-dom';
import Header from './Header';
import BottomNav from './BottomNav';
import CartDrawer from './CartDrawer';
import PWAInstallPrompt from './PWAInstallPrompt';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const hideBottomNav = ['/checkout', '/order-confirmation'].some(path => 
    location.pathname.includes(path)
  );

  return (
    <div className="min-h-screen bg-base-100">
      <Header />
      <main className={`pb-${hideBottomNav ? '4' : '20'} pt-16`}>
        {children}
      </main>
      {!hideBottomNav && <BottomNav />}
      <CartDrawer />
      <PWAInstallPrompt />
    </div>
  );
};

export default Layout;