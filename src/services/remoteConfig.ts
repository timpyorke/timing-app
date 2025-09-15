import { remoteConfig, fetchAndActivate, getBoolean, getValue } from './firebase';

export interface MerchantStatus {
  isClose: boolean;
  closeMessage: string;
  closeTitle: string;
}

export interface MenuCategoryConfigItem {
  type: string;
  is_show: boolean;
  order: number;
}

class RemoteConfigService {
  private lastFetchTime: number = 0;
  private readonly FETCH_INTERVAL = 30 * 60 * 1000; // 30 minutes in milliseconds

  async fetchConfig(): Promise<void> {
    try {
      const now = Date.now();
      
      // Check if we need to fetch (respect 30-minute interval)
      if (now - this.lastFetchTime < this.FETCH_INTERVAL) {
        console.log('Remote config fetch skipped - within minimum interval');
        return;
      }

      console.log('Fetching remote config...');
      await fetchAndActivate(remoteConfig);
      this.lastFetchTime = now;
      console.log('Remote config fetched and activated successfully');
    } catch (error) {
      console.error('Failed to fetch remote config:', error);
      // Don't throw error - use default values instead
    }
  }

  getMerchantStatus(): MerchantStatus {
    try {
      return {
        isClose: getBoolean(remoteConfig, 'is_close'),
        closeMessage: getValue(remoteConfig, 'close_message').asString(),
        closeTitle: getValue(remoteConfig, 'close_title').asString()
      };
    } catch (error) {
      console.error('Failed to get merchant status from remote config:', error);
      // Return default values
      return {
        isClose: false,
        closeMessage: 'Sorry, we are temporarily closed. Please try again later.',
        closeTitle: 'Store Temporarily Closed'
      };
    }
  }

  getCheckoutStatus(): boolean {
    try {
      return getBoolean(remoteConfig, 'is_disable_checkout');
    } catch (error) {
      console.error('Failed to get checkout status from remote config:', error);
      // Return default value (false = checkout enabled)
      return false;
    }
  }

  async checkCheckoutStatus(): Promise<boolean> {
    await this.fetchConfig();
    return this.getCheckoutStatus();
  }

  async checkMerchantStatus(): Promise<MerchantStatus> {
    await this.fetchConfig();
    return this.getMerchantStatus();
  }

  // Force fetch (ignores interval)
  async forceFetchConfig(): Promise<void> {
    try {
      console.log('Force fetching remote config...');
      await fetchAndActivate(remoteConfig);
      this.lastFetchTime = Date.now();
      console.log('Remote config force fetched successfully');
    } catch (error) {
      console.error('Failed to force fetch remote config:', error);
    }
  }

  getMenuCategoryConfig(): MenuCategoryConfigItem[] {
    try {
      const raw = getValue(remoteConfig, 'config/categoty_config').asString();
      if (!raw) return [];
      const parsed = JSON.parse(raw) as unknown;

      if (!Array.isArray(parsed)) return [];

      // Validate and normalize entries
      const items: MenuCategoryConfigItem[] = parsed
        .map((item) => {
          if (!item || typeof item !== 'object') return null;
          const type = String((item as any).type || '').toLowerCase().trim();
          const is_show = Boolean((item as any).is_show);
          const orderRaw = (item as any).order;
          const order = Number.isFinite(orderRaw) ? Number(orderRaw) : 0;
          if (!type) return null;
          return { type, is_show, order } as MenuCategoryConfigItem;
        })
        .filter(Boolean) as MenuCategoryConfigItem[];

      // Keep only visible and sort by order asc
      return items.filter(i => i.is_show).sort((a, b) => a.order - b.order);
    } catch (error) {
      console.error('Failed to parse menu category config from remote config:', error);
      return [];
    }
  }

  async checkMenuCategoryConfig(): Promise<MenuCategoryConfigItem[]> {
    await this.fetchConfig();
    return this.getMenuCategoryConfig();
  }
}

export const remoteConfigService = new RemoteConfigService();
