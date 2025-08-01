import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, ShoppingCart, Clock } from 'lucide-react';
import { useTranslation } from '../i18n/stub';

const BottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const navItems = [
    { path: '/', icon: Home, label: t('navigation.menu') },
    { path: '/cart', icon: ShoppingCart, label: t('navigation.cart') },
    { path: '/order-status', icon: Clock, label: t('navigation.orders') },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-base-100 border-t border-base-300 z-40">
      <div className="flex items-center justify-around py-2">
        {navItems.map(({ path, icon: Icon, label }) => {
          const isActive = location.pathname === path;
          
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`flex flex-col items-center space-y-1 px-4 py-2 rounded-lg transition-colors ${
                isActive
                  ? 'text-primary bg-primary/10'
                  : 'text-base-content/70 hover:text-primary'
              }`}
              aria-label={label}
            >
              <Icon size={20} />
              <span className="text-xs font-medium">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;