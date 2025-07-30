import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, Clock, User, Phone, MapPin } from 'lucide-react';
import { Order } from '../types';
import { apiService } from '../services/api';
import { formatDateTime } from '../utils';

const OrderConfirmationPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) return;
      
      try {
        const orderData = await apiService.getOrderStatus(orderId);
        const mockOrder: Order = {
          id: orderData.id,
          items: [],
          customer: { name: 'Customer', phone: '555-0123' },
          subtotal: 0,
          total: 0,
          status: orderData.status,
          estimatedPickupTime: orderData.estimatedPickupTime,
          createdAt: new Date().toISOString(),
        };
        setOrder(mockOrder);
      } catch (error) {
        console.error('Failed to fetch order:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

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
          <p className="text-base-content/60">Order not found</p>
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
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <CheckCircle size={64} className="text-success" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-base-content">Order Confirmed!</h1>
          <p className="text-base-content/70 mt-2">
            Thank you for choosing TIMING! We're preparing your drinks now.
          </p>
        </div>
      </div>

      <div className="bg-base-200 rounded-lg p-4 space-y-3">
        <div className="flex justify-between items-center">
          <span className="font-semibold">Order Number:</span>
          <span className="font-mono text-lg font-bold text-primary">#{order.id}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="font-semibold flex items-center">
            <Clock className="mr-2" size={16} />
            Estimated Pickup:
          </span>
          <span className="font-bold text-warning">
            {formatDateTime(order.estimatedPickupTime)}
          </span>
        </div>
      </div>

      <div className="bg-base-200 rounded-lg p-4">
        <h2 className="font-bold text-lg mb-3 flex items-center">
          <User className="mr-2" size={20} />
          Customer Details
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
              <span>Table {order.customer.tableNumber}</span>
            </div>
          )}
        </div>
      </div>

      <div className="bg-warning/10 border border-warning/20 rounded-lg p-4">
        <h3 className="font-bold text-warning mb-2">Important Information</h3>
        <ul className="text-sm space-y-1">
          <li>• Please pay at the counter when you pick up your order</li>
          <li>• You'll receive an SMS when your order is ready</li>
          <li>• Orders are held for 15 minutes after ready time</li>
          <li>• Show your order number to the staff</li>
        </ul>
      </div>

      <div className="space-y-3">
        <button
          onClick={handleTrackOrder}
          className="btn btn-primary btn-touch w-full"
        >
          Track Order Status
        </button>
        
        <button
          onClick={handleNewOrder}
          className="btn btn-outline btn-touch w-full"
        >
          Place Another Order
        </button>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;