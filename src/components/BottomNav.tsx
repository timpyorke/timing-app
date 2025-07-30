import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, ShoppingCart, Clock } from 'lucide-react';
import { useTranslation } from '../i18n/stub';
import { useCart } from '../context/CartContext';

const BottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { getTotalItems } = useCart();

  const totalItems = getTotalItems();

  const navItems = [
    { path: '/', icon: Home, label: t('navigation.menu') },
    { path: '/cart', icon: ShoppingCart, label: t('navigation.cart'), badge: totalItems },
    { path: '/order-status', icon: Clock, label: t('navigation.orders') },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-base-100 border-t border-base-300 z-40">
      <div className="flex items-center justify-around py-2">
        {navItems.map(({ path, icon: Icon, label, badge }) => {
          const isActive = location.pathname === path;
          
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`flex flex-col items-center space-y-1 px-4 py-2 rounded-lg transition-colors relative ${
                isActive
                  ? 'text-primary bg-primary/10'
                  : 'text-base-content/70 hover:text-primary'
              }`}
              aria-label={label}
            >
              <Icon size={20} />
              <span className="text-xs font-medium">{label}</span>
              {badge && badge > 0 && (
                <span className="absolute -top-1 -right-1 bg-secondary text-secondary-content text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                  {badge > 9 ? '9+' : badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;