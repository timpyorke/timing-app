import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Clock, Phone, ShoppingCart } from 'lucide-react';
import { useTranslation } from '../i18n/stub';
import { useCart } from '../hooks/useCart';

const BottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { toggleCart, getTotalItems } = useCart();

  const navItems = [
    {
      key: 'menu',
      path: '/',
      icon: Home,
      label: t('navigation.menu'),
      action: () => navigate('/')
    },
    {
      key: 'cart',
      path: null,
      icon: ShoppingCart,
      label: t('navigation.cart'),
      action: toggleCart,
      badge: getTotalItems()
    },
    {
      key: 'orders',
      path: '/order-status',
      icon: Clock,
      label: t('navigation.orders'),
      action: () => navigate('/order-status')
    },
    {
      key: 'contact',
      path: '/contact',
      icon: Phone,
      label: t('navigation.contact'),
      action: () => navigate('/contact')
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-base-100 border-t border-base-300 z-40">
      <div className="flex items-center justify-around py-2">
        {navItems.map(({ key, path, icon: Icon, label, action, badge }) => {
          const isActive = path && location.pathname === path;

          return (
            <button
              key={key}
              onClick={action}
              className={`flex flex-col items-center space-y-1 px-4 py-2 rounded-lg transition-colors relative ${isActive
                ? 'text-primary bg-primary/10'
                : 'text-base-content/70 hover:text-primary'
                }`}
              aria-label={label}
            >
              <div className="relative">
                <Icon size={20} />
                {badge && badge > 0 ? <span className="absolute -top-2 -right-4 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                  {badge > 9 ? '9+' : badge}
                </span> : <span></span>}
              </div>
              <span className="text-xs font-medium">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;