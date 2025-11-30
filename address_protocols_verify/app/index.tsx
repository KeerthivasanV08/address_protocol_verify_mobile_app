import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Button } from '@/src/components/Button';
import { useUser } from '@/src/context/UserContext';
import { LoadingSpinner } from '@/src/components/LoadingSpinner';

export default function WelcomeScreen() {
  const router = useRouter();
  const { isLoading, userId } = useUser();

  useEffect(() => {
    if (!isLoading && userId) {
      const timer = setTimeout(() => {
        router.replace('/(tabs)');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isLoading, userId]);

  if (isLoading) {
    return <LoadingSpinner message="Initializing AAVA..." />;
  }

  return (
    <LinearGradient
      colors={['#007AFF', '#5856D6']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>AAVA</Text>
          </View>
          <Text style={styles.subtitle}>Address Intelligence Agent</Text>
        </View>

        <View style={styles.features}>
          <Text style={styles.featureText}>
            Address Validation Protocol
          </Text>
          <Text style={styles.featureText}>DIGIPIN Generation</Text>
          <Text style={styles.featureText}>Smart Consent Management</Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.version}>v1.0.0</Text>
          <Text style={styles.demoMode}>Demo Mode Active</Text>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 20,
  },
  logoContainer: {
    alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  logoText: {
    fontSize: 42,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '500',
    opacity: 0.9,
  },
  features: {
    alignItems: 'center',
  },
  featureText: {
    fontSize: 16,
    color: '#FFFFFF',
    marginVertical: 6,
    opacity: 0.85,
  },
  footer: {
    alignItems: 'center',
  },
  version: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.7,
    marginBottom: 8,
  },
  demoMode: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.6,
    fontWeight: '500',
  },
});
