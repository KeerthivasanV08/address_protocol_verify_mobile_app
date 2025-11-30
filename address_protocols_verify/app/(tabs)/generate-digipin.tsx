import React, { useState } from 'react';
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
import * as Location from 'expo-location';
import { MapPin, Copy, Loader } from 'lucide-react-native';
import { Card } from '@/src/components/Card';
import { Button } from '@/src/components/Button';
import { Input } from '@/src/components/Input';
import { MapView } from '@/src/components/MapView';
import { aavaService } from '@/src/api/aavaService';
import { auditLogger } from '@/src/utils/auditLogger';
import { useUser } from '@/src/context/UserContext';
import type { DigipinResponse, Coordinates } from '@/types/api';

export default function GenerateDigipinScreen() {
  const { userId } = useUser();
  const [loading, setLoading] = useState(false);
  const [coordinate, setCoordinate] = useState<Coordinates | null>(null);
  const [latInput, setLatInput] = useState('');
  const [lonInput, setLonInput] = useState('');
  const [digipinData, setDigipinData] = useState<DigipinResponse | null>(null);
  const [error, setError] = useState('');

  const handleUseCurrentLocation = async () => {
    setLoading(true);
    setError('');
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Location permission denied');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const coords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
      setCoordinate(coords);
      setLatInput(coords.latitude.toString());
      setLonInput(coords.longitude.toString());
    } catch (err: any) {
      setError(err.message || 'Failed to get location');
    } finally {
      setLoading(false);
    }
  };

  const handleManualInput = () => {
    const lat = parseFloat(latInput);
    const lon = parseFloat(lonInput);

    if (isNaN(lat) || isNaN(lon)) {
      setError('Please enter valid coordinates');
      return;
    }

    if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      setError('Coordinates out of valid range');
      return;
    }

    setCoordinate({ latitude: lat, longitude: lon });
    setError('');
  };

  const handleGenerateDigipin = async () => {
    if (!coordinate) {
      setError('Please select a location');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await aavaService.generateDigipin(
        coordinate.latitude,
        coordinate.longitude
      );
      setDigipinData(response);

      if (userId) {
        await auditLogger.logAction(userId, 'generate_digipin', {
          digipin: response.digipin,
          coordinates: coordinate,
          result: response,
        });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to generate DIGIPIN');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyDigipin = () => {
    if (digipinData) {
      Clipboard.setString(digipinData.digipin);
      if (Platform.OS !== 'web') {
        Alert.alert('Success', 'DIGIPIN copied to clipboard');
      }
    }
  };

  const handleMapPress = (coords: Coordinates) => {
    setCoordinate(coords);
    setLatInput(coords.latitude.toString());
    setLonInput(coords.longitude.toString());
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
      >
        <View style={styles.header}>
          <MapPin size={32} color="#007AFF" />
          <Text style={styles.title}>Generate DIGIPIN</Text>
        </View>

        <Card>
          <Text style={styles.sectionTitle}>Select Location</Text>
          <Button
            title="Use Current Location"
            onPress={handleUseCurrentLocation}
            loading={loading}
            variant="secondary"
            style={styles.button}
          />

          <Text style={styles.orText}>OR</Text>

          <Input
            label="Latitude"
            value={latInput}
            onChangeText={setLatInput}
            placeholder="28.6139"
            keyboardType="decimal-pad"
          />

          <Input
            label="Longitude"
            value={lonInput}
            onChangeText={setLonInput}
            placeholder="77.2090"
            keyboardType="decimal-pad"
          />

          <Button
            title="Set Location"
            onPress={handleManualInput}
            variant="outline"
            style={styles.button}
          />
        </Card>

        {coordinate && (
          <Card>
            <Text style={styles.sectionTitle}>Map View</Text>
            <MapView
              markerCoordinate={coordinate}
              onLongPress={handleMapPress}
              onMarkerDragEnd={handleMapPress}
              gridBoundaries={digipinData?.grid_boundaries}
              showGrid={!!digipinData}
              height={300}
              initialRegion={{
                latitude: coordinate.latitude,
                longitude: coordinate.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
            />
            <Text style={styles.mapHint}>
              Long press or drag marker to change location
            </Text>
          </Card>
        )}

        {error && (
          <Card style={styles.errorCard}>
            <Text style={styles.errorText}>{error}</Text>
          </Card>
        )}

        {coordinate && !digipinData && (
          <Button
            title="Generate DIGIPIN"
            onPress={handleGenerateDigipin}
            loading={loading}
            size="large"
            style={styles.generateButton}
          />
        )}

        {digipinData && (
          <Card style={styles.resultCard}>
            <Text style={styles.resultTitle}>DIGIPIN Generated</Text>

            <View style={styles.digipinContainer}>
              <Text style={styles.digipin}>{digipinData.digipin}</Text>
              <TouchableOpacity
                onPress={handleCopyDigipin}
                style={styles.copyButton}
              >
                <Copy size={20} color="#007AFF" />
              </TouchableOpacity>
            </View>

            <View style={styles.detailsGrid}>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Precision</Text>
                <Text style={styles.detailValue}>
                  {digipinData.precision_meters}m x{' '}
                  {digipinData.precision_meters}m
                </Text>
              </View>

              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Latitude</Text>
                <Text style={styles.detailValue}>
                  {digipinData.latitude.toFixed(6)}
                </Text>
              </View>

              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Longitude</Text>
                <Text style={styles.detailValue}>
                  {digipinData.longitude.toFixed(6)}
                </Text>
              </View>

              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Timestamp</Text>
                <Text style={styles.detailValue}>
                  {new Date(digipinData.timestamp).toLocaleString()}
                </Text>
              </View>
            </View>

            <Button
              title="Generate Another"
              onPress={() => setDigipinData(null)}
              variant="outline"
              style={styles.button}
            />
          </Card>
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
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
    marginLeft: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  button: {
    marginTop: 12,
  },
  orText: {
    textAlign: 'center',
    color: '#999',
    marginVertical: 16,
    fontSize: 14,
    fontWeight: '500',
  },
  mapHint: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  errorCard: {
    backgroundColor: '#FFEBEE',
    borderLeftWidth: 4,
    borderLeftColor: '#FF3B30',
  },
  errorText: {
    color: '#C62828',
    fontSize: 14,
  },
  generateButton: {
    marginTop: 20,
  },
  resultCard: {
    backgroundColor: '#E8F5E9',
    borderLeftWidth: 4,
    borderLeftColor: '#34C759',
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2E7D32',
    marginBottom: 16,
  },
  digipinContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  digipin: {
    fontSize: 20,
    fontWeight: '700',
    color: '#007AFF',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    flex: 1,
  },
  copyButton: {
    padding: 8,
  },
  detailsGrid: {
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#C8E6C9',
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
});
