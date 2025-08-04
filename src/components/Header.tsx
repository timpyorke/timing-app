import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Languages } from 'lucide-react';
import { useTranslation } from '../i18n/stub';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const isHome = location.pathname === '/';

  const toggleLanguage = () => {
    const newLanguage = i18n.language === 'th' ? 'en' : 'th';
    i18n.changeLanguage(newLanguage);
  };

  const getTitle = () => {
    switch (location.pathname) {
      case '/':
        return t('header.timing');
      case '/checkout':
        return t('header.checkout');
      case '/order-status':
        return t('header.orderStatus');
      case '/my-orders':
        return 'My Orders';
      case '/contact':
        return t('header.contact');
      default:
        if (location.pathname.startsWith('/menu/')) {
          return t('header.menuDetails');
        }
        if (location.pathname.startsWith('/order-confirmation/')) {
          return t('header.orderConfirmed');
        }
        if (location.pathname.startsWith('/order-detail/')) {
          return 'Order Details';
        }
        return t('header.timing');
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
              aria-label={t('navigation.goBack')}
            >
              <ArrowLeft size={20} />
            </button>
          )}
          <h1 className="text-lg font-bold text-white">{getTitle()}</h1>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={toggleLanguage}
            className="btn btn-ghost btn-sm p-2 text-white hover:bg-white/10"
            aria-label={`Change language to ${i18n.language === 'th' ? 'English' : 'Thai'}`}
            title={i18n.language === 'th' ? 'Switch to English' : 'เปลี่ยนเป็นภาษาไทย'}
          >
            <Languages size={18} />
            <span className="text-xs ml-1 font-medium">
              {i18n.language === 'th' ? 'EN' : 'TH'}
            </span>
          </button>
          
        </div>
      </div>
    </header>
  );
};

export default Header;