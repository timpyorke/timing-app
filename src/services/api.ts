import { Drink, DrinkCategory, Order, OrderStatusResponse, CartItem, Customer } from '../types';
import { getAnonymousUserId } from '../utils';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

class ApiService {
  private async request<T>(endpoint: string, options?: any): Promise<T> {
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
      const response = await this.request<any>('/api/menu');
      // Transform API response to match our interface
      return this.transformMenuResponse(response);
    } catch (error) {
      console.error('Failed to fetch menu:', error);
      // Return empty data instead of mock data
      return { categories: [], drinks: [] };
    }
  }

  async getDrinkDetails(id: string): Promise<Drink | null> {
    try {
      const response = await this.request<any>(`/api/menu/${id}`);
      // Transform API response to match our Drink interface
      return this.transformSingleDrinkResponse(response);
    } catch (error) {
      console.error('Failed to fetch drink details:', error);
      // Return null instead of mock data
      return null;
    }
  }

  async createOrder(items: CartItem[], customer: Customer, userId?: string): Promise<Order> {
    // Get or use provided user ID (declare outside try block)
    const userIdToUse = userId || getAnonymousUserId();
    
    try {
      const total = items.reduce((sum, item) => sum + item.totalPrice, 0);
      
      // Transform to match Timing API format
      const formatPhone = (phone: string): string => {
        if (!phone || phone.trim() === '') {
          return '';
        }
        if (phone.startsWith('+')) {
          return phone;
        }
        // Remove leading 0 and add +66 for Thai numbers
        return `+66${phone.replace(/^0/, '')}`;
      };

      const customerInfo: any = {
        name: customer.name,
        email: `${customer.name.toLowerCase().replace(/\s+/g, '.')}@customer.timing.com`,
      };

      // Only include phone if it's not empty
      const formattedPhone = formatPhone(customer.phone);
      if (formattedPhone && formattedPhone.trim() !== '') {
        customerInfo.phone = formattedPhone;
      }

      const orderData: any = {
        customer_id: userIdToUse, // API expects customer_id field
        customer_info: customerInfo,
        items: items.map(item => ({
          menu_id: parseInt(item.menuId),
          quantity: item.quantity,
          price: item.totalPrice / item.quantity,
          customizations: {
            size: item.size.name,
            milk: item.milk,
            sweetness: item.sweetness,
            temperature: item.temperature,
            extras: item.addOns.map(addon => addon.name),
          }
        })),
        total: total
      };

      console.log('Creating order with data:', {
        customer_id: orderData.customer_id,
        customer_name: orderData.customer_info.name,
        items_count: orderData.items.length,
        total: orderData.total
      });

      const response = await this.request<any>('/api/orders', {
        method: 'POST',
        body: JSON.stringify(orderData),
      });

      // Transform response to match our Order interface
      return this.transformOrderResponse(response, items, customer, userIdToUse);
    } catch (error) {
      console.error('Failed to create order:', error);
      // Rethrow error instead of returning mock data
      throw error;
    }
  }

  async getOrderStatus(orderId: string): Promise<OrderStatusResponse | null> {
    try {
      const response = await this.request<any>(`/api/orders/${orderId}/status`);
      // Transform API response to match our interface
      return this.transformOrderStatusResponse(response);
    } catch (error) {
      console.error('Failed to fetch order status:', error);
      // Return null instead of mock data
      return null;
    }
  }

  async getOrdersByCustomerId(customerId: string): Promise<Order[]> {
    try {
      const response = await this.request<any>(`/api/orders/customer/${customerId}`);
      // Transform API response to match our Order interface
      return this.transformOrdersResponse(response);
    } catch (error) {
      console.error('Failed to fetch orders by customer ID:', error);
      // Return empty array on error, let the hook handle fallback to mock data
      return [];
    }
  }

  // Transform methods to convert API responses to our interface format
  private transformMenuResponse(response: any): { categories: DrinkCategory[]; drinks: Drink[] } {
    // Handle the actual API response format: {success: true, data: [...]}
    const menuData = response?.data || response;
    
    if (menuData && Array.isArray(menuData)) {
      const drinks: Drink[] = [];
      
      // Flatten the category-based structure
      menuData.forEach((category: any) => {
        if (category.items && Array.isArray(category.items)) {
          category.items.forEach((item: any) => {
            // Transform dynamic sizes from API for each item
            const apiSizes = item.customizations?.sizes || ['Medium', 'Large'];
            const sizes: import('../types').DrinkSize[] = apiSizes.map((sizeName: string, index: number) => ({
              id: sizeName.toLowerCase(),
              name: sizeName,
              priceModifier: index * 10 // Small: 0, Medium: 1.5, Large: 3.0
            }));

            // Transform dynamic add-ons/extras from API for each item
            const apiExtras = item.customizations?.extras || item.customizations?.syrups || [];
            const addOns = apiExtras.map((extra: string) => ({
              id: extra.toLowerCase().replace(/\s+/g, '-'),
              name: extra,
              price: 0.5
            }));

            // Fallback add-ons if none provided by API
            const fallbackAddOns = [
            { id: 'extra-shot', name: 'Extra Shot', price: 15.0 },
            { id: 'whipped-cream', name: 'Whipped Cream', price: 15.0 },
            { id: 'extra-syrup', name: 'Extra Syrup', price: 0.0 },
            ];

            drinks.push({
              id: item.id?.toString(),
              name: item.name,
              description: item.description || `Delicious ${item.name}`,
              image: item.image_url || `/images/${item.name.toLowerCase().replace(/\s+/g, '-')}.svg`,
              category: category.category?.toLowerCase() || 'specialty',
              basePrice: parseFloat(item.base_price?.toString() || '4.50'),
              sizes,
              milkOptions: item.customizations?.milk || ['Regular', 'Oat',],
              sweetnessLevels: item.customizations?.sweetness || ['No Sugar', '25%', '50%', '75%', '100%'],
              temperatureOptions: item.customizations?.ice !== false ? ['Iced', 'Hot'] : ['Iced'],
              addOns: addOns.length > 0 ? addOns : fallbackAddOns,
              isPopular: item.popular || false,
            });
          });
        }
      });

      // Create dynamic categories from the API data
      const apiCategories = [...new Set(menuData.map((cat: any) => cat.category))];
      const dynamicCategories: DrinkCategory[] = apiCategories.map((catName: string) => ({
        id: catName.toLowerCase(),
        name: catName,
        description: `Premium ${catName.toLowerCase()} selections`
      }));

      return { categories: dynamicCategories, drinks };
    }
    
    // Return empty data if API response format is unexpected
    return { categories: [], drinks: [] };
  }

  private transformOrderResponse(response: any, items: CartItem[], customer: Customer, userId?: string): Order {
    const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
    
    return {
      id: response.data?.id?.toString() || response.id?.toString() || `ORDER-${Date.now()}`,
      userId,
      items,
      customer,
      subtotal,
      total: subtotal,
      status: response.data?.status || response.status || 'pending',
      estimatedPickupTime: response.data?.estimated_pickup_time || 
                          response.estimated_pickup_time || 
                          new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      createdAt: response.data?.created_at || 
                response.created_at || 
                new Date().toISOString(),
    };
  }

  private transformOrderStatusResponse(response: any): OrderStatusResponse {
    return {
      id: response.data?.id?.toString() || response.id?.toString(),
      status: response.data?.status || response.status || 'pending',
      estimatedPickupTime: response.data?.estimated_pickup_time || 
                          response.estimated_pickup_time || 
                          new Date(Date.now() + 10 * 60 * 1000).toISOString(),
      items: response.data?.items || response.items || [
        { name: 'Order Item', quantity: 1 }
      ],
    };
  }

  private transformOrdersResponse(response: any): Order[] {
    // Handle API response format: {success: true, data: [...]}
    const ordersData = response?.data || response;
    
    if (!Array.isArray(ordersData)) {
      return [];
    }

    return ordersData.map((apiOrder: any) => {
      // Transform API order to our Order interface
      const transformedOrder: Order = {
        id: apiOrder.id?.toString() || `ORDER-${Date.now()}`,
        userId: apiOrder.user_id,
        items: this.transformOrderItems(apiOrder.items || []),
        customer: {
          name: apiOrder.customer_info?.name || 'Unknown Customer',
          phone: apiOrder.customer_info?.phone || '',
          tableNumber: apiOrder.customer_info?.table_number || apiOrder.customer_info?.tableNumber || ''
        },
        subtotal: parseFloat(apiOrder.total || '0'),
        total: parseFloat(apiOrder.total || '0'),
        status: apiOrder.status || 'pending',
        estimatedPickupTime: apiOrder.estimated_pickup_time || 
                            apiOrder.estimatedPickupTime ||
                            new Date(Date.now() + 15 * 60 * 1000).toISOString(),
        createdAt: apiOrder.created_at || apiOrder.createdAt || new Date().toISOString(),
      };

      return transformedOrder;
    });
  }

  private transformOrderItems(apiItems: any[]): CartItem[] {
    if (!Array.isArray(apiItems)) {
      return [];
    }

    return apiItems.map((apiItem: any, index: number) => {
      const item: CartItem = {
        id: `item-${index}`,
        menuId: apiItem.menu_id?.toString() || apiItem.drinkId?.toString() || '1',
        menuName: apiItem.name || apiItem.menuName || 'Unknown Drink',
        imageUrl: apiItem.image_url || `/images/${(apiItem.name || 'default').toLowerCase().replace(/\s+/g, '-')}.svg`,
        size: {
          id: apiItem.customizations?.size?.toLowerCase().replace(/\s+/g, '-') || 'medium',
          name: apiItem.customizations?.size || 'Medium',
          priceModifier: 0
        },
        milk: apiItem.customizations?.milk || 'Regular Milk',
        sweetness: apiItem.customizations?.sweetness || '50%',
        temperature: apiItem.customizations?.temperature || 'Hot',
        addOns: (apiItem.customizations?.extras || []).map((extra: string) => ({
          id: extra.toLowerCase().replace(/\s+/g, '-'),
          name: extra,
          price: 0.5
        })),
        quantity: parseInt(apiItem.quantity?.toString() || '1'),
        totalPrice: parseFloat(apiItem.price?.toString() || '0') * parseInt(apiItem.quantity?.toString() || '1')
      };

      return item;
    });
  }

  private transformSingleDrinkResponse(response: any): Drink | null {
    // Handle API response format: {success: true, data: {...}}
    const drinkData = response?.data || response;
    
    if (!drinkData || !drinkData.id) {
      return null;
    }

    // Transform dynamic sizes from API
    const apiSizes = drinkData.customizations?.sizes || ['Medium', 'Large'];
    const sizes: import('../types').DrinkSize[] = apiSizes.map((sizeName: string, index: number) => ({
      id: sizeName.toLowerCase(),
      name: sizeName,
      priceModifier: index * 10 // Small: 0, Medium: 1.5, Large: 3.0
    }));

    // Transform dynamic add-ons/extras from API
    const apiExtras = drinkData.customizations?.extras || drinkData.customizations?.syrups || [];
    const addOns = apiExtras.map((extra: string) => ({
      id: extra.toLowerCase().replace(/\s+/g, '-'),
      name: extra,
      price: 0.5 // Standard price for all add-ons
    }));

    // Fallback add-ons if none provided by API
    const fallbackAddOns = [
      { id: 'extra-shot', name: 'Extra Shot', price: 15.0 },
      { id: 'whipped-cream', name: 'Whipped Cream', price: 15.0 },
      { id: 'extra-syrup', name: 'Extra Syrup', price: 0.0 },
    ];

    // Transform dynamic milk options from API
    const apiMilkOptions = drinkData.customizations?.milk || [];

    // Handle sweetness levels (API might provide this in future)
    const sweetnessLevels = drinkData.customizations?.sweetness || ['No Sugar', '25%', '50%', '75%', '100%'];

    // Handle temperature options (check if drink supports iced)
    const supportsIced = drinkData.customizations?.ice !== false && 
                         drinkData.category?.toLowerCase() !== 'hot-only';
    const temperatureOptions = supportsIced ? ['Iced', 'Hot'] : ['Iced'];

    const drink: Drink = {
      id: drinkData.id?.toString(),
      name: drinkData.name,
      description: drinkData.description || `Delicious ${drinkData.name}`,
      image: drinkData.image_url || `/images/${drinkData.name.toLowerCase().replace(/\s+/g, '-')}.svg`,
      category: drinkData.category?.toLowerCase() || 'specialty',
      basePrice: parseFloat(drinkData.base_price?.toString() || '4.50'),
      sizes,
      milkOptions: apiMilkOptions,
      sweetnessLevels,
      temperatureOptions,
      addOns: addOns.length > 0 ? addOns : fallbackAddOns,
      isPopular: drinkData.popular || false,
    };

    return drink;
  }
}

export const apiService = new ApiService();