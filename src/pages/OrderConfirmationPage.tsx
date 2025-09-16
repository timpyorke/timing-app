import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, Clock, User, Phone, MapPin } from 'lucide-react';
import { Order, Customer, OrderConfirmationLocationState, MenuSize, MilkOption } from '../types';
import { apiService } from '../services/api';
import { formatDateTime } from '../utils';
import { useTranslation } from '../i18n/stub';

const OrderConfirmationPage: React.FC = () => {
  const defaultSize: MenuSize = { id: 'medium', name: 'Medium', priceModifier: 0, enable: true };
  const defaultMilk: MilkOption = { id: 'regular', name: 'Regular Milk', price: 0, enable: true };

  const { t } = useTranslation();
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Get customer info from navigation state with proper typing
  const locationState = location.state as OrderConfirmationLocationState | undefined;
  const customerFromState: Customer | undefined = locationState?.customer;
  const orderFromState: Order | undefined = locationState?.orderData;

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) return;
      
      // If we have complete order data from navigation state, use it
      if (orderFromState && customerFromState) {
        setOrder(orderFromState);
        setLoading(false);
        return;
      }
      
      try {
        const orderData = await apiService.getOrderStatus(orderId);
        
        if (orderData) {
          const orderFromStatus: Order = {
            id: orderData.id,
            items: orderData.items.map((item, index) => ({
              id: `item-${index}`,
              menuId: '1',
              menuName: item.name || `Menu Item ${index + 1}`,
              imageUrl: `/images/${(item.name || 'placeholder-menu').toLowerCase().replace(/\s+/g, '-')}.svg`,
              size: { ...defaultSize },
              milk: { ...defaultMilk },
              sweetness: '50%',
              temperature: 'Hot',
              addOns: [],
              quantity: item.quantity,
              totalPrice: 0
            })),
            customer: customerFromState || {
              name: 'Customer', 
              phone: '-'
            } as Customer,
            subtotal: 0,
            total: 0,
            status: orderData.status,
            estimatedPickupTime: orderData.estimatedPickupTime,
            createdAt: new Date().toISOString(),
          };
          setOrder(orderFromStatus)
        } else {
          setOrder(null);
        }
      } catch (error) {
        console.error('Failed to fetch order:', error);
        setOrder(null);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, customerFromState, orderFromState]);

  const handleTrackOrder = () => {
    navigate('/order-status', { state: { orderId } });
  };

  const handleNewOrder = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-center items-center min-h-64">
          <div className="loading loading-spinner loading-lg text-primary"></div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center py-12">
          <p className="text-base-content/60">{t('orderConfirmation.notFound')}</p>
          <button
            onClick={() => navigate('/')}
            className="btn btn-primary mt-4"
          >
            {t('orderConfirmation.backToMenu')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <CheckCircle size={64} className="text-success" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-base-content">{t('orderConfirmation.confirmed')}</h1>
          <p className="text-base-content/70 mt-2">
            {t('orderConfirmation.thankYou')}
          </p>
        </div>
      </div>

      <div className="bg-base-200 rounded-lg p-4 space-y-3">
        <div className="flex justify-between items-center">
          <span className="font-semibold">{t('orderConfirmation.orderNumber')}</span>
          <span className="font-mono text-lg font-bold text-primary">#{order.id}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="font-semibold flex items-center">
            <Clock className="mr-2" size={16} />
            {t('orderConfirmation.estimatedPickup')}:
          </span>
          <span className="font-bold text-warning">
            {formatDateTime(order.estimatedPickupTime)}
          </span>
        </div>
      </div>

      <div className="bg-base-200 rounded-lg p-4">
        <h2 className="font-bold text-lg mb-3 flex items-center">
          <User className="mr-2" size={20} />
          {t('orderConfirmation.customerDetails')}
        </h2>
        <div className="space-y-2">
          <div className="flex items-center">
            <User className="mr-3 text-base-content/50" size={16} />
            <span>{order.customer.name}</span>
          </div>
          <div className="flex items-center">
            <Phone className="mr-3 text-base-content/50" size={16} />
            <span>{order.customer.phone}</span>
          </div>
          {order.customer.tableNumber && (
            <div className="flex items-center">
              <MapPin className="mr-3 text-base-content/50" size={16} />
              <span>{t('orderConfirmation.table')} {order.customer.tableNumber}</span>
            </div>
          )}
        </div>
      </div>

      <div className="bg-warning/10 border border-warning/20 rounded-lg p-4">
        <h3 className="font-bold text-warning mb-2">{t('orderConfirmation.importantInfo')}</h3>
        <ul className="text-sm space-y-1">
          <li>• {t('orderConfirmation.holdTime')}</li>
          <li>• {t('orderConfirmation.showNumber')}</li>
        </ul>
      </div>

      <div className="space-y-3">
        <button
          onClick={handleTrackOrder}
          className="btn btn-primary btn-touch w-full"
        >
          {t('orderConfirmation.trackStatus')}
        </button>
        
        <button
          onClick={handleNewOrder}
          className="btn btn-outline btn-touch w-full"
        >
          {t('orderConfirmation.placeAnother')}
        </button>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;
