import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  History as HistoryIcon,
  CheckCircle,
  XCircle,
  Download,
} from 'lucide-react-native';
import { Card } from '@/src/components/Card';
import { Button } from '@/src/components/Button';
import { LoadingSpinner } from '@/src/components/LoadingSpinner';
import { auditLogger } from '@/src/utils/auditLogger';
import supabase from '@/src/utils/supabase';
import { useUser } from '@/src/context/UserContext';

interface ValidationRecord {
  id: string;
  request_id: string;
  digipin: string;
  is_valid: boolean;
  confidence_score: number;
  normalized_address: string;
  created_at: string;
  latitude: number;
  longitude: number;
}

export default function HistoryScreen() {
  const router = useRouter();
  const { userId } = useUser();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [history, setHistory] = useState<ValidationRecord[]>([]);
  const [exportingLogs, setExportingLogs] = useState(false);

  const loadHistory = async () => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from('validation_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setHistory(data || []);
    } catch (error) {
      console.error('Failed to load history:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [userId]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadHistory();
  };

  const handleExportLogs = async () => {
    if (!userId) return;

    setExportingLogs(true);
    try {
      await auditLogger.exportLogs(userId);
      if (Platform.OS !== 'web') {
        Alert.alert('Success', 'Audit logs exported successfully');
      }
    } catch (error) {
      if (Platform.OS !== 'web') {
        Alert.alert('Error', 'Failed to export logs');
      }
    } finally {
      setExportingLogs(false);
    }
  };

  const handleViewDetails = (record: ValidationRecord) => {
    const validationData = {
      requestId: record.request_id,
      isValid: record.is_valid,
      confidenceScore: record.confidence_score,
      digipin: record.digipin,
      normalizedAddress: record.normalized_address,
      validationDetails: {
        checks: [],
        timestamp: record.created_at,
        processingTimeMs: 0,
      },
    };

    router.push({
      pathname: '/validation-result',
      params: { data: JSON.stringify(validationData) },
    });
  };

  if (loading) {
    return <LoadingSpinner message="Loading history..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTitle}>
          <HistoryIcon size={32} color="#5856D6" />
          <Text style={styles.title}>History</Text>
        </View>
        <TouchableOpacity
          onPress={handleExportLogs}
          disabled={exportingLogs}
          style={styles.exportButton}
        >
          <Download size={20} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {history.length === 0 ? (
          <Card style={styles.emptyCard}>
            <HistoryIcon size={48} color="#CCC" />
            <Text style={styles.emptyTitle}>No Validation History</Text>
            <Text style={styles.emptyText}>
              Your address validation records will appear here
            </Text>
            <Button
              title="Validate Address"
              onPress={() => router.push('/validate')}
              variant="primary"
              style={styles.button}
            />
          </Card>
        ) : (
          <>
            <Text style={styles.statsText}>
              {history.length} validation{history.length !== 1 ? 's' : ''}
            </Text>

            {history.map((record) => (
              <TouchableOpacity
                key={record.id}
                onPress={() => handleViewDetails(record)}
                activeOpacity={0.7}
              >
                <Card style={styles.recordCard}>
                  <View style={styles.recordHeader}>
                    <View style={styles.recordStatus}>
                      {record.is_valid ? (
                        <CheckCircle size={20} color="#34C759" />
                      ) : (
                        <XCircle size={20} color="#FF3B30" />
                      )}
                      <Text
                        style={[
                          styles.validStatus,
                          record.is_valid
                            ? styles.validText
                            : styles.invalidText,
                        ]}
                      >
                        {record.is_valid ? 'Valid' : 'Invalid'}
                      </Text>
                    </View>
                    <Text style={styles.confidenceScore}>
                      {(record.confidence_score * 100).toFixed(0)}%
                    </Text>
                  </View>

                  <Text style={styles.address} numberOfLines={2}>
                    {record.normalized_address || 'Address not available'}
                  </Text>

                  <View style={styles.recordDetails}>
                    <Text style={styles.detailLabel}>DIGIPIN:</Text>
                    <Text style={styles.detailValue}>{record.digipin}</Text>
                  </View>

                  <View style={styles.recordDetails}>
                    <Text style={styles.detailLabel}>Date:</Text>
                    <Text style={styles.detailValue}>
                      {new Date(record.created_at).toLocaleString()}
                    </Text>
                  </View>

                  <Text style={styles.tapHint}>Tap for details</Text>
                </Card>
              </TouchableOpacity>
            ))}
          </>
        )}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
    marginLeft: 12,
  },
  exportButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingTop: 0,
  },
  statsText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    fontWeight: '500',
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  button: {
    marginTop: 8,
  },
  recordCard: {
    marginBottom: 12,
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  recordStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  validStatus: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  validText: {
    color: '#34C759',
  },
  invalidText: {
    color: '#FF3B30',
  },
  confidenceScore: {
    fontSize: 18,
    fontWeight: '700',
    color: '#007AFF',
  },
  address: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
    marginBottom: 12,
  },
  recordDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  detailLabel: {
    fontSize: 13,
    color: '#666',
  },
  detailValue: {
    fontSize: 13,
    color: '#333',
    fontWeight: '500',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  tapHint: {
    fontSize: 11,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
