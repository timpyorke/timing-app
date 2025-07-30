import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { getTotalItems, toggleCart } = useCart();

  const isHome = location.pathname === '/';
  const totalItems = getTotalItems();

  const getTitle = () => {
    switch (location.pathname) {
      case '/':
        return 'TIMING';
      case '/cart':
        return 'Cart';
      case '/checkout':
        return 'Checkout';
      case '/order-status':
        return 'Order Status';
      default:
        if (location.pathname.startsWith('/drink/')) {
          return 'Drink Details';
        }
        if (location.pathname.startsWith('/order-confirmation/')) {
          return 'Order Confirmed';
        }
        return 'TIMING';
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-primary text-white shadow-lg border-b border-primary-focus header-solid">
      <div className="flex items-center justify-between px-4 py-4">
        <div className="flex items-center space-x-3">
          {!isHome && (
            <button
              onClick={() => navigate(-1)}
              className="btn btn-ghost btn-sm p-2 text-white hover:bg-white/10"
              aria-label="Go back"
            >
              <ArrowLeft size={20} />
            </button>
          )}
          <h1 className="text-lg font-bold text-white">{getTitle()}</h1>
        </div>

        {location.pathname !== '/cart' && (
          <button
            onClick={toggleCart}
            className="btn btn-ghost btn-sm relative p-2 text-white hover:bg-white/10"
            aria-label={`Cart with ${totalItems} items`}
          >
            <ShoppingCart size={20} />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-secondary text-secondary-content text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                {totalItems > 9 ? '9+' : totalItems}
              </span>
            )}
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;