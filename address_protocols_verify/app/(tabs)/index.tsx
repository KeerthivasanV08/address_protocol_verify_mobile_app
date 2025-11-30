import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MapPin, CheckCircle, History, User } from 'lucide-react-native';
import { Card } from '@/src/components/Card';
import { useUser } from '@/src/context/UserContext';
import Constants from 'expo-constants';

export default function HomeScreen() {
  const router = useRouter();
  const { userId, displayName } = useUser();

  const isDemoMode =
    process.env.EXPO_PUBLIC_DEMO_MODE === 'true' ||
    Constants.expoConfig?.extra?.demoMode === true;

  const features = [
    {
      title: 'Generate DIGIPIN',
      description:
        'Create a unique digital address identifier for any location',
      icon: MapPin,
      color: '#007AFF',
      route: '/generate-digipin',
    },
    {
      title: 'Validate Address',
      description:
        'Verify address accuracy with high confidence scoring',
      icon: CheckCircle,
      color: '#34C759',
      route: '/validate',
    },
    {
      title: 'View History',
      description: 'Access your validation history and audit logs',
      icon: History,
      color: '#5856D6',
      route: '/history',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
      >
        <View style={styles.header}>
          <Text style={styles.title}>AAVA</Text>
          <Text style={styles.subtitle}>Address Intelligence Agent</Text>
        </View>

        {isDemoMode && (
          <Card style={styles.demoCard}>
            <Text style={styles.demoTitle}>Demo Mode Active</Text>
            <Text style={styles.demoText}>
              Using offline validation. Connect to AAVA backend for live
              validation.
            </Text>
          </Card>
        )}

        <Card style={styles.userCard}>
          <View style={styles.userInfo}>
            <View style={styles.userIcon}>
              <User size={24} color="#007AFF" />
            </View>
            <View>
              <Text style={styles.userName}>
                {displayName || 'Demo User'}
              </Text>
              <Text style={styles.userId}>ID: {userId}</Text>
            </View>
          </View>
        </Card>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Features</Text>
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <TouchableOpacity
                key={index}
                onPress={() => router.push(feature.route as any)}
                activeOpacity={0.7}
              >
                <Card style={styles.featureCard}>
                  <View
                    style={[
                      styles.featureIcon,
                      { backgroundColor: `${feature.color}20` },
                    ]}
                  >
                    <IconComponent size={28} color={feature.color} />
                  </View>
                  <View style={styles.featureContent}>
                    <Text style={styles.featureTitle}>{feature.title}</Text>
                    <Text style={styles.featureDescription}>
                      {feature.description}
                    </Text>
                  </View>
                </Card>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>About AAVA</Text>
          <Text style={styles.infoText}>
            The Address Validation Protocol uses advanced geocoding and
            DIGIPIN technology to ensure accurate address verification with
            confidence scoring and audit trails.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: '#007AFF',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  demoCard: {
    backgroundColor: '#FFF3CD',
    borderLeftWidth: 4,
    borderLeftColor: '#FFC107',
    marginBottom: 16,
  },
  demoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#856404',
    marginBottom: 4,
  },
  demoText: {
    fontSize: 14,
    color: '#856404',
  },
  userCard: {
    marginBottom: 24,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  userId: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    padding: 16,
  },
  featureIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#666',
  },
  infoSection: {
    marginBottom: 24,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});
