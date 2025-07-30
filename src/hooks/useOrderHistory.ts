import { useState, useEffect } from 'react';
import { Order } from '../types';

const getMockOrders = (): Order[] => [
  {
    id: 'ORDER-1735537200000',
    items: [
      {
        id: 'cart-1',
        drinkId: '1',
        drinkName: 'Matcha Latte',
        drinkImage: '/images/matcha-latte.svg',
        size: { id: 'medium', name: 'Medium (16oz)', priceModifier: 1.5 },
        milk: 'Oat Milk',
        sweetness: '50%',
        temperature: 'Iced',
        addOns: [{ id: 'whipped-cream', name: 'Whipped Cream', price: 0.5 }],
        quantity: 2,
        totalPrice: 14.5,
      },
      {
        id: 'cart-2',
        drinkId: '2',
        drinkName: 'Hojicha Latte',
        drinkImage: '/images/hojicha-latte.svg',
        size: { id: 'large', name: 'Large (20oz)', priceModifier: 2.5 },
        milk: 'Whole Milk',
        sweetness: '25%',
        temperature: 'Hot',
        addOns: [],
        quantity: 1,
        totalPrice: 7.75,
      },
    ],
    customer: {
      name: 'John Doe',
      phone: '555-0123',
      tableNumber: '5',
    },
    subtotal: 22.25,
    total: 22.25,
    status: 'completed',
    estimatedPickupTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'ORDER-1735530000000',
    items: [
      {
        id: 'cart-3',
        drinkId: '3',
        drinkName: 'Cappuccino',
        drinkImage: '/images/cappuccino.svg',
        size: { id: 'small', name: 'Small (12oz)', priceModifier: 0 },
        milk: 'Almond Milk',
        sweetness: '1 Sugar',
        temperature: 'Hot',
        addOns: [{ id: 'extra-shot', name: 'Extra Shot', price: 1.0 }],
        quantity: 1,
        totalPrice: 5.75,
      },
    ],
    customer: {
      name: 'Jane Smith',
      phone: '555-0456',
      tableNumber: '',
    },
    subtotal: 5.75,
    total: 5.75,
    status: 'ready',
    estimatedPickupTime: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
  },
  {
    id: 'ORDER-1735522800000',
    items: [
      {
        id: 'cart-4',
        drinkId: '4',
        drinkName: 'Matcha Hojicha Swirl',
        drinkImage: '/images/matcha-hojicha-swirl.svg',
        size: { id: 'large', name: 'Large (20oz)', priceModifier: 2.5 },
        milk: 'Oat Milk',
        sweetness: '75%',
        temperature: 'Iced',
        addOns: [
          { id: 'whipped-cream', name: 'Whipped Cream', price: 0.5 },
          { id: 'extra-syrup', name: 'Extra Syrup', price: 0.5 },
        ],
        quantity: 1,
        totalPrice: 9.75,
      },
      {
        id: 'cart-5',
        drinkId: '1',
        drinkName: 'Matcha Latte',
        drinkImage: '/images/matcha-latte.svg',
        size: { id: 'small', name: 'Small (12oz)', priceModifier: 0 },
        milk: 'Soy Milk',
        sweetness: '100%',
        temperature: 'Hot',
        addOns: [],
        quantity: 1,
        totalPrice: 5.5,
      },
    ],
    customer: {
      name: 'Mike Johnson',
      phone: '',
      tableNumber: '12',
    },
    subtotal: 15.25,
    total: 15.25,
    status: 'preparing',
    estimatedPickupTime: new Date(Date.now() + 8 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
  },
  {
    id: 'ORDER-1735515600000',
    items: [
      {
        id: 'cart-6',
        drinkId: '2',
        drinkName: 'Hojicha Latte',
        drinkImage: '/images/hojicha-latte.svg',
        size: { id: 'medium', name: 'Medium (16oz)', priceModifier: 1.5 },
        milk: 'Coconut Milk',
        sweetness: 'No Sugar',
        temperature: 'Iced',
        addOns: [],
        quantity: 3,
        totalPrice: 20.25,
      },
    ],
    customer: {
      name: 'Sarah Wilson',
      phone: '555-0789',
      tableNumber: '',
    },
    subtotal: 20.25,
    total: 20.25,
    status: 'pending',
    estimatedPickupTime: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
  },
];

export const useOrderHistory = () => {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const savedOrders = localStorage.getItem('drinkOrderHistory');
    console.log('Saved orders from localStorage:', savedOrders);
    
    // Clear localStorage to force loading mock data
    localStorage.removeItem('drinkOrderHistory');
    
    const mockOrders = getMockOrders();
    console.log('Loading mock orders:', mockOrders);
    setOrders(mockOrders);
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
  };

  return {
    orders,
    addOrder,
    getRecentOrders,
    clearHistory,
  };
};