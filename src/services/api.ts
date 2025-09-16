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
  ApiCustomerInfo,
  MenuSize,
  MilkOption
} from '../types';
import { getAnonymousUserId, transformApiSizes, generateImagePath, generateUUID } from '../utils';
import { remoteConfigService, MenuCustomizationConfig } from './remoteConfig';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

class ApiService {
  private async request<T>(endpoint: string, options?: FetchRequestOptions): Promise<T> {
    // Add locale parameter to the endpoint if not already present
    const url = new URL(`${API_BASE_URL}${endpoint}`);

    // Get current language from localStorage or default to Thai
    const currentLocale = typeof window !== 'undefined'
      ? localStorage.getItem('i18nextLng') || 'th'
      : 'th';

    // Add locale parameter if not already in the URL
    if (!url.searchParams.has('locale')) {
      url.searchParams.set('locale', currentLocale);
    }

    const response = await fetch(url.toString(), {
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
      const [response, customizationConfig] = await Promise.all([
        this.request<ApiMenuResponse>('/api/menu'),
        remoteConfigService.checkMenuCustomizationConfig(),
      ]);
      // Transform API response to match our interface
      return this.transformMenuResponse(response, customizationConfig);
    } catch (error) {
      console.error('Failed to fetch menu:', error);
      // Return empty data instead of mock data
      return { categories: [], menu: [] };
    }
  }

  async getMenuDetails(id: string): Promise<Menu | null> {
    try {
      const [response, customizationConfig] = await Promise.all([
        this.request<{ data: ApiMenuItemResponse } | ApiMenuItemResponse>(`/api/menu/${id}`),
        remoteConfigService.checkMenuCustomizationConfig(),
      ]);
      // Transform API response to match our Menu interface
      return this.transformSingleMenuResponse(response, customizationConfig);
    } catch (error) {
      console.error('Failed to fetch menu item details:', error);
      // Return null instead of mock data
      return null;
    }
  }

  async createOrder(
    items: CartItem[],
    customer: Customer,
    paymentMethod: string,
    userId?: string,
    attachmentUrl?: string
  ): Promise<Order> {
    // Get or use provided user ID (declare outside try block)
    const userIdToUse = userId || getAnonymousUserId();

    try {
      const total = items.reduce((sum, item) => sum + item.totalPrice, 0);

      const normalizedPaymentMethod = paymentMethod === 'cash' ? 'cash' : 'qr';

      const customerInfo: ApiCustomerInfo = {
        name: customer.name,
        email: `${customer.name.toLowerCase().replace(/\s+/g, '.')}@customer.timing.com`,
      };

      // Only include phone if it's not empty and valid
      if (customer.phone && customer.phone.trim() !== '') {
        customerInfo.phone = customer.phone.trim();
      }

      // Include table number if provided
      if (customer.tableNumber && customer.tableNumber.trim() !== '') {
        customerInfo.table_number = customer.tableNumber.trim();
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
        total: total,
        payment_method: normalizedPaymentMethod,
        ...(attachmentUrl ? { attachment_url: attachmentUrl } : {}),
        ...(customer.notes && customer.notes.trim() !== '' ? { notes: customer.notes.trim() } : {})
      };


      const response = await this.request<ApiOrderResponse>('/api/orders', {
        method: 'POST',
        body: JSON.stringify(orderData),
      });


      // Check if response is valid
      if (!response) {
        throw new Error('Order creation failed - no response from server');
      }

      // Transform response to match our Order interface
      const transformedOrder = this.transformOrderResponse(response, items, customer, userIdToUse, normalizedPaymentMethod);

      // Validate that the order has an ID
      if (!transformedOrder.id) {
        throw new Error('Order creation failed - no order ID returned');
      }

      return transformedOrder;
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
  private transformMenuResponse(response: ApiMenuResponse, customizationConfig?: MenuCustomizationConfig): { categories: MenuCategory[]; menu: Menu[] } {
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
            const sizes = transformApiSizes(apiSizes).map(size => ({
              ...size,
              id: size.name.toLowerCase()
            }));

            // Transform dynamic add-ons/extras from API for each item
            const apiExtras = Array.isArray(normalizedCustomizations.extras) ? normalizedCustomizations.extras :
              Array.isArray(normalizedCustomizations.syrups) ? normalizedCustomizations.syrups : [];
            const addOns = apiExtras.map((extra: string) => ({
              id: generateImagePath(extra),
              name: extra,
              price: 0.5,
              enable: true,
            }));

            // Fallback add-ons if none provided by API
            const fallbackAddOns = [
              { id: 'extra-shot', name: 'Extra Shot', price: 15.0, enable: true },
              { id: 'whipped-cream', name: 'Whipped Cream', price: 15.0, enable: true },
              { id: 'extra-syrup', name: 'Extra Syrup', price: 0.0, enable: true },
            ];

            // Transform milk options with pricing
            const apiMilkOptions = Array.isArray(normalizedCustomizations.milk) ? normalizedCustomizations.milk : [];
            const milkOptions = apiMilkOptions.map((milk: string) => ({
              id: generateImagePath(milk),
              name: milk.trim(),
              price: milk.toLowerCase().includes('normal') || milk.toLowerCase().includes('oat') ? 0 : 20,
              enable: true,
            }));

            const sizesWithConfig = this.applySizeConfig(sizes, customizationConfig);
            const milkOptionsWithConfig = this.applyMilkConfig(milkOptions, customizationConfig);

            menuItems.push({
              id: item.id?.toString(),
              name: item.name,
              description: item.description || `Delicious ${item.name}`,
              image: item.image_url || `/images/${generateImagePath(item.name)}.svg`,
              category: category.category?.toLowerCase() || 'specialty',
              basePrice: parseFloat(item.base_price?.toString() || '4.50'),
              sizes: sizesWithConfig,
              milkOptions: milkOptionsWithConfig,
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

  private transformOrderResponse(
    response: ApiOrderResponse,
    items: CartItem[],
    customer: Customer,
    userId?: string,
    fallbackPaymentMethod?: string
  ): Order {
    const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);

    // Extract order ID with better validation
    let orderId: string | undefined;

    if (response?.data?.id) {
      orderId = response.data.id.toString();
    } else if (response?.id) {
      orderId = response.id.toString();
    }


    // If no ID found, this indicates a problem with the API response
    if (!orderId) {
      console.error('No order ID found in API response:', response);
      // Still generate a fallback ID but this should be investigated
      orderId = generateUUID();
    }

    const paymentMethod = response?.data?.payment_method || response?.payment_method || fallbackPaymentMethod;

    return {
      id: orderId,
      userId,
      items,
      customer,
      subtotal,
      total: subtotal,
      status: (response?.data?.status || response?.status || 'pending') as OrderStatus,
      estimatedPickupTime: response?.data?.estimated_pickup_time ||
        response?.estimated_pickup_time ||
        new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      createdAt: response?.data?.created_at ||
        response?.created_at ||
        new Date().toISOString(),
      paymentMethod,
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
        id: apiOrder.id?.toString() || generateUUID(),
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
        paymentMethod: apiOrder.payment_method || apiOrder.paymentMethod,
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
        imageUrl: apiItem.image_url || apiItem.imageUrl || `/images/${generateImagePath(apiItem.name || apiItem.menuName || apiItem.menu_name || 'placeholder-menu')}.svg`,
        size: {
          id: apiItem.customizations?.size ? generateImagePath(apiItem.customizations.size) : 'medium',
          name: apiItem.customizations?.size || 'Medium',
          priceModifier: 0,
          enable: true,
        },
        milk: {
          id: 'regular-milk',
          name: apiItem.customizations?.milk || 'Regular Milk',
          price: 0,
          enable: true,
        },
        sweetness: apiItem.customizations?.sweetness || '50%',
        temperature: apiItem.customizations?.temperature || 'Hot',
        addOns: (apiItem.customizations?.extras || []).map((extra: string) => ({
          id: generateImagePath(extra),
          name: extra,
          price: 0.5,
          enable: true,
        })),
        quantity: parseInt(apiItem.quantity?.toString() || '1'),
        totalPrice: parseFloat(apiItem.price?.toString() || '0') * parseInt(apiItem.quantity?.toString() || '1')
      };

      return item;
    });
  }

  private transformSingleMenuResponse(response: { data: ApiMenuItemResponse } | ApiMenuItemResponse, customizationConfig?: MenuCustomizationConfig): Menu | null {
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
    const sizes = transformApiSizes(apiSizes).map(size => ({
      ...size,
      id: size.name.toLowerCase()
    }));

    // Transform dynamic add-ons/extras from API
    const apiExtras = Array.isArray(normalizedCustomizations.extras) ? normalizedCustomizations.extras :
      Array.isArray(normalizedCustomizations.syrups) ? normalizedCustomizations.syrups : [];
    const addOns = apiExtras.map((extra: string) => ({
      id: generateImagePath(extra),
      name: extra,
      price: 0.5, // Standard price for all add-ons
      enable: true,
    }));

    // Fallback add-ons if none provided by API
    const fallbackAddOns = [
      { id: 'extra-shot', name: 'Extra Shot', price: 15.0, enable: true },
      { id: 'whipped-cream', name: 'Whipped Cream', price: 15.0, enable: true },
      { id: 'extra-syrup', name: 'Extra Syrup', price: 0.0, enable: true },
    ];

    // Transform dynamic milk options from API with pricing
    const apiMilkOptions = Array.isArray(normalizedCustomizations.milk) ? normalizedCustomizations.milk : [];
    const milkOptions = apiMilkOptions.map((milk: string) => ({
      id: generateImagePath(milk),
      name: milk.trim(),
      price: milk.toLowerCase().includes('normal') || milk.toLowerCase().includes('oat') ? 0 : 20,
      enable: true,
    }));

    // Handle sweetness levels from API
    const sweetnessLevels = Array.isArray(normalizedCustomizations.sweetness) ? normalizedCustomizations.sweetness :
      Array.isArray(normalizedCustomizations.sweet) ? normalizedCustomizations.sweet : [];

    // Handle temperature options (only Iced is available)
    const temperatureOptions = ['Iced'];

    const sizesWithConfig = this.applySizeConfig(sizes, customizationConfig);
    const milkOptionsWithConfig = this.applyMilkConfig(milkOptions, customizationConfig);

    const menu: Menu = {
      id: menuData.id?.toString(),
      name: menuData.name,
      description: menuData.description || `Delicious ${menuData.name}`,
      image: menuData.image_url || `/images/${generateImagePath(menuData.name)}.svg`,
      category: menuData.category?.toLowerCase() || 'specialty',
      basePrice: parseFloat(menuData.base_price?.toString() || '4.50'),
      sizes: sizesWithConfig,
      milkOptions: milkOptionsWithConfig,
      sweetnessLevels,
      temperatureOptions,
      addOns: addOns.length > 0 ? addOns : fallbackAddOns,
      isPopular: menuData.popular || false,
    };

    return menu;
  }

  // Apply remote config toggles to API-provided size options without replacing them entirely.
  private applySizeConfig(apiSizes: MenuSize[], config?: MenuCustomizationConfig): MenuSize[] {
    if (!config || !Array.isArray(config.size) || config.size.length === 0) {
      return apiSizes;
    }

    const sizeEntries = config.size
      .filter(option => option && typeof option.type === 'string')
      .flatMap(option => {
        const keys = this.getCustomizationTokens(option.type);
        return keys.map(key => [key, option] as const);
      })
      .filter((entry): entry is readonly [string, MenuCustomizationConfig['size'][number]] => Boolean(entry[0]));

    const configMap = new Map(sizeEntries);

    return apiSizes.map(size => {
      const keys = this.getCustomizationTokens(size.name);
      const option = keys.map(key => configMap.get(key)).find(Boolean);

      const priceModifier = option && typeof option.price === 'number' && Number.isFinite(option.price)
        ? option.price
        : size.priceModifier;

      const enable = option ? option.enable !== false : size.enable !== false;

      return {
        ...size,
        priceModifier,
        enable,
      };
    });
  }

  // Apply remote config toggles to API-provided milk options without replacing them entirely.
  private applyMilkConfig(apiMilkOptions: MilkOption[], config?: MenuCustomizationConfig): MilkOption[] {
    if (!config || !Array.isArray(config.milk) || config.milk.length === 0) {
      return apiMilkOptions;
    }

    const milkEntries = config.milk
      .filter(option => option && typeof option.type === 'string')
      .flatMap(option => {
        const keys = this.getCustomizationTokens(option.type);
        return keys.map(key => [key, option] as const);
      })
      .filter((entry): entry is readonly [string, MenuCustomizationConfig['milk'][number]] => Boolean(entry[0]));

    const configMap = new Map(milkEntries);

    return apiMilkOptions.map(milk => {
      const keys = this.getCustomizationTokens(milk.name);
      const option = keys.map(key => configMap.get(key)).find(Boolean);

      const price = option && typeof option.price === 'number' && Number.isFinite(option.price)
        ? option.price
        : milk.price;

      const enable = option ? option.enable !== false : milk.enable !== false;

      return {
        ...milk,
        price,
        enable,
      };
    });
  }

  private getCustomizationTokens(value: string): string[] {
    if (!value) return [];

    const rawTokens = value
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter(Boolean);

    const filteredTokens = rawTokens.filter(token => {
      if (!token) return false;
      if (token === 'size' || token === 'milk' || token === 'option') return false;
      if (token === 'oz' || token === 'ml') return false;
      if (/^\d+$/.test(token)) return false;
      return true;
    });

    const keys = new Set<string>();
    const joined = filteredTokens.join('');
    if (joined) {
      keys.add(joined);
    }
    filteredTokens.forEach(token => {
      keys.add(token);
      ['milk', 'size', 'option'].forEach(suffix => {
        if (token.endsWith(suffix) && token.length > suffix.length) {
          keys.add(token.slice(0, -suffix.length));
        }
      });
    });

    return Array.from(keys);
  }

}

export const apiService = new ApiService();
