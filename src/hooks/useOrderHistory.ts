import { useState, useEffect } from 'react';
import { Order } from '../types';
import { apiService } from '../services/api';
import { getAnonymousUserId } from '../utils';

export const useOrderHistory = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrdersFromAPI = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const customerId = getAnonymousUserId();
      console.log('Fetching orders for customer ID:', customerId);
      
      const apiOrders = await apiService.getOrdersByCustomerId(customerId);
      
      console.log('Loaded orders from API:', apiOrders);
      setOrders(apiOrders);
      
      // Cache the API orders in localStorage if any found
      if (apiOrders.length > 0) {
        localStorage.setItem('drinkOrderHistory', JSON.stringify(apiOrders));
      } else {
        // Try to load from localStorage if no API orders
        const savedOrders = localStorage.getItem('drinkOrderHistory');
        if (savedOrders) {
          const parsedOrders = JSON.parse(savedOrders);
          console.log('Loaded orders from localStorage:', parsedOrders);
          setOrders(parsedOrders);
        } else {
          console.log('No orders found');
          setOrders([]);
        }
      }
    } catch (error) {
      console.error('Failed to fetch orders from API:', error);
      setError('Failed to load orders');
      
      // Fallback to localStorage only
      const savedOrders = localStorage.getItem('drinkOrderHistory');
      if (savedOrders) {
        try {
          const parsedOrders = JSON.parse(savedOrders);
          console.log('Loaded cached orders after API failure:', parsedOrders);
          setOrders(parsedOrders);
        } catch (parseError) {
          console.error('Failed to parse cached orders:', parseError);
          setOrders([]);
        }
      } else {
        console.log('No cached orders available');
        setOrders([]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrdersFromAPI();
  }, []);

  useEffect(() => {
    localStorage.setItem('drinkOrderHistory', JSON.stringify(orders));
  }, [orders]);

  const addOrder = (order: Order) => {
    setOrders(prev => [order, ...prev.slice(0, 9)]); // Keep last 10 orders
  };

  const getRecentOrders = (limit: number = 5) => {
    return orders.slice(0, limit);
  };

  const clearHistory = () => {
    setOrders([]);
    localStorage.removeItem('drinkOrderHistory');
  };

  const updateOrderStatus = (orderId: string, status: string, estimatedPickupTime?: string) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId 
        ? { 
            ...order, 
            status: status as any,
            estimatedPickupTime: estimatedPickupTime || order.estimatedPickupTime
          }
        : order
    ));
  };

  const refreshOrders = () => {
    fetchOrdersFromAPI();
  };

  return {
    orders,
    isLoading,
    error,
    addOrder,
    getRecentOrders,
    clearHistory,
    updateOrderStatus,
    refreshOrders,
  };
};