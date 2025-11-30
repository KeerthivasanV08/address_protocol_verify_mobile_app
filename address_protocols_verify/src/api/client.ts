import axios, { AxiosInstance, AxiosError } from 'axios';
import Constants from 'expo-constants';

const API_BASE_URL = Constants.expoConfig?.extra?.apiBaseUrl ||
                     process.env.EXPO_PUBLIC_API_BASE_URL ||
                     'http://localhost:8000';

class ApiClient {
  private client: AxiosInstance;
  private isOnline: boolean = true;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.client.interceptors.response.use(
      (response) => {
        this.isOnline = true;
        return response;
      },
      (error: AxiosError) => {
        if (!error.response && error.code === 'ECONNABORTED') {
          this.isOnline = false;
        }
        return Promise.reject(error);
      }
    );
  }

  getClient(): AxiosInstance {
    return this.client;
  }

  getIsOnline(): boolean {
    return this.isOnline;
  }

  setOnlineStatus(status: boolean): void {
    this.isOnline = status;
  }
}

export const apiClient = new ApiClient();
export default apiClient.getClient();
