import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, CheckCircle } from 'lucide-react';
import { formatDateTime, formatPrice } from '../utils';
import { useOrderHistory } from '../hooks/useOrderHistory';
import { useTranslation } from '../i18n/stub';

const OrderStatusPage: React.FC = () => {
  const navigate = useNavigate();
  const { orders, isLoading } = useOrderHistory();
  const { t } = useTranslation();


  return (
    <div className="container mx-auto px-4 py-6 pb-20">
      <h1 className="text-xl font-bold mb-6">{t('orderStatus.myOrders')}</h1>

      {isLoading ? (
        <div className="text-center py-8">
          <span className="loading loading-spinner loading-lg"></span>
          <p className="mt-4 text-base-content/60">{t('orderStatus.loading')}</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-12">
          <Clock className="mx-auto mb-4 text-base-content/30" size={48} />
          <h3 className="font-semibold mb-2">{t('orderStatus.noOrdersYet')}</h3>
          <p className="text-base-content/60 mb-4">{t('orderStatus.startOrdering')}</p>
          <button
            onClick={() => navigate('/')}
            className="btn btn-primary"
          >
            {t('orderStatus.browseMenu')}
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
              
              {/* Order Items Details */}
              <div className="space-y-3 mt-4">
                <h4 className="font-medium text-sm text-base-content/80">{t('orderStatus.orderItems')}</h4>
                {order.items.map((item, itemIndex) => (
                  <div key={itemIndex} className="flex items-start space-x-3 bg-base-100 rounded-lg p-3">
                    <img
                      src={item.imageUrl || `/images/${item.menuName.toLowerCase().replace(/\s+/g, '-')}.svg`}
                      alt={item.menuName}
                      className="w-12 h-12 rounded-lg object-cover object-center flex-shrink-0"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/images/placeholder-menu.svg';
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{item.menuName}</p>
                          <div className="text-xs text-base-content/60 space-y-1">
                            <p>{t('orderStatus.size')} {item.size.name}</p>
                            {item.milk && <p>{t('orderStatus.milk')} {item.milk.name}</p>}
                            {item.sweetness && <p>{t('orderStatus.sweetness')} {item.sweetness}</p>}
                            {item.temperature && <p>{t('orderStatus.temperature')} {item.temperature}</p>}
                            {item.addOns && item.addOns.length > 0 && (
                              <p>{t('orderStatus.addOns')} {item.addOns.map(addon => addon.name).join(', ')}</p>
                            )}
                          </div>
                        </div>
                        <div className="text-right ml-3">
                          <p className="font-medium text-sm">{formatPrice(item.totalPrice)}</p>
                          <p className="text-xs text-base-content/60">×{item.quantity}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {order.customer.tableNumber && (
                  <div className="text-xs text-base-content/60 pt-2 border-t">
                    {t('orderStatus.table')} {order.customer.tableNumber}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderStatusPage;