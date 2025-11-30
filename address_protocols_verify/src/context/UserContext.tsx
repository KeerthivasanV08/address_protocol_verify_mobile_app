import React, { createContext, useContext, useState, useEffect } from 'react';
import Constants from 'expo-constants';
import { secureStorage } from '@/src/utils/storage';
import supabase from '@/src/utils/supabase';

interface UserContextType {
  userId: string | null;
  displayName: string | null;
  consentId: string | null;
  isLoading: boolean;
  setUserId: (id: string) => Promise<void>;
  setDisplayName: (name: string) => Promise<void>;
  setConsentId: (id: string) => Promise<void>;
  clearUser: () => Promise<void>;
  initializeUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [userId, setUserIdState] = useState<string | null>(null);
  const [displayName, setDisplayNameState] = useState<string | null>(null);
  const [consentId, setConsentIdState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const setUserId = async (id: string) => {
    await secureStorage.setUserId(id);
    setUserIdState(id);

    const { error } = await supabase.from('user_profiles').upsert(
      {
        user_id: id,
        display_name: displayName || 'User',
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    );

    if (error) {
      console.error('Failed to sync user profile:', error);
    }
  };

  const setDisplayName = async (name: string) => {
    await secureStorage.setDisplayName(name);
    setDisplayNameState(name);

    if (userId) {
      await supabase
        .from('user_profiles')
        .update({ display_name: name, updated_at: new Date().toISOString() })
        .eq('user_id', userId);
    }
  };

  const setConsentId = async (id: string) => {
    await secureStorage.setConsentId(id);
    setConsentIdState(id);
  };

  const clearUser = async () => {
    await secureStorage.clearAll();
    setUserIdState(null);
    setDisplayNameState(null);
    setConsentIdState(null);
  };

  const initializeUser = async () => {
    setIsLoading(true);
    try {
      const storedUserId = await secureStorage.getUserId();
      const storedDisplayName = await secureStorage.getDisplayName();
      const storedConsentId = await secureStorage.getConsentId();

      if (storedUserId) {
        setUserIdState(storedUserId);
      } else {
        const demoUserId =
          process.env.EXPO_PUBLIC_DEMO_USER_ID ||
          Constants.expoConfig?.extra?.demoUserId ||
          'demo-user-001';
        await setUserId(demoUserId);
      }

      if (storedDisplayName) {
        setDisplayNameState(storedDisplayName);
      }

      if (storedConsentId) {
        setConsentIdState(storedConsentId);
      }
    } catch (error) {
      console.error('Failed to initialize user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    initializeUser();
  }, []);

  return (
    <UserContext.Provider
      value={{
        userId,
        displayName,
        consentId,
        isLoading,
        setUserId,
        setDisplayName,
        setConsentId,
        clearUser,
        initializeUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export default UserContext;
