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

export interface Menu {
  id: string;
  name: string;
  description: string;
  image: string;
  category: string;
  basePrice: number;
  sizes: MenuSize[];
  milkOptions: string[];
  sweetnessLevels: string[];
  temperatureOptions: string[];
  addOns: MenuAddOn[];
  isPopular?: boolean;
  isFavorite?: boolean;
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
  milk: string;
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