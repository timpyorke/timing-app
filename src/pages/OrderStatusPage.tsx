import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, CheckCircle } from 'lucide-react';
import { formatDateTime, formatPrice } from '../utils';
import { useOrderHistory } from '../hooks/useOrderHistory';

const OrderStatusPage: React.FC = () => {
  const navigate = useNavigate();
  const { orders, isLoading } = useOrderHistory();


  return (
    <div className="container mx-auto px-4 py-6 pb-20">
      <h1 className="text-xl font-bold mb-6">My Orders</h1>

      {isLoading ? (
        <div className="text-center py-8">
          <span className="loading loading-spinner loading-lg"></span>
          <p className="mt-4 text-base-content/60">Loading orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-12">
          <Clock className="mx-auto mb-4 text-base-content/30" size={48} />
          <h3 className="font-semibold mb-2">No Orders Yet</h3>
          <p className="text-base-content/60 mb-4">Start ordering to see your order history</p>
          <button
            onClick={() => navigate('/')}
            className="btn btn-primary"
          >
            Browse Menu
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-base-200 rounded-lg p-4">
              <div className="flex justify-between items-center mb-3">
                <div>
                  <h3 className="font-semibold">#{order.id.slice(-6)}</h3>
                  <p className="text-sm text-base-content/60">
                    {formatDateTime(order.createdAt)}
                  </p>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-2 mb-1">
                    {order.status === 'completed' ? (
                      <CheckCircle className="text-success" size={20} />
                    ) : (
                      <Clock className="text-warning" size={20} />
                    )}
                    <span className="text-sm capitalize">{order.status}</span>
                  </div>
                  <p className="font-bold text-primary">{formatPrice(order.total)}</p>
                </div>
              </div>
              
              <div className="text-sm text-base-content/70">
                {order.items.length} item{order.items.length > 1 ? 's' : ''}
                {order.customer.tableNumber && ` • Table ${order.customer.tableNumber}`}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderStatusPage;