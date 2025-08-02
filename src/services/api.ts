import { 
  Menu, 
  MenuCategory, 
  Order, 
  OrderStatus,
  OrderStatusResponse, 
  CartItem, 
  Customer,
  FetchRequestOptions,
  ApiMenuResponse,
  ApiMenuItemResponse,
  ApiMenuCategoryResponse,
  ApiOrderRequest,
  ApiOrderResponse,
  ApiOrderStatusResponse,
  ApiOrdersResponse,
  ApiOrderHistoryItem,
  ApiCustomerInfo
} from '../types';
import { getAnonymousUserId } from '../utils';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

class ApiService {
  private async request<T>(endpoint: string, options?: FetchRequestOptions): Promise<T> {
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

  async getMenu(): Promise<{ categories: MenuCategory[]; menu: Menu[] }> {
    try {
      const response = await this.request<ApiMenuResponse>('/api/menu');
      // Transform API response to match our interface
      return this.transformMenuResponse(response);
    } catch (error) {
      console.error('Failed to fetch menu:', error);
      // Return empty data instead of mock data
      return { categories: [], menu: [] };
    }
  }

  async getMenuDetails(id: string): Promise<Menu | null> {
    try {
      const response = await this.request<{ data: ApiMenuItemResponse } | ApiMenuItemResponse>(`/api/menu/${id}`);
      // Transform API response to match our Menu interface
      return this.transformSingleMenuResponse(response);
    } catch (error) {
      console.error('Failed to fetch menu item details:', error);
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

      const customerInfo: ApiCustomerInfo = {
        name: customer.name,
        email: `${customer.name.toLowerCase().replace(/\s+/g, '.')}@customer.timing.com`,
      };

      // Only include phone if it's not empty
      const formattedPhone = formatPhone(customer.phone);
      if (formattedPhone && formattedPhone.trim() !== '') {
        customerInfo.phone = formattedPhone;
      }

      const orderData: ApiOrderRequest = {
        customer_id: userIdToUse, // API expects customer_id field
        customer_info: customerInfo,
        items: items.map(item => ({
          menu_id: parseInt(item.menuId),
          name: item.menuName,
          image_url: item.imageUrl,
          quantity: item.quantity,
          price: item.totalPrice / item.quantity,
          customizations: {
            size: item.size.name,
            milk: item.milk.name,
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

      const response = await this.request<ApiOrderResponse>('/api/orders', {
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
      const response = await this.request<ApiOrderStatusResponse>(`/api/orders/${orderId}/status`);
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
      const response = await this.request<ApiOrdersResponse>(`/api/orders/customer/${customerId}`);
      // Transform API response to match our Order interface
      return this.transformOrdersResponse(response);
    } catch (error) {
      console.error('Failed to fetch orders by customer ID:', error);
      // Return empty array on error, let the hook handle fallback to mock data
      return [];
    }
  }

  // Transform methods to convert API responses to our interface format
  private transformMenuResponse(response: ApiMenuResponse): { categories: MenuCategory[]; menu: Menu[] } {
    // Handle the actual API response format: {success: true, data: [...]}
    const menuData = response?.data || response;
    
    if (menuData && Array.isArray(menuData)) {
      const menuItems: Menu[] = [];
      
      // Flatten the category-based structure
      menuData.forEach((category: ApiMenuCategoryResponse) => {
        if (category.items && Array.isArray(category.items)) {
          category.items.forEach((item: ApiMenuItemResponse) => {
            // Normalize customizations keys to lowercase
            interface NormalizedCustomizations {
              sizes?: string[];
              size?: string[];
              milk?: string[];
              sweetness?: string[];
              sweet?: string[];
              extras?: string[];
              syrups?: string[];
              [key: string]: string[] | boolean | undefined;
            }
            
            const normalizedCustomizations: NormalizedCustomizations = {};
            if (item.customizations) {
              Object.keys(item.customizations).forEach(key => {
                normalizedCustomizations[key.toLowerCase()] = item.customizations![key as keyof typeof item.customizations];
              });
            }

            // Transform dynamic sizes from API for each item
            const apiSizes = Array.isArray(normalizedCustomizations.sizes) ? normalizedCustomizations.sizes : 
                            Array.isArray(normalizedCustomizations.size) ? normalizedCustomizations.size : [];
            const sizes: import('../types').MenuSize[] = apiSizes.map((sizeName: string, index: number) => {
              // Dynamic pricing based on size name
              let priceModifier = 0;
              const lowerSizeName = sizeName.toLowerCase();
              
              if (lowerSizeName.includes('large') || lowerSizeName.includes('l')) {
                priceModifier = 15;
              } else if (lowerSizeName.includes('medium') || lowerSizeName.includes('m')) {
                priceModifier = 0;
              } else if (lowerSizeName.includes('small') || lowerSizeName.includes('s')) {
                priceModifier = 0;
              } else {
                // Fallback to index-based pricing for unknown sizes
                priceModifier = index * 15;
              }
              
              return {
                id: sizeName.toLowerCase(),
                name: sizeName,
                priceModifier
              };
            });

            // Transform dynamic add-ons/extras from API for each item
            const apiExtras = Array.isArray(normalizedCustomizations.extras) ? normalizedCustomizations.extras :
                             Array.isArray(normalizedCustomizations.syrups) ? normalizedCustomizations.syrups : [];
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

            // Transform milk options with pricing
            const apiMilkOptions = Array.isArray(normalizedCustomizations.milk) ? normalizedCustomizations.milk : [];
            const milkOptions = apiMilkOptions.map((milk: string) => ({
              id: milk.toLowerCase().replace(/\s+/g, '-'),
              name: milk.trim(),
              price: milk.toLowerCase().includes('normal') ? 0 : 20
            }));

            menuItems.push({
              id: item.id?.toString(),
              name: item.name,
              description: item.description || `Delicious ${item.name}`,
              image: item.image_url || `/images/${item.name.toLowerCase().replace(/\s+/g, '-')}.svg`,
              category: category.category?.toLowerCase() || 'specialty',
              basePrice: parseFloat(item.base_price?.toString() || '4.50'),
              sizes,
              milkOptions,
              sweetnessLevels: Array.isArray(normalizedCustomizations.sweetness) ? normalizedCustomizations.sweetness :
                              Array.isArray(normalizedCustomizations.sweet) ? normalizedCustomizations.sweet : [],
              temperatureOptions: ['Iced'],
              addOns: addOns.length > 0 ? addOns : fallbackAddOns,
              isPopular: item.popular || false,
            });
          });
        }
      });

      // Create dynamic categories from the API data
      const apiCategories = [...new Set(menuData.map((cat: ApiMenuCategoryResponse) => cat.category))];
      const dynamicCategories: MenuCategory[] = apiCategories.map((catName: string) => ({
        id: catName.toLowerCase(),
        name: catName,
        description: `Premium ${catName.toLowerCase()} selections`
      }));

      return { categories: dynamicCategories, menu: menuItems };
    }
    
    // Return empty data if API response format is unexpected
    return { categories: [], menu: [] };
  }

  private transformOrderResponse(response: ApiOrderResponse, items: CartItem[], customer: Customer, userId?: string): Order {
    const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
    
    return {
      id: response.data?.id?.toString() || response.id?.toString() || `ORDER-${Date.now()}`,
      userId,
      items,
      customer,
      subtotal,
      total: subtotal,
      status: (response.data?.status || response.status || 'pending') as OrderStatus,
      estimatedPickupTime: response.data?.estimated_pickup_time || 
                          response.estimated_pickup_time || 
                          new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      createdAt: response.data?.created_at || 
                response.created_at || 
                new Date().toISOString(),
    };
  }

  private transformOrderStatusResponse(response: ApiOrderStatusResponse): OrderStatusResponse {
    const statusValue = response.data?.status || response.status || 'pending';
    return {
      id: response.data?.id?.toString() || response.id?.toString() || '',
      status: statusValue as OrderStatus,
      estimatedPickupTime: response.data?.estimated_pickup_time || 
                          response.estimated_pickup_time || 
                          new Date(Date.now() + 10 * 60 * 1000).toISOString(),
      items: response.data?.items || response.items || [
        { name: 'Order Item', quantity: 1 }
      ],
    };
  }

  private transformOrdersResponse(response: ApiOrdersResponse): Order[] {
    // Handle API response format: {success: true, data: [...]}
    const ordersData = response?.data || response;
    
    if (!Array.isArray(ordersData)) {
      return [];
    }

    return ordersData.map((apiOrder: ApiOrderHistoryItem) => {
      // Transform API order to our Order interface
      const statusValue = apiOrder.status || 'pending';
      const transformedOrder: Order = {
        id: apiOrder.id?.toString() || `ORDER-${Date.now()}`,
        userId: apiOrder.user_id,
        items: this.transformOrderItems(apiOrder.items || []),
        customer: {
          name: apiOrder.customer_info?.name || 'Unknown Customer',
          phone: apiOrder.customer_info?.phone || '',
          tableNumber: apiOrder.customer_info?.table_number || apiOrder.customer_info?.tableNumber || ''
        },
        subtotal: parseFloat(apiOrder.total?.toString() || '0'),
        total: parseFloat(apiOrder.total?.toString() || '0'),
        status: statusValue as OrderStatus,
        estimatedPickupTime: apiOrder.estimated_pickup_time || 
                            apiOrder.estimatedPickupTime ||
                            new Date(Date.now() + 15 * 60 * 1000).toISOString(),
        createdAt: apiOrder.created_at || apiOrder.createdAt || new Date().toISOString(),
      };

      return transformedOrder;
    });
  }

  private transformOrderItems(apiItems: ApiOrderHistoryItem['items']): CartItem[] {
    if (!Array.isArray(apiItems)) {
      return [];
    }

    return apiItems.map((apiItem, index: number) => {
      const item: CartItem = {
        id: `item-${index}`,
        menuId: apiItem.menu_id?.toString() || '1',
        menuName: apiItem.name || apiItem.menuName || apiItem.menu_name || `Menu #${apiItem.menu_id || 'Unknown'}`,
        imageUrl: apiItem.image_url || apiItem.imageUrl || `/images/${(apiItem.name || apiItem.menuName || apiItem.menu_name || 'placeholder-menu').toLowerCase().replace(/\s+/g, '-')}.svg`,
        size: {
          id: apiItem.customizations?.size?.toLowerCase().replace(/\s+/g, '-') || 'medium',
          name: apiItem.customizations?.size || 'Medium',
          priceModifier: 0
        },
        milk: {
          id: 'regular-milk',
          name: apiItem.customizations?.milk || 'Regular Milk',
          price: 0
        },
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

  private transformSingleMenuResponse(response: { data: ApiMenuItemResponse } | ApiMenuItemResponse): Menu | null {
    // Handle API response format: {success: true, data: {...}}
    const menuData = 'data' in response ? response.data : response;
    
    if (!menuData || !menuData.id) {
      return null;
    }

    // Normalize customizations keys to lowercase
    interface NormalizedCustomizations {
      sizes?: string[];
      size?: string[];
      milk?: string[];
      sweetness?: string[];
      sweet?: string[];
      extras?: string[];
      syrups?: string[];
      [key: string]: string[] | boolean | undefined;
    }
    
    const normalizedCustomizations: NormalizedCustomizations = {};
    if (menuData.customizations) {
      Object.keys(menuData.customizations).forEach(key => {
        normalizedCustomizations[key.toLowerCase()] = menuData.customizations![key as keyof typeof menuData.customizations];
      });
    }

    // Transform dynamic sizes from API
    const apiSizes = Array.isArray(normalizedCustomizations.sizes) ? normalizedCustomizations.sizes : 
                    Array.isArray(normalizedCustomizations.size) ? normalizedCustomizations.size : [];
    const sizes: import('../types').MenuSize[] = apiSizes.map((sizeName: string, index: number) => {
      // Dynamic pricing based on size name
      let priceModifier = 0;
      const lowerSizeName = sizeName.toLowerCase();
      
      if (lowerSizeName.includes('large') || lowerSizeName.includes('l')) {
        priceModifier = 15;
      } else if (lowerSizeName.includes('medium') || lowerSizeName.includes('m')) {
        priceModifier = 0;
      } else if (lowerSizeName.includes('small') || lowerSizeName.includes('s')) {
        priceModifier = 0;
      } else {
        // Fallback to index-based pricing for unknown sizes
        priceModifier = index * 15;
      }
      
      return {
        id: sizeName.toLowerCase(),
        name: sizeName,
        priceModifier
      };
    });

    // Transform dynamic add-ons/extras from API
    const apiExtras = Array.isArray(normalizedCustomizations.extras) ? normalizedCustomizations.extras :
                     Array.isArray(normalizedCustomizations.syrups) ? normalizedCustomizations.syrups : [];
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

    // Transform dynamic milk options from API with pricing
    const apiMilkOptions = Array.isArray(normalizedCustomizations.milk) ? normalizedCustomizations.milk : [];
    const milkOptions = apiMilkOptions.map((milk: string) => ({
      id: milk.toLowerCase().replace(/\s+/g, '-'),
      name: milk.trim(),
      price: milk.toLowerCase().includes('normal') ? 0 : 20
    }));

    // Handle sweetness levels from API
    const sweetnessLevels = Array.isArray(normalizedCustomizations.sweetness) ? normalizedCustomizations.sweetness :
                           Array.isArray(normalizedCustomizations.sweet) ? normalizedCustomizations.sweet : [];

    // Handle temperature options (only Iced is available)
    const temperatureOptions = ['Iced'];

    const menu: Menu = {
      id: menuData.id?.toString(),
      name: menuData.name,
      description: menuData.description || `Delicious ${menuData.name}`,
      image: menuData.image_url || `/images/${menuData.name.toLowerCase().replace(/\s+/g, '-')}.svg`,
      category: menuData.category?.toLowerCase() || 'specialty',
      basePrice: parseFloat(menuData.base_price?.toString() || '4.50'),
      sizes,
      milkOptions,
      sweetnessLevels,
      temperatureOptions,
      addOns: addOns.length > 0 ? addOns : fallbackAddOns,
      isPopular: menuData.popular || false,
    };

    return menu;
  }
}

export const apiService = new ApiService();