import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, CheckCircle, AlertCircle, XCircle, History as HistoryIcon, RefreshCw, Search } from 'lucide-react';
import { formatDateTime, getOrderStatusColor, getOrderStatusText, formatPrice } from '../utils';
import { useOrderHistory } from '../hooks/useOrderHistory';
import { apiService } from '../services/api';
import { OrderStatus } from '../types';

const CustomerOrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const { orders, isLoading, error, updateOrderStatus, refreshOrders } = useOrderHistory();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'status' | 'total'>('date');

  // Refresh all order statuses
  const refreshAllOrders = async () => {
    setIsRefreshing(true);
    try {
      // First, refresh the order list from API
      await refreshOrders();
      
      // Then update individual order statuses
      const statusPromises = orders.map(async (order) => {
        try {
          const status = await apiService.getOrderStatus(order.id);
          if (status && status.status !== order.status) {
            updateOrderStatus(order.id, status.status, status.estimatedPickupTime);
          }
          return { orderId: order.id, success: !!status };
        } catch (error) {
          console.error(`Failed to refresh order ${order.id}:`, error);
          return { orderId: order.id, success: false };
        }
      });

      await Promise.all(statusPromises);
    } catch (error) {
      console.error('Failed to refresh orders:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    // Auto-refresh every 60 seconds
    const interval = setInterval(refreshAllOrders, 60000);
    return () => clearInterval(interval);
  }, [orders]);

  const handleOrderClick = (orderId: string) => {
    navigate(`/order-detail/${orderId}`);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
      case 'confirmed':
        return <Clock className="text-warning" size={20} />;
      case 'preparing':
        return <AlertCircle className="text-info" size={20} />;
      case 'ready':
      case 'completed':
        return <CheckCircle className="text-success" size={20} />;
      case 'cancelled':
        return <XCircle className="text-error" size={20} />;
      default:
        return <Clock className="text-base-content/50" size={20} />;
    }
  };

  const getStatusPriority = (status: OrderStatus): number => {
    const priority = {
      'ready': 1,
      'preparing': 2,
      'confirmed': 3,
      'pending': 4,
      'completed': 5,
      'cancelled': 6
    };
    return priority[status] || 7;
  };

  // Filter and sort orders
  const filteredOrders = orders
    .filter(order => {
      const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           order.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           order.items.some(item => item.drinkName.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'status':
          return getStatusPriority(a.status) - getStatusPriority(b.status);
        case 'total':
          return b.total - a.total;
        case 'date':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

  const statusCounts = orders.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, {} as Record<OrderStatus, number>);

  return (
    <div className="container mx-auto px-4 py-6 pb-20 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <HistoryIcon className="mr-2" size={24} />
          <h1 className="font-bold text-xl">My Orders</h1>
          {(isLoading || isRefreshing) && (
            <span className="loading loading-spinner loading-sm ml-2"></span>
          )}
        </div>
        <button
          onClick={refreshAllOrders}
          disabled={isRefreshing}
          className={`btn btn-sm btn-ghost ${isRefreshing ? 'loading' : ''}`}
          title="Refresh all orders"
        >
          {!isRefreshing && <RefreshCw size={16} />}
          {isRefreshing ? 'Refreshing...' : 'Refresh All'}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-base-200 rounded-lg p-4 text-center">
          <div className="font-bold text-2xl text-warning">{statusCounts.preparing || 0}</div>
          <div className="text-sm text-base-content/60">Preparing</div>
        </div>
        <div className="bg-base-200 rounded-lg p-4 text-center">
          <div className="font-bold text-2xl text-success">{statusCounts.ready || 0}</div>
          <div className="text-sm text-base-content/60">Ready</div>
        </div>
        <div className="bg-base-200 rounded-lg p-4 text-center">
          <div className="font-bold text-2xl text-info">{statusCounts.completed || 0}</div>
          <div className="text-sm text-base-content/60">Completed</div>
        </div>
        <div className="bg-base-200 rounded-lg p-4 text-center">
          <div className="font-bold text-2xl text-primary">{orders.length}</div>
          <div className="text-sm text-base-content/60">Total Orders</div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-base-200 rounded-lg p-4 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/50" size={16} />
            <input
              type="text"
              placeholder="Search orders, customer name, or drinks..."
              className="input input-bordered w-full pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="select select-bordered"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as OrderStatus | 'all')}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="preparing">Preparing</option>
            <option value="ready">Ready</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select
            className="select select-bordered"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'date' | 'status' | 'total')}
          >
            <option value="date">Sort by Date</option>
            <option value="status">Sort by Status</option>
            <option value="total">Sort by Total</option>
          </select>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="alert alert-warning">
          <AlertCircle size={20} />
          <div>
            <p className="font-medium">Unable to load orders from server</p>
            <p className="text-sm">Showing cached data. Check your connection and try refreshing.</p>
          </div>
        </div>
      )}

      {/* Orders List */}
      {isLoading && orders.length === 0 ? (
        <div className="bg-base-200 rounded-lg p-8 text-center">
          <span className="loading loading-spinner loading-lg"></span>
          <p className="mt-4 text-base-content/60">Loading your orders...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-base-200 rounded-lg p-8 text-center">
          <HistoryIcon className="mx-auto mb-4 text-base-content/30" size={48} />
          <h3 className="font-semibold text-lg mb-2">
            {orders.length === 0 ? 'No Orders Yet' : 'No Orders Match Your Search'}
          </h3>
          <p className="text-base-content/60 mb-4">
            {orders.length === 0 
              ? 'Your order history will appear here after you place an order.'
              : 'Try adjusting your search or filter criteria.'
            }
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
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="bg-base-200 rounded-lg p-4 cursor-pointer hover:bg-base-300 transition-colors border-l-4"
              style={{ borderLeftColor: getOrderStatusColor(order.status).includes('success') ? '#22c55e' : 
                                       getOrderStatusColor(order.status).includes('warning') ? '#f59e0b' :
                                       getOrderStatusColor(order.status).includes('info') ? '#3b82f6' :
                                       getOrderStatusColor(order.status).includes('error') ? '#ef4444' : '#6b7280' }}
              onClick={() => handleOrderClick(order.id)}
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold">Order #{order.id}</h3>
                  <p className="text-sm text-base-content/60">
                    {formatDateTime(order.createdAt)} • {order.customer.name}
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
                <div className="flex flex-wrap gap-2">
                  {order.items.slice(0, 3).map((item, itemIndex) => (
                    <span key={itemIndex} className="badge badge-outline badge-sm">
                      {item.quantity}× {item.drinkName}
                    </span>
                  ))}
                  {order.items.length > 3 && (
                    <span className="badge badge-outline badge-sm">
                      +{order.items.length - 3} more
                    </span>
                  )}
                </div>
              </div>

              {order.status !== 'completed' && order.status !== 'cancelled' && order.estimatedPickupTime && (
                <div className="text-xs text-info flex items-center">
                  <Clock className="mr-1" size={12} />
                  Est. pickup: {formatDateTime(order.estimatedPickupTime)}
                </div>
              )}

              <div className="text-xs text-base-content/50 text-center mt-2">
                Click to view details
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomerOrdersPage;