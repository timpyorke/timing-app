import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, CheckCircle, AlertCircle, XCircle, History as HistoryIcon, Search, RefreshCw } from 'lucide-react';
import { formatDateTime, getOrderStatusColor, getOrderStatusText, formatPrice } from '../utils';
import { useOrderHistory } from '../hooks/useOrderHistory';

const OrderStatusPage: React.FC = () => {
  const navigate = useNavigate();
  const { orders, isLoading, error, refreshOrders } = useOrderHistory();
  
  console.log('Orders received in OrderStatusPage:', orders, 'Length:', orders.length);

  const handleOrderClick = (orderId: string) => {
    navigate(`/order-detail/${orderId}`);
  };

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


  return (
    <div className="container mx-auto px-4 py-6 pb-20 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <HistoryIcon className="mr-2" size={24} />
          <h1 className="font-bold text-xl">Order History</h1>
          {isLoading && (
            <span className="loading loading-spinner loading-sm ml-2"></span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={refreshOrders}
            disabled={isLoading}
            className="btn btn-sm btn-ghost"
            title="Refresh orders"
          >
            <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
          </button>
          {orders.length > 0 && (
            <button
              onClick={() => navigate('/my-orders')}
              className="btn btn-sm btn-primary"
              title="Advanced order search and filters"
            >
              <Search size={16} />
              Advanced
            </button>
          )}
          {orders.length > 0 && (
            <span className="text-sm text-base-content/60">{orders.length} orders</span>
          )}
        </div>
      </div>

      {error && (
        <div className="alert alert-warning">
          <AlertCircle size={20} />
          <div>
            <p className="font-medium">Unable to load orders from server</p>
            <p className="text-sm">Showing cached data. Check your connection and try refreshing.</p>
          </div>
        </div>
      )}

      {isLoading && orders.length === 0 ? (
        <div className="bg-base-200 rounded-lg p-8 text-center">
          <span className="loading loading-spinner loading-lg"></span>
          <p className="mt-4 text-base-content/60">Loading your orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-base-200 rounded-lg p-8 text-center">
          <HistoryIcon className="mx-auto mb-4 text-base-content/30" size={48} />
          <h3 className="font-semibold text-lg mb-2">No Orders Yet</h3>
          <p className="text-base-content/60 mb-4">
            Your order history will appear here after you place an order.
          </p>
          <button
            onClick={() => navigate('/')}
            className="btn btn-primary"
          >
            Browse Menu
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div key={order.id} className="bg-base-200 rounded-lg p-4 cursor-pointer hover:bg-base-300 transition-colors"
                 onClick={() => handleOrderClick(order.id)}>
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold">Order #{order.id}</h3>
                  <p className="text-sm text-base-content/60">
                    {formatDateTime(order.createdAt)}
                  </p>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-2 mb-1">
                    {getStatusIcon(order.status)}
                    <span className={`badge badge-sm ${getOrderStatusColor(order.status)}`}>
                      {getOrderStatusText(order.status)}
                    </span>
                  </div>
                  <p className="font-bold text-primary">{formatPrice(order.total)}</p>
                </div>
              </div>
              
              <div className="mb-3">
                <h4 className="font-medium text-sm mb-2">Order Items:</h4>
                <div className="space-y-1">
                  {order.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="text-sm text-base-content/70 flex justify-between">
                      <div>
                        <span className="font-medium">{item.menuName}</span>
                        <span className="text-xs text-base-content/50 ml-1">
                          ({item.size.name})
                          {item.temperature && ` • ${item.temperature}`}
                          {item.milk && ` • ${item.milk}`}
                          {item.sweetness && ` • ${item.sweetness}`}
                          {item.addOns && item.addOns.length > 0 && 
                            ` • +${item.addOns.map(addon => addon.name).join(', ')}`
                          }
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs">×{item.quantity}</span>
                        <div className="font-medium">{formatPrice(item.totalPrice)}</div>
                      </div>
                    </div>
                  ))}
                </div>
                {order.customer.tableNumber && (
                  <div className="text-xs text-base-content/60 mt-2">
                    Table {order.customer.tableNumber}
                  </div>
                )}
              </div>
              
              <div className="text-xs text-base-content/50 text-center">
                Click to view details
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderStatusPage;