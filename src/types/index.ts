export interface DrinkCategory {
  id: string;
  name: string;
  description?: string;
}

export interface DrinkAddOn {
  id: string;
  name: string;
  price: number;
}

export interface Drink {
  id: string;
  name: string;
  description: string;
  image: string;
  category: string;
  basePrice: number;
  sizes: DrinkSize[];
  milkOptions: string[];
  sweetnessLevels: string[];
  temperatureOptions: string[];
  addOns: DrinkAddOn[];
  isPopular?: boolean;
  isFavorite?: boolean;
}

export interface DrinkSize {
  id: string;
  name: string;
  priceModifier: number;
}

export interface CartItem {
  id: string;
  drinkId: string;
  drinkName: string;
  drinkImage: string;
  size: DrinkSize;
  milk: string;
  sweetness: string;
  temperature: string;
  addOns: DrinkAddOn[];
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