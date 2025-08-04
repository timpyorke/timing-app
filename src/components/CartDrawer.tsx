import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Plus, Minus, Trash2 } from 'lucide-react';
import { useTranslation } from '../i18n/stub';
import { useCart } from '../hooks/useCart';
import { formatPrice } from '../utils';

const CartDrawer: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { 
    isOpen, 
    items, 
    toggleCart, 
    updateQuantity, 
    removeItem, 
    getTotalPrice 
  } = useCart();

  const handleCheckout = () => {
    toggleCart();
    navigate('/checkout');
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50" onClick={toggleCart} />
      <div className="fixed bottom-0 left-0 right-0 bg-base-100 rounded-t-2xl shadow-2xl z-50 max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-base-300">
          <h2 className="text-lg font-bold">{t('cart.yourCart')} ({items.length})</h2>
          <button
            onClick={toggleCart}
            className="btn btn-ghost btn-sm p-2"
            aria-label="Close cart"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.length === 0 ? (
            <div className="text-center py-8 text-base-content/60">
              <p>{t('cart.emptyCart')}</p>
              <p className="text-sm mt-1">{t('cart.emptyCartSubtext')}</p>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex items-center space-x-3 bg-base-200 rounded-lg p-3">
                <img
                  src={item.imageUrl}
                  alt={item.menuName}
                  className="w-12 h-12 rounded-lg object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/images/placeholder-menu.svg';
                  }}
                />
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm truncate">{item.menuName}</h3>
                  <p className="text-xs text-base-content/60">
                    {item.size.name} • {item.milk.name} • {item.sweetness} • {item.temperature}
                  </p>
                  {item.addOns.length > 0 && (
                    <p className="text-xs text-base-content/60">
                      + {item.addOns.map(addon => addon.name).join(', ')}
                    </p>
                  )}
                  <p className="text-sm font-bold text-primary">{formatPrice(item.totalPrice)}</p>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="btn btn-ghost btn-xs p-1"
                    aria-label="Decrease quantity"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="btn btn-ghost btn-xs p-1"
                    aria-label="Increase quantity"
                  >
                    <Plus size={14} />
                  </button>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="btn btn-ghost btn-xs p-1 text-error hover:bg-error/10"
                    aria-label="Remove item"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="p-4 border-t border-base-300">
            <div className="flex items-center justify-between mb-3">
              <span className="font-bold">{t('common.total')}:</span>
              <span className="text-lg font-bold text-primary">{formatPrice(getTotalPrice())}</span>
            </div>
            <button
              onClick={handleCheckout}
              className="btn btn-primary btn-touch w-full"
            >
              {t('cart.checkout')}
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default CartDrawer;