declare global {
  namespace NodeJS {
    interface ProcessEnv {
      EXPO_PUBLIC_API_BASE_URL: string;
      EXPO_PUBLIC_DEMO_MODE: string;
      EXPO_PUBLIC_SUPABASE_URL: string;
      EXPO_PUBLIC_SUPABASE_ANON_KEY: string;
      EXPO_PUBLIC_DEMO_USER_ID: string;
      GOOGLE_MAPS_API_KEY?: string;
    }
  }
}

export {};
