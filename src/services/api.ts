import { Drink, DrinkCategory, Order, OrderStatusResponse, CartItem, Customer } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

class ApiService {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async getMenu(): Promise<{ categories: DrinkCategory[]; drinks: Drink[] }> {
    try {
      return await this.request<{ categories: DrinkCategory[]; drinks: Drink[] }>('/api/menu');
    } catch (error) {
      console.error('Failed to fetch menu:', error);
      return this.getMockMenu();
    }
  }

  async getDrinkDetails(id: string): Promise<Drink> {
    try {
      return await this.request<Drink>(`/api/menu/${id}`);
    } catch (error) {
      console.error('Failed to fetch drink details:', error);
      return this.getMockDrink(id);
    }
  }

  async createOrder(items: CartItem[], customer: Customer): Promise<Order> {
    try {
      const orderData = {
        items: items.map(item => ({
          drinkId: item.drinkId,
          drinkName: item.drinkName,
          size: item.size,
          milk: item.milk,
          sweetness: item.sweetness,
          temperature: item.temperature,
          addOns: item.addOns,
          quantity: item.quantity,
          totalPrice: item.totalPrice,
        })),
        customer,
        subtotal: items.reduce((sum, item) => sum + item.totalPrice, 0),
        total: items.reduce((sum, item) => sum + item.totalPrice, 0),
      };

      return await this.request<Order>('/api/orders', {
        method: 'POST',
        body: JSON.stringify(orderData),
      });
    } catch (error) {
      console.error('Failed to create order:', error);
      return this.getMockOrder(items, customer);
    }
  }

  async getOrderStatus(orderId: string): Promise<OrderStatusResponse> {
    try {
      return await this.request<OrderStatusResponse>(`/api/orders/${orderId}/status`);
    } catch (error) {
      console.error('Failed to fetch order status:', error);
      return this.getMockOrderStatus(orderId);
    }
  }

  private getMockMenu(): { categories: DrinkCategory[]; drinks: Drink[] } {
    const categories: DrinkCategory[] = [
      { id: 'tea', name: 'Tea', description: 'Premium tea selections' },
      { id: 'coffee', name: 'Coffee', description: 'Artisan coffee drinks' },
      { id: 'specialty', name: 'Specialty', description: 'Unique signature drinks' },
    ];

    const sizes: import('../types').DrinkSize[] = [
      { id: 'small', name: 'Small (12oz)', priceModifier: 0 },
      { id: 'medium', name: 'Medium (16oz)', priceModifier: 1.5 },
      { id: 'large', name: 'Large (20oz)', priceModifier: 2.5 },
    ];

    const addOns = [
      { id: 'extra-shot', name: 'Extra Shot', price: 1.0 },
      { id: 'whipped-cream', name: 'Whipped Cream', price: 0.5 },
      { id: 'extra-syrup', name: 'Extra Syrup', price: 0.5 },
      { id: 'decaf', name: 'Decaf', price: 0 },
    ];

    const drinks: Drink[] = [
      {
        id: '1',
        name: 'Matcha Latte',
        description: 'Premium ceremonial grade matcha with steamed milk',
        image: '/images/matcha-latte.svg',
        category: 'tea',
        basePrice: 5.50,
        sizes,
        milkOptions: ['Whole Milk', 'Oat Milk', 'Almond Milk', 'Soy Milk', 'Coconut Milk'],
        sweetnessLevels: ['No Sugar', '25%', '50%', '75%', '100%'],
        temperatureOptions: ['Iced', 'Hot'],
        addOns,
        isPopular: true,
      },
      {
        id: '2',
        name: 'Hojicha Latte',
        description: 'Roasted green tea with warm, nutty flavors',
        image: '/images/hojicha-latte.svg',
        category: 'tea',
        basePrice: 5.25,
        sizes,
        milkOptions: ['Whole Milk', 'Oat Milk', 'Almond Milk', 'Soy Milk'],
        sweetnessLevels: ['No Sugar', '25%', '50%', '75%', '100%'],
        temperatureOptions: ['Iced', 'Hot'],
        addOns,
      },
      {
        id: '3',
        name: 'Cappuccino',
        description: 'Classic Italian espresso with steamed milk foam',
        image: '/images/cappuccino.svg',
        category: 'coffee',
        basePrice: 4.75,
        sizes,
        milkOptions: ['Whole Milk', 'Oat Milk', 'Almond Milk', 'Soy Milk'],
        sweetnessLevels: ['No Sugar', '1 Sugar', '2 Sugar'],
        temperatureOptions: ['Hot'],
        addOns,
        isPopular: true,
      },
      {
        id: '4',
        name: 'Matcha Hojicha Swirl',
        description: 'Half matcha, half hojicha for the best of both worlds',
        image: '/images/matcha-hojicha-swirl.svg',
        category: 'specialty',
        basePrice: 6.25,
        sizes,
        milkOptions: ['Whole Milk', 'Oat Milk', 'Almond Milk'],
        sweetnessLevels: ['No Sugar', '25%', '50%', '75%', '100%'],
        temperatureOptions: ['Iced', 'Hot'],
        addOns,
      },
    ];

    return { categories, drinks };
  }

  private getMockDrink(id: string): Drink {
    const { drinks } = this.getMockMenu();
    return drinks.find(drink => drink.id === id) || drinks[0];
  }

  private getMockOrder(items: CartItem[], customer: Customer): Order {
    const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
    return {
      id: `ORDER-${Date.now()}`,
      items,
      customer,
      subtotal,
      total: subtotal,
      status: 'pending',
      estimatedPickupTime: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
    };
  }

  private getMockOrderStatus(orderId: string): OrderStatusResponse {
    return {
      id: orderId,
      status: 'preparing',
      estimatedPickupTime: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
      items: [
        { name: 'Matcha Latte', quantity: 1 },
        { name: 'Hojicha Latte', quantity: 1 },
      ],
    };
  }
}

export const apiService = new ApiService();