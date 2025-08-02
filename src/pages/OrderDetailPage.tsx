import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, CheckCircle, AlertCircle, XCircle, User, Phone, MapPin, RefreshCw } from 'lucide-react';
import { formatDateTime, getOrderStatusColor, getOrderStatusText, formatPrice } from '../utils';
import { useOrderHistory } from '../hooks/useOrderHistory';
import { apiService } from '../services/api';
import { OrderStatusResponse } from '../types';

const OrderDetailPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { orders, updateOrderStatus } = useOrderHistory();
  const [liveStatus, setLiveStatus] = useState<OrderStatusResponse | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const order = orders.find(o => o.id === orderId);

  // Fetch live order status
  const fetchLiveStatus = async () => {
    if (!orderId) return;
    
    setIsRefreshing(true);
    try {
      const status = await apiService.getOrderStatus(orderId);
      
      if (status) {
        setLiveStatus(status);
        // Update local order status if different
        if (order && status.status !== order.status) {
          updateOrderStatus(orderId, status.status, status.estimatedPickupTime);
        }
      } else {
        console.log('No live status available for order:', orderId);
        setLiveStatus(null);
      }
    } catch (error) {
      console.error('Failed to fetch live order status:', error);
      setLiveStatus(null);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLiveStatus();
    // Set up polling for live updates every 30 seconds
    const interval = setInterval(fetchLiveStatus, 30000);
    return () => clearInterval(interval);
  }, [orderId]);

  // Use live status if available, otherwise fall back to local order
  const currentStatus = liveStatus?.status || order?.status;
  const currentEstimatedTime = liveStatus?.estimatedPickupTime || order?.estimatedPickupTime;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
      case 'confirmed':
        return <Clock className="text-warning" size={24} />;
      case 'preparing':
        return <AlertCircle className="text-info" size={24} />;
      case 'ready':
      case 'completed':
        return <CheckCircle className="text-success" size={24} />;
      case 'cancelled':
        return <XCircle className="text-error" size={24} />;
      default:
        return <Clock className="text-base-content/50" size={24} />;
    }
  };

  const getStatusProgress = (status: string): number => {
    switch (status) {
      case 'pending':
        return 25;
      case 'confirmed':
        return 50;
      case 'preparing':
        return 75;
      case 'ready':
      case 'completed':
        return 100;
      default:
        return 0;
    }
  };

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-6 pb-20">
        <div className="text-center py-12">
          <h2 className="font-bold text-lg mb-2">Order Not Found</h2>
          <p className="text-base-content/60 mb-4">The order you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/order-status')}
            className="btn btn-primary"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 pb-20 space-y-6">
      {/* Header with back button and refresh */}
      <div className="flex justify-between items-center">
        <h1 className="font-bold text-xl">Order #{order.id}</h1>
        <button 
          onClick={fetchLiveStatus}
          disabled={isRefreshing}
          className={`btn btn-sm btn-ghost ${isRefreshing ? 'loading' : ''}`}
          title="Refresh order status"
        >
          {!isRefreshing && <RefreshCw size={16} />}
          {isRefreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Order Status Card */}
      <div className="bg-base-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              {getStatusIcon(currentStatus || 'pending')}
              <span className={`badge ${getOrderStatusColor(currentStatus || 'pending')}`}>
                {getOrderStatusText(currentStatus || 'pending')}
              </span>
              {liveStatus && (
                <span className="badge badge-sm badge-success">Live</span>
              )}
            </div>
            <p className="text-sm text-base-content/60">
              Ordered on {formatDateTime(order.createdAt)}
            </p>
          </div>
          <div className="text-right">
            <p className="font-bold text-xl text-primary">{formatPrice(order.total)}</p>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span>Progress</span>
            <span>{getStatusProgress(currentStatus || 'pending')}%</span>
          </div>
          <progress 
            className="progress progress-primary w-full" 
            value={getStatusProgress(currentStatus || 'pending')} 
            max="100"
          ></progress>
        </div>

        {currentStatus !== 'completed' && currentStatus !== 'cancelled' && currentEstimatedTime && (
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-3">
            <div className="flex items-center text-primary">
              <Clock className="mr-2" size={16} />
              <span className="font-medium">
                Estimated pickup: {formatDateTime(currentEstimatedTime)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Customer Information */}
      <div className="bg-base-200 rounded-lg p-4">
        <h2 className="font-bold text-lg mb-3 flex items-center">
          <User className="mr-2" size={20} />
          Customer Information
        </h2>
        <div className="space-y-2">
          <div className="flex items-center">
            <User className="mr-3 text-base-content/50" size={16} />
            <span>{order.customer.name}</span>
          </div>
          {order.customer.phone && (
            <div className="flex items-center">
              <Phone className="mr-3 text-base-content/50" size={16} />
              <span>{order.customer.phone}</span>
            </div>
          )}
          {order.customer.tableNumber && (
            <div className="flex items-center">
              <MapPin className="mr-3 text-base-content/50" size={16} />
              <span>Table {order.customer.tableNumber}</span>
            </div>
          )}
        </div>
      </div>

      {/* Order Items */}
      <div className="bg-base-200 rounded-lg p-4">
        <h2 className="font-bold text-lg mb-3">Order Items</h2>
        <div className="space-y-3">
          {order.items.map((item, index) => (
            <div key={index} className="flex items-start space-x-4 border-b border-base-300 pb-3 last:border-b-0 last:pb-0">
              <img 
                src={item.imageUrl}
                alt={item.menuName}
                className="w-16 h-16 rounded-lg object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/images/placeholder-menu.svg';
                }}
              />
              <div className="flex-1">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h3 className="font-medium">{item.menuName}</h3>
                    <p className="text-sm text-base-content/60">Size: {item.size.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatPrice(item.totalPrice)}</p>
                    <p className="text-sm text-base-content/60">×{item.quantity}</p>
                  </div>
                </div>
                <div className="text-sm text-base-content/70 space-y-1">
                  {item.temperature && (
                    <div className="flex justify-between">
                      <span>Temperature:</span>
                      <span>{item.temperature}</span>
                    </div>
                  )}
                  {item.milk && (
                    <div className="flex justify-between">
                      <span>Milk:</span>
                      <span>{item.milk.name}</span>
                    </div>
                  )}
                  {item.sweetness && (
                    <div className="flex justify-between">
                      <span>Sweetness:</span>
                      <span>{item.sweetness}</span>
                    </div>
                  )}
                  {item.addOns && item.addOns.length > 0 && (
                    <div className="flex justify-between">
                      <span>Add-ons:</span>
                      <span>{item.addOns.map(addon => addon.name).join(', ')}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="border-t border-base-300 pt-3 mt-3">
          <div className="flex justify-between items-center font-bold text-lg">
            <span>Total:</span>
            <span className="text-primary">{formatPrice(order.total)}</span>
          </div>
        </div>
      </div>

      {/* Status-specific alerts */}
      <div className="grid grid-cols-1 gap-4">
        {currentStatus === 'ready' && (
          <div className="alert alert-success">
            <CheckCircle size={20} />
            <div>
              <p className="font-medium">Your order is ready!</p>
              <p className="text-sm">Please come to the counter to pick up and pay.</p>
            </div>
          </div>
        )}
        
        {currentStatus === 'preparing' && (
          <div className="alert alert-info">
            <AlertCircle size={20} />
            <div>
              <p className="font-medium">Your order is being prepared</p>
              <p className="text-sm">We'll notify you when it's ready for pickup.</p>
            </div>
          </div>
        )}

        {currentStatus === 'completed' && (
          <div className="alert alert-success">
            <CheckCircle size={20} />
            <div>
              <p className="font-medium">Order completed!</p>
              <p className="text-sm">Thank you for your order. Enjoy your menu!</p>
            </div>
          </div>
        )}

        {currentStatus === 'cancelled' && (
          <div className="alert alert-error">
            <XCircle size={20} />
            <div>
              <p className="font-medium">Order cancelled</p>
              <p className="text-sm">This order has been cancelled. Please contact us if you have any questions.</p>
            </div>
          </div>
        )}

        {liveStatus && (
          <div className="alert alert-info">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
              <div>
                <p className="font-medium">Live Status Updates</p>
                <p className="text-sm">Status updates automatically every 30 seconds</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="space-y-3">
        <button
          onClick={() => navigate('/')}
          className="btn btn-primary btn-touch w-full"
        >
          Place New Order
        </button>
        
        <button
          onClick={() => navigate('/order-status')}
          className="btn btn-outline btn-touch w-full"
        >
          Back to Order History
        </button>
      </div>
    </div>
  );
};

export default OrderDetailPage;