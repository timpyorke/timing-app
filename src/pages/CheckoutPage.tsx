import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Phone, MapPin } from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { useCheckoutStatus } from '../hooks/useCheckoutStatus';
import { apiService } from '../services/api';
import { Customer, OrderConfirmationLocationState } from '../types';
import { CONSTANTS, formatPrice } from '../utils';
import { useOrderHistory } from '../hooks/useOrderHistory';
import { useAnonymousUser } from '../hooks/useAnonymousUser';
import { useTranslation } from '../i18n/stub';

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { items, customer, setCustomer, clearCart, getTotalPrice } = useCart();
  const { addOrder } = useOrderHistory();
  const { userId } = useAnonymousUser();
  const { isCheckoutDisabled, isLoading: isCheckoutLoading } = useCheckoutStatus();
  const { t } = useTranslation();

  const [formData, setFormData] = useState<Customer>(() => {
    let storedTable = '';
    try {
      storedTable = localStorage.getItem(CONSTANTS.STORAGE_KEYS.TABLE_NUMBER) || '';
    } catch (e) {
      storedTable = '';
    }
    return {
      name: customer?.name || '',
      phone: customer?.phone || '',
      tableNumber: customer?.tableNumber || storedTable,
    };
  });

  // Sync table number from cart if it changes (e.g., set by URL capture in Layout)
  useEffect(() => {
    if (customer?.tableNumber) {
      setFormData(prev => ({ ...prev, tableNumber: customer.tableNumber! }));
    }
  }, [customer?.tableNumber]);

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<Customer>>({});
  const [qrLoading, setQrLoading] = useState(true);
  const [qrError, setQrError] = useState<string | null>(null);

  const totalAmount = useMemo(() => getTotalPrice(), [items]);
  const qrPaymentUrl = useMemo(() => {
    // API provided by user (note: 'amont' as given in request)
    const amountParam = encodeURIComponent(totalAmount.toFixed(2));
    return `https://rub-tung.vercel.app/api/0990995156?amont=${amountParam}`;
  }, [totalAmount]);

  const validateForm = (): boolean => {
    const newErrors: Partial<Customer> = {};
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

    if (!formData.name.trim()) {
      newErrors.name = t('checkout.nameRequired');
    }

    if (totalItems > 4 && !formData.phone.trim()) {
      newErrors.phone = t('checkout.phoneRequiredLargeOrder');
    } else if (formData.phone.trim() && !/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = t('checkout.phoneInvalid');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof Customer, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;
    if (items.length === 0) return;
    if (isCheckoutDisabled) {
      alert(t('checkout.disabledAlert'));
      return;
    }

    setLoading(true);

    try {
      setCustomer(formData);
      const order = await apiService.createOrder(items, formData, userId);

      // Add order to history
      const orderWithItems = {
        ...order,
        items: items,
        customer: formData,
        subtotal: getTotalPrice(),
        total: getTotalPrice(),
        createdAt: new Date().toISOString(),
      };
      addOrder(orderWithItems);

      clearCart();
      navigate(`/order-confirmation/${order.id}`, {
        state: {
          customer: formData,
          orderData: orderWithItems
        } as OrderConfirmationLocationState
      });
    } catch (error) {
      console.error('Failed to create order:', error);
      alert(t('checkout.orderFailedAlert'));
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center py-12">
          <p className="text-base-content/60">{t('checkout.emptyCart')}</p>
          <button
            onClick={() => navigate('/')}
            className="btn btn-primary mt-4"
          >
            {t('checkout.backToMenu')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="bg-base-200 rounded-lg p-4">
        <h2 className="font-bold text-lg mb-3">{t('checkout.orderSummary')}</h2>
        <div className="space-y-2">
          {items.map((item) => (
            <div key={item.id} className="flex justify-between items-center text-sm">
              <div>
                <span className="font-medium">{item.menuName}</span>
                <span className="text-base-content/60 ml-2">
                  ({item.size.name}) × {item.quantity}
                </span>
              </div>
              <span className="font-medium">{formatPrice(item.totalPrice)}</span>
            </div>
          ))}
          <div className="border-t border-base-300 pt-2 mt-3">
            <div className="flex justify-between items-center font-bold text-lg">
              <span>{t('checkout.total')}</span>
              <span className="text-primary">{formatPrice(getTotalPrice())}</span>
            </div>
          </div>
        </div>
      </div>

      {/* QR Payment Section */}
      <div className="bg-base-200 rounded-lg p-4">
        <h2 className="font-bold text-lg mb-3">QR Payment</h2>
        <p className="text-sm text-base-content/70 mb-3">Scan to pay the exact total amount.</p>
        <div className="flex flex-col items-center justify-center">
          <div className="w-64 h-64 bg-base-100 rounded-lg flex items-center justify-center overflow-hidden border border-base-300 relative">
            {qrLoading && !qrError && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="loading loading-spinner"></span>
              </div>
            )}
            {qrError && (
              <div className="p-4 text-center text-error text-sm">Failed to load QR. Please try again.</div>
            )}
            {!qrError && (
              <img
                src={qrPaymentUrl}
                alt="QR Payment"
                className={`w-full h-full object-contain ${qrLoading ? 'opacity-0' : 'opacity-100'}`}
                onLoad={() => setQrLoading(false)}
                onError={() => {
                  setQrLoading(false);
                  setQrError('Failed to load');
                }}
              />
            )}
          </div>
          <div className="mt-3 text-sm text-base-content/70">
            Amount: <span className="font-medium text-base-content">{formatPrice(totalAmount)}</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-base-200 rounded-lg p-4 space-y-4">
          <h2 className="font-bold text-lg flex items-center">
            <User className="mr-2" size={20} />
            {t('checkout.customerInfo')}
          </h2>

          <div className="space-y-4">
            <div>
              <label className="label">
                <span className="label-text font-medium">{t('checkout.fullName')}</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`input input-bordered input-touch w-full ${errors.name ? 'input-error' : ''
                  }`}
                placeholder={t('checkout.enterName')}
                disabled={loading}
              />
              {errors.name && (
                <p className="text-error text-sm mt-1">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="label">
                <span className="label-text font-medium">{t('checkout.phoneNumber')} {items.reduce((sum, item) => sum + item.quantity, 0) > 4 ? '*' : t('checkout.optional')}</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/50" size={18} />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className={`input input-bordered input-touch w-full pl-10 ${errors.phone ? 'input-error' : ''
                    }`}
                  placeholder={t('checkout.phonePlaceholder')}
                  disabled={loading}
                />
              </div>
              {errors.phone && (
                <p className="text-error text-sm mt-1">{errors.phone}</p>
              )}
            </div>

            <div>
              <label className="label">
                <span className="label-text font-medium">{t('checkout.tableNumber')}</span>
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/50" size={18} />
                <input
                  type="text"
                  value={formData.tableNumber}
                  onChange={(e) => handleInputChange('tableNumber', e.target.value)}
                  className="input input-bordered input-touch w-full pl-10"
                  placeholder={t('checkout.tablePlaceholder')}
                  disabled={loading}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {isCheckoutDisabled && (
            <div className="bg-error/10 border border-error/20 rounded-lg p-3 text-center">
              <p className="text-error font-medium">{t('checkout.temporarilyDisabled')}</p>
              <p className="text-error/70 text-sm mt-1">{t('checkout.tryAgainLater')}</p>
            </div>
          )}
          <button
            type="submit"
            disabled={loading || items.length === 0 || isCheckoutDisabled || isCheckoutLoading}
            className="btn btn-primary btn-touch w-full"
          >
            {loading ? (
              <>
                <span className="loading loading-spinner loading-sm mr-2"></span>
                {t('checkout.placingOrder')}
              </>
            ) : isCheckoutDisabled ? (
              t('checkout.checkout')
            ) : (
              `${t('checkout.placeOrder')} • ${formatPrice(getTotalPrice())}`
            )}
          </button>

          <button
            type="button"
            onClick={() => navigate('/')}
            className="btn btn-outline btn-touch w-full"
            disabled={loading}
          >
            {t('checkout.backToMenu')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CheckoutPage;
