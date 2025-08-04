import { remoteConfig, fetchAndActivate, getBoolean, getValue } from './firebase';

export interface MerchantStatus {
  isClose: boolean;
  closeMessage: string;
  closeTitle: string;
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
}

export const remoteConfigService = new RemoteConfigService();