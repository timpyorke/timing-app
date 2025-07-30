export const formatPrice = (price: number): string => {
  return `$${price.toFixed(2)}`;
};

export const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

export const calculateEstimatedTime = (minutes: number): string => {
  const now = new Date();
  const estimated = new Date(now.getTime() + minutes * 60 * 1000);
  return formatDateTime(estimated.toISOString());
};

export const getOrderStatusColor = (status: string): string => {
  switch (status) {
    case 'pending':
      return 'badge-warning';
    case 'confirmed':
      return 'badge-info';
    case 'preparing':
      return 'badge-primary';
    case 'ready':
      return 'badge-success';
    case 'completed':
      return 'badge-success';
    case 'cancelled':
      return 'badge-error';
    default:
      return 'badge-ghost';
  }
};

export const getOrderStatusText = (status: string): string => {
  switch (status) {
    case 'pending':
      return 'Order Received';
    case 'confirmed':
      return 'Confirmed';
    case 'preparing':
      return 'Preparing';
    case 'ready':
      return 'Ready for Pickup';
    case 'completed':
      return 'Completed';
    case 'cancelled':
      return 'Cancelled';
    default:
      return status;
  }
};

export const debounce = <T extends (...args: any[]) => void>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: number;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => func(...args), delay);
  };
};

export const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
};