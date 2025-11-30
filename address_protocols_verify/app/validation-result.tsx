import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Clipboard,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  CheckCircle,
  XCircle,
  Copy,
  ArrowLeft,
  AlertTriangle,
} from 'lucide-react-native';
import { Card } from '@/src/components/Card';
import { Button } from '@/src/components/Button';
import type { ValidationResponse } from '@/types/api';

export default function ValidationResultScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  let validationData: ValidationResponse | null = null;
  try {
    if (typeof params.data === 'string') {
      validationData = JSON.parse(params.data);
    }
  } catch (error) {
    console.error('Failed to parse validation data:', error);
  }

  if (!validationData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <AlertTriangle size={48} color="#FF3B30" />
          <Text style={styles.errorTitle}>No Data Available</Text>
          <Button
            title="Go Back"
            onPress={() => router.back()}
            variant="primary"
          />
        </View>
      </SafeAreaView>
    );
  }

  const handleCopy = (text: string, label: string) => {
    Clipboard.setString(text);
    if (Platform.OS !== 'web') {
      Alert.alert('Copied', `${label} copied to clipboard`);
    }
  };

  const confidencePercent = (validationData.confidenceScore * 100).toFixed(0);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ArrowLeft size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Validation Result</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
      >
        <Card
          style={[
            styles.statusCard,
            validationData.isValid
              ? styles.statusCardValid
              : styles.statusCardInvalid,
          ]}
        >
          <View style={styles.statusIcon}>
            {validationData.isValid ? (
              <CheckCircle size={64} color="#34C759" />
            ) : (
              <XCircle size={64} color="#FF3B30" />
            )}
          </View>

          <Text style={styles.statusTitle}>
            {validationData.isValid ? 'Address Valid' : 'Address Invalid'}
          </Text>

          <View style={styles.confidenceContainer}>
            <Text style={styles.confidenceLabel}>Confidence Score</Text>
            <Text
              style={[
                styles.confidenceValue,
                {
                  color:
                    validationData.confidenceScore >= 0.8
                      ? '#34C759'
                      : validationData.confidenceScore >= 0.5
                      ? '#FF9500'
                      : '#FF3B30',
                },
              ]}
            >
              {confidencePercent}%
            </Text>
          </View>
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>DIGIPIN</Text>
          <View style={styles.digipinRow}>
            <Text style={styles.digipinText}>{validationData.digipin}</Text>
            <TouchableOpacity
              onPress={() => handleCopy(validationData.digipin, 'DIGIPIN')}
              style={styles.copyIcon}
            >
              <Copy size={20} color="#007AFF" />
            </TouchableOpacity>
          </View>
        </Card>

        {validationData.normalizedAddress && (
          <Card>
            <Text style={styles.sectionTitle}>Normalized Address</Text>
            <Text style={styles.addressText}>
              {validationData.normalizedAddress}
            </Text>
          </Card>
        )}

        <Card>
          <Text style={styles.sectionTitle}>Validation Checks</Text>
          {validationData.validationDetails.checks.map((check, index) => (
            <View key={index} style={styles.checkRow}>
              <View style={styles.checkIcon}>
                {check.passed ? (
                  <CheckCircle size={20} color="#34C759" />
                ) : (
                  <XCircle size={20} color="#FF3B30" />
                )}
              </View>
              <View style={styles.checkContent}>
                <Text style={styles.checkName}>
                  {check.check_name.replace(/_/g, ' ').toUpperCase()}
                </Text>
                {check.details && (
                  <Text style={styles.checkDetails}>{check.details}</Text>
                )}
                <Text style={styles.checkConfidence}>
                  Confidence: {(check.confidence * 100).toFixed(0)}%
                </Text>
              </View>
            </View>
          ))}
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Request Details</Text>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Request ID</Text>
            <View style={styles.detailValueRow}>
              <Text style={styles.detailValue} numberOfLines={1}>
                {validationData.requestId}
              </Text>
              <TouchableOpacity
                onPress={() =>
                  handleCopy(validationData.requestId, 'Request ID')
                }
              >
                <Copy size={16} color="#007AFF" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Timestamp</Text>
            <Text style={styles.detailValue}>
              {new Date(
                validationData.validationDetails.timestamp
              ).toLocaleString()}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Processing Time</Text>
            <Text style={styles.detailValue}>
              {validationData.validationDetails.processingTimeMs.toFixed(0)}ms
            </Text>
          </View>
        </Card>

        <Button
          title="Validate Another Address"
          onPress={() => router.push('/validate')}
          variant="primary"
          size="large"
          style={styles.actionButton}
        />

        <Button
          title="Back to Home"
          onPress={() => router.push('/(tabs)')}
          variant="outline"
          size="large"
          style={styles.actionButton}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  placeholder: {
    width: 32,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  statusCard: {
    alignItems: 'center',
    paddingVertical: 32,
    borderLeftWidth: 4,
  },
  statusCardValid: {
    backgroundColor: '#E8F5E9',
    borderLeftColor: '#34C759',
  },
  statusCardInvalid: {
    backgroundColor: '#FFEBEE',
    borderLeftColor: '#FF3B30',
  },
  statusIcon: {
    marginBottom: 16,
  },
  statusTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 24,
  },
  confidenceContainer: {
    alignItems: 'center',
  },
  confidenceLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  confidenceValue: {
    fontSize: 48,
    fontWeight: '800',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  digipinRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 8,
  },
  digipinText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#007AFF',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    flex: 1,
  },
  copyIcon: {
    padding: 4,
  },
  addressText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  checkRow: {
    flexDirection: 'row',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  checkIcon: {
    marginRight: 12,
  },
  checkContent: {
    flex: 1,
  },
  checkName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  checkDetails: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  checkConfidence: {
    fontSize: 12,
    color: '#999',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
    flex: 1,
  },
  detailValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 2,
    justifyContent: 'flex-end',
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
    textAlign: 'right',
    marginRight: 8,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  actionButton: {
    marginTop: 12,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 24,
  },
});
