export interface MenuCategory {
  id: string;
  name: string;
  description?: string;
}

export interface MenuAddOn {
  id: string;
  name: string;
  price: number;
}

export interface MilkOption {
  id: string;
  name: string;
  price: number;
}

export interface Menu {
  id: string;
  name: string;
  description: string;
  image: string;
  category: string;
  basePrice: number;
  sizes: MenuSize[];
  milkOptions: MilkOption[];
  sweetnessLevels: string[];
  temperatureOptions: string[];
  addOns: MenuAddOn[];
  isPopular?: boolean;
}

export interface MenuSize {
  id: string;
  name: string;
  priceModifier: number;
}

export interface CartItem {
  id: string;
  menuId: string;
  menuName: string;
  imageUrl: string;
  size: MenuSize;
  milk: MilkOption;
  sweetness: string;
  temperature: string;
  addOns: MenuAddOn[];
  quantity: number;
  totalPrice: number;
}

export interface Customer {
  name: string;
  phone: string;
  tableNumber?: string;
  notes?: string;
}

export interface Order {
  id: string;
  userId?: string;
  items: CartItem[];
  customer: Customer;
  subtotal: number;
  total: number;
  status: OrderStatus;
  estimatedPickupTime: string;
  createdAt: string;
  paymentSlipUrl?: string;
}

export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled';

export interface OrderStatusResponse {
  id: string;
  status: OrderStatus;
  estimatedPickupTime: string;
  items: {
    name: string;
    quantity: number;
  }[];
}

export interface OrderConfirmationLocationState {
  customer: Customer;
  orderData: Order;
}

// API Response interfaces
export interface FetchRequestOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: string;
}

export interface ApiMenuItemCustomizations {
  sizes?: string[];
  milk?: string[];
  sweetness?: string[];
  ice?: boolean;
  extras?: string[];
  syrups?: string[];
}

export interface ApiMenuItemResponse {
  id: string | number;
  name: string;
  description?: string;
  image_url?: string;
  base_price: string | number;
  category?: string;
  popular?: boolean;
  customizations?: ApiMenuItemCustomizations;
}

export interface ApiMenuCategoryResponse {
  category: string;
  items: ApiMenuItemResponse[];
}

export interface ApiMenuResponse {
  data?: ApiMenuCategoryResponse[];
  success?: boolean;
}

export interface ApiCustomerInfo {
  name: string;
  email: string;
  phone?: string;
  table_number?: string;
}

export interface ApiCustomerInfoResponse {
  name?: string;
  phone?: string;
  table_number?: string;
  tableNumber?: string;
}

export interface ApiOrderItemCustomizations {
  size: string;
  milk: string;
  sweetness: string;
  temperature: string;
  extras: string[];
}

export interface ApiOrderItem {
  menu_id: number;
  name: string;
  image_url: string;
  quantity: number;
  price: number;
  customizations: ApiOrderItemCustomizations;
}

export interface ApiOrderRequest {
  customer_id: string;
  customer_info: ApiCustomerInfo;
  items: ApiOrderItem[];
  total: number;
  attachment_url?: string;
}

export interface ApiOrderResponse {
  data?: {
    id: string | number;
    status: string;
    estimated_pickup_time: string;
    created_at: string;
  };
  id?: string | number;
  status?: string;
  estimated_pickup_time?: string;
  created_at?: string;
}

export interface ApiOrderStatusResponse {
  data?: {
    id: string | number;
    status: string;
    estimated_pickup_time: string;
    items: Array<{ name: string; quantity: number }>;
  };
  id?: string | number;
  status?: string;
  estimated_pickup_time?: string;
  items?: Array<{ name: string; quantity: number }>;
}

export interface ApiOrdersResponse {
  data?: ApiOrderHistoryItem[];
  success?: boolean;
}

export interface ApiOrderHistoryItemData {
  menu_id?: string | number;
  name?: string;
  menuName?: string;
  menu_name?: string;
  image_url?: string;
  imageUrl?: string;
  quantity?: string | number;
  price?: string | number;
  customizations?: {
    size?: string;
    milk?: string;
    sweetness?: string;
    temperature?: string;
    extras?: string[];
  };
}

export interface ApiOrderHistoryItem {
  id: string | number;
  user_id?: string;
  customer_info?: ApiCustomerInfoResponse;
  items?: ApiOrderHistoryItemData[];
  total?: string | number;
  status?: string;
  estimated_pickup_time?: string;
  estimatedPickupTime?: string;
  created_at?: string;
  createdAt?: string;
}
