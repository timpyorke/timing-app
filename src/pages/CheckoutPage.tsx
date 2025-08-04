import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Phone, MapPin } from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { useCheckoutStatus } from '../hooks/useCheckoutStatus';
import { apiService } from '../services/api';
import { Customer, OrderConfirmationLocationState } from '../types';
import { formatPrice } from '../utils';
import { useOrderHistory } from '../hooks/useOrderHistory';
import { useAnonymousUser } from '../hooks/useAnonymousUser';

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { items, customer, setCustomer, clearCart, getTotalPrice } = useCart();
  const { addOrder } = useOrderHistory();
  const { userId } = useAnonymousUser();
  const { isCheckoutDisabled, isLoading: isCheckoutLoading } = useCheckoutStatus();

  const [formData, setFormData] = useState<Customer>({
    name: customer?.name || '',
    phone: customer?.phone || '',
    tableNumber: customer?.tableNumber || '',
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<Customer>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<Customer> = {};
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (totalItems > 4 && !formData.phone.trim()) {
      newErrors.phone = 'Phone number is required for orders 5++ items';
    } else if (formData.phone.trim() && !/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
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
      alert('Checkout is currently disabled. Please try again later.');
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
      alert('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center py-12">
          <p className="text-base-content/60">Your cart is empty</p>
          <button
            onClick={() => navigate('/')}
            className="btn btn-primary mt-4"
          >
            Back to Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="bg-base-200 rounded-lg p-4">
        <h2 className="font-bold text-lg mb-3">Order Summary</h2>
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
              <span>Total:</span>
              <span className="text-primary">{formatPrice(getTotalPrice())}</span>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-base-200 rounded-lg p-4 space-y-4">
          <h2 className="font-bold text-lg flex items-center">
            <User className="mr-2" size={20} />
            Customer Information
          </h2>

          <div className="space-y-4">
            <div>
              <label className="label">
                <span className="label-text font-medium">Full Name *</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`input input-bordered input-touch w-full ${errors.name ? 'input-error' : ''
                  }`}
                placeholder="Enter your name"
                disabled={loading}
              />
              {errors.name && (
                <p className="text-error text-sm mt-1">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="label">
                <span className="label-text font-medium">Phone Number {items.reduce((sum, item) => sum + item.quantity, 0) > 4 ? '*' : '(Optional)'}</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/50" size={18} />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className={`input input-bordered input-touch w-full pl-10 ${errors.phone ? 'input-error' : ''
                    }`}
                  placeholder="089-123-4567"
                  disabled={loading}
                />
              </div>
              {errors.phone && (
                <p className="text-error text-sm mt-1">{errors.phone}</p>
              )}
            </div>

            <div>
              <label className="label">
                <span className="label-text font-medium">Table Number (Optional)</span>
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/50" size={18} />
                <input
                  type="text"
                  value={formData.tableNumber}
                  onChange={(e) => handleInputChange('tableNumber', e.target.value)}
                  className="input input-bordered input-touch w-full pl-10"
                  placeholder="Table 5, Counter, etc."
                  disabled={loading}
                />
              </div>
              <p className="text-base-content/60 text-sm mt-1">
                Leave blank for takeout orders
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {isCheckoutDisabled && (
            <div className="bg-error/10 border border-error/20 rounded-lg p-3 text-center">
              <p className="text-error font-medium">Checkout is temporarily disabled</p>
              <p className="text-error/70 text-sm mt-1">Please try again later</p>
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
                Placing Order...
              </>
            ) : isCheckoutDisabled ? (
              "Checkout"
            ) : (
              `Place Order • ${formatPrice(getTotalPrice())}`
            )}
          </button>

          <button
            type="button"
            onClick={() => navigate('/cart')}
            className="btn btn-outline btn-touch w-full"
            disabled={loading}
          >
            Back to Cart
          </button>
        </div>
      </form>
    </div>
  );
};

export default CheckoutPage;