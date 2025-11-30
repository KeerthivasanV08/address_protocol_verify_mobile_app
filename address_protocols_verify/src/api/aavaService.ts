import apiClient from './client';
import { demoService } from './demoService';
import Constants from 'expo-constants';
import type {
  DigipinResponse,
  ConsentRequest,
  ConsentResponse,
  ValidationRequest,
  ValidationResponse,
  ValidationStatusResponse,
} from '@/types/api';

const isDemoMode = (): boolean => {
  return (
    process.env.EXPO_PUBLIC_DEMO_MODE === 'true' ||
    Constants.expoConfig?.extra?.demoMode === true
  );
};

export const aavaService = {
  async generateDigipin(
    latitude: number,
    longitude: number
  ): Promise<DigipinResponse> {
    if (isDemoMode()) {
      return demoService.generateDigipin(latitude, longitude);
    }

    try {
      const response = await apiClient.post<DigipinResponse>(
        '/generate-digipin',
        { latitude, longitude }
      );
      return response.data;
    } catch (error: any) {
      if (!error.response) {
        console.log('Network error, falling back to demo mode');
        return demoService.generateDigipin(latitude, longitude);
      }
      throw error;
    }
  },

  async requestConsent(
    userId: string,
    action: string = 'address_validation'
  ): Promise<ConsentResponse> {
    if (isDemoMode()) {
      return demoService.requestConsent(userId, action);
    }

    try {
      const payload: ConsentRequest = {
        userId,
        action,
        clientId: 'aava-mobile-app',
      };
      const response = await apiClient.post<ConsentResponse>(
        '/consent',
        payload
      );
      return response.data;
    } catch (error: any) {
      if (!error.response) {
        console.log('Network error, falling back to demo mode');
        return demoService.requestConsent(userId, action);
      }
      throw error;
    }
  },

  async validateAddress(
    payload: ValidationRequest
  ): Promise<ValidationResponse> {
    if (isDemoMode()) {
      return demoService.validateAddress(payload);
    }

    try {
      const response = await apiClient.post<ValidationResponse>(
        '/validate-address',
        payload
      );
      return response.data;
    } catch (error: any) {
      if (!error.response) {
        console.log('Network error, falling back to demo mode');
        return demoService.validateAddress(payload);
      }
      throw error;
    }
  },

  async getValidationStatus(
    requestId: string
  ): Promise<ValidationStatusResponse> {
    if (isDemoMode()) {
      return demoService.getValidationStatus(requestId);
    }

    try {
      const response = await apiClient.get<ValidationStatusResponse>(
        `/validation-status/${requestId}`
      );
      return response.data;
    } catch (error: any) {
      if (!error.response) {
        console.log('Network error, falling back to demo mode');
        return demoService.getValidationStatus(requestId);
      }
      throw error;
    }
  },

  async revokeConsent(consentId: string): Promise<{ success: boolean }> {
    if (isDemoMode()) {
      return { success: true };
    }

    try {
      const response = await apiClient.post<{ success: boolean }>(
        `/consent/${consentId}/revoke`
      );
      return response.data;
    } catch (error: any) {
      if (!error.response) {
        console.log('Network error, operation may not have completed');
      }
      throw error;
    }
  },
};

export default aavaService;
