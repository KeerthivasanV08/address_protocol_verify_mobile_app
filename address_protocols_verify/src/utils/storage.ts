import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const STORAGE_KEYS = {
  USER_ID: 'aava_user_id',
  CONSENT_ID: 'aava_consent_id',
  DISPLAY_NAME: 'aava_display_name',
};

export const secureStorage = {
  async setUserId(userId: string): Promise<void> {
    if (Platform.OS === 'web') {
      localStorage.setItem(STORAGE_KEYS.USER_ID, userId);
    } else {
      await SecureStore.setItemAsync(STORAGE_KEYS.USER_ID, userId);
    }
  },

  async getUserId(): Promise<string | null> {
    if (Platform.OS === 'web') {
      return localStorage.getItem(STORAGE_KEYS.USER_ID);
    } else {
      return await SecureStore.getItemAsync(STORAGE_KEYS.USER_ID);
    }
  },

  async setConsentId(consentId: string): Promise<void> {
    if (Platform.OS === 'web') {
      localStorage.setItem(STORAGE_KEYS.CONSENT_ID, consentId);
    } else {
      await SecureStore.setItemAsync(STORAGE_KEYS.CONSENT_ID, consentId);
    }
  },

  async getConsentId(): Promise<string | null> {
    if (Platform.OS === 'web') {
      return localStorage.getItem(STORAGE_KEYS.CONSENT_ID);
    } else {
      return await SecureStore.getItemAsync(STORAGE_KEYS.CONSENT_ID);
    }
  },

  async setDisplayName(name: string): Promise<void> {
    if (Platform.OS === 'web') {
      localStorage.setItem(STORAGE_KEYS.DISPLAY_NAME, name);
    } else {
      await SecureStore.setItemAsync(STORAGE_KEYS.DISPLAY_NAME, name);
    }
  },

  async getDisplayName(): Promise<string | null> {
    if (Platform.OS === 'web') {
      return localStorage.getItem(STORAGE_KEYS.DISPLAY_NAME);
    } else {
      return await SecureStore.getItemAsync(STORAGE_KEYS.DISPLAY_NAME);
    }
  },

  async clearAll(): Promise<void> {
    if (Platform.OS === 'web') {
      Object.values(STORAGE_KEYS).forEach((key) => {
        localStorage.removeItem(key);
      });
    } else {
      await Promise.all(
        Object.values(STORAGE_KEYS).map((key) =>
          SecureStore.deleteItemAsync(key)
        )
      );
    }
  },
};

export default secureStorage;
