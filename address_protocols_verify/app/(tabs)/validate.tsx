import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { CheckCircle, Shield, AlertCircle } from 'lucide-react-native';
import { Card } from '@/src/components/Card';
import { Button } from '@/src/components/Button';
import { Input } from '@/src/components/Input';
import { Modal } from '@/src/components/Modal';
import { MapView } from '@/src/components/MapView';
import { aavaService } from '@/src/api/aavaService';
import { auditLogger } from '@/src/utils/auditLogger';
import { fuzzyMatcher } from '@/src/utils/fuzzyMatch';
import supabase from '@/src/utils/supabase';
import { useUser } from '@/src/context/UserContext';
import type { Coordinates, AddressParts, ValidationResponse } from '@/types/api';

export default function ValidateScreen() {
  const router = useRouter();
  const { userId, consentId, setConsentId } = useUser();

  const [loading, setLoading] = useState(false);
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [hasConsent, setHasConsent] = useState(!!consentId);

  const [addressParts, setAddressParts] = useState<AddressParts>({
    houseNo: '',
    street: '',
    area: '',
    district: '',
    pincode: '',
  });

  const [coordinate, setCoordinate] = useState<Coordinates | null>(null);
  const [useCurrentLocation, setUseCurrentLocation] = useState(true);
  const [latInput, setLatInput] = useState('');
  const [lonInput, setLonInput] = useState('');
  const [error, setError] = useState('');
  const [predictedAddress, setPredictedAddress] = useState('');

  const handleAddressChange = (field: keyof AddressParts, value: string) => {
    const updated = { ...addressParts, [field]: value };
    setAddressParts(updated);

    const predicted = fuzzyMatcher.predictNormalizedAddress(updated);
    setPredictedAddress(predicted);
  };

  const handleGetCurrentLocation = async () => {
    setLoading(true);
    setError('');
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Location permission denied');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setCoordinate({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
      setLatInput(location.coords.latitude.toString());
      setLonInput(location.coords.longitude.toString());
    } catch (err: any) {
      setError(err.message || 'Failed to get location');
    } finally {
      setLoading(false);
    }
  };

  const handleManualLocation = () => {
    const lat = parseFloat(latInput);
    const lon = parseFloat(lonInput);

    if (isNaN(lat) || isNaN(lon)) {
      setError('Please enter valid coordinates');
      return;
    }

    setCoordinate({ latitude: lat, longitude: lon });
    setError('');
  };

  const handleRequestConsent = async () => {
    if (!userId) {
      setError('User ID not found');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await aavaService.requestConsent(userId);
      await setConsentId(response.consentId);
      setHasConsent(true);
      setShowConsentModal(false);

      await supabase.from('consents').insert({
        consent_id: response.consentId,
        user_id: userId,
        action: 'address_validation',
        status: response.status,
        granted_at: response.timestamp,
        expires_at: response.expiresAt || null,
      });

      if (Platform.OS !== 'web') {
        Alert.alert('Success', 'Consent granted successfully');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to request consent');
    } finally {
      setLoading(false);
    }
  };

  const handleValidate = async () => {
    if (!userId || !consentId) {
      setShowConsentModal(true);
      return;
    }

    if (!coordinate) {
      if (useCurrentLocation) {
        await handleGetCurrentLocation();
        return;
      } else {
        setError('Please provide location coordinates');
        return;
      }
    }

    const hasMinimumAddress =
      addressParts.street || addressParts.area || addressParts.district;
    if (!hasMinimumAddress) {
      setError('Please provide at least street, area, or district');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const validationPayload = {
        userId,
        consentId,
        addressParts,
        latitude: coordinate.latitude,
        longitude: coordinate.longitude,
      };

      const response = await aavaService.validateAddress(validationPayload);

      await supabase.from('validation_history').insert({
        request_id: response.requestId,
        user_id: userId,
        consent_id: consentId,
        address_parts: addressParts,
        latitude: coordinate.latitude,
        longitude: coordinate.longitude,
        digipin: response.digipin,
        is_valid: response.isValid,
        confidence_score: response.confidenceScore,
        normalized_address: response.normalizedAddress,
        validation_checks: response.validationDetails.checks,
        processing_time_ms: response.validationDetails.processingTimeMs,
      });

      await auditLogger.logAction(userId, 'validate_address', {
        requestId: response.requestId,
        digipin: response.digipin,
        coordinates: coordinate,
        result: response,
      });

      router.push({
        pathname: '/validation-result',
        params: { data: JSON.stringify(response) },
      });
    } catch (err: any) {
      setError(err.message || 'Validation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
      >
        <View style={styles.header}>
          <CheckCircle size={32} color="#34C759" />
          <Text style={styles.title}>Validate Address</Text>
        </View>

        <Card style={styles.consentCard}>
          <View style={styles.consentHeader}>
            <Shield size={24} color={hasConsent ? '#34C759' : '#FF9500'} />
            <Text style={styles.consentTitle}>Consent Status</Text>
          </View>
          <Text style={styles.consentStatus}>
            {hasConsent ? 'Consent Granted' : 'Consent Required'}
          </Text>
          {!hasConsent && (
            <Button
              title="Request Consent"
              onPress={() => setShowConsentModal(true)}
              variant="primary"
              style={styles.button}
            />
          )}
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Address Details</Text>

          <Input
            label="House/Building No."
            value={addressParts.houseNo}
            onChangeText={(v) => handleAddressChange('houseNo', v)}
            placeholder="123"
          />

          <Input
            label="Street"
            value={addressParts.street}
            onChangeText={(v) => handleAddressChange('street', v)}
            placeholder="Main Street"
          />

          <Input
            label="Area/Locality"
            value={addressParts.area}
            onChangeText={(v) => handleAddressChange('area', v)}
            placeholder="Sector 15"
          />

          <Input
            label="District/City"
            value={addressParts.district}
            onChangeText={(v) => handleAddressChange('district', v)}
            placeholder="New Delhi"
          />

          <Input
            label="Pincode"
            value={addressParts.pincode}
            onChangeText={(v) => handleAddressChange('pincode', v)}
            placeholder="110001"
            keyboardType="numeric"
          />

          {predictedAddress && (
            <View style={styles.predictionBox}>
              <Text style={styles.predictionLabel}>Predicted Address:</Text>
              <Text style={styles.predictionText}>{predictedAddress}</Text>
            </View>
          )}
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Location</Text>

          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Use Current Location</Text>
            <Switch
              value={useCurrentLocation}
              onValueChange={setUseCurrentLocation}
              trackColor={{ false: '#E5E5E5', true: '#34C759' }}
            />
          </View>

          {useCurrentLocation ? (
            <Button
              title="Get Current Location"
              onPress={handleGetCurrentLocation}
              loading={loading}
              variant="secondary"
              style={styles.button}
            />
          ) : (
            <>
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
                onPress={handleManualLocation}
                variant="outline"
                style={styles.button}
              />
            </>
          )}

          {coordinate && (
            <View style={styles.mapContainer}>
              <MapView
                markerCoordinate={coordinate}
                height={250}
                initialRegion={{
                  latitude: coordinate.latitude,
                  longitude: coordinate.longitude,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                }}
              />
            </View>
          )}
        </Card>

        {error && (
          <Card style={styles.errorCard}>
            <AlertCircle size={20} color="#FF3B30" />
            <Text style={styles.errorText}>{error}</Text>
          </Card>
        )}

        <Button
          title="Validate Address"
          onPress={handleValidate}
          loading={loading}
          disabled={!hasConsent}
          size="large"
          style={styles.validateButton}
        />
      </ScrollView>

      <Modal
        visible={showConsentModal}
        onClose={() => setShowConsentModal(false)}
        title="Consent Required"
      >
        <View style={styles.modalContent}>
          <Shield size={48} color="#007AFF" />
          <Text style={styles.modalTitle}>
            Address Validation Consent
          </Text>
          <Text style={styles.modalText}>
            We need your consent to validate your address. This will allow us
            to:
          </Text>
          <View style={styles.consentList}>
            <Text style={styles.consentItem}>
              Access your location data
            </Text>
            <Text style={styles.consentItem}>
              Process your address information
            </Text>
            <Text style={styles.consentItem}>
              Generate validation reports
            </Text>
            <Text style={styles.consentItem}>
              Store validation history
            </Text>
          </View>
          <Text style={styles.modalFooter}>
            Your data is encrypted and secure. Consent valid for 24 hours.
          </Text>
          <Button
            title="Grant Consent"
            onPress={handleRequestConsent}
            loading={loading}
            size="large"
            style={styles.modalButton}
          />
        </View>
      </Modal>
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
  consentCard: {
    backgroundColor: '#FFF3E0',
    borderLeftWidth: 4,
    borderLeftColor: '#FF9500',
  },
  consentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  consentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  consentStatus: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  predictionBox: {
    backgroundColor: '#E3F2FD',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  predictionLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    fontWeight: '500',
  },
  predictionText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  switchLabel: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  mapContainer: {
    marginTop: 16,
  },
  errorCard: {
    backgroundColor: '#FFEBEE',
    borderLeftWidth: 4,
    borderLeftColor: '#FF3B30',
    flexDirection: 'row',
    alignItems: 'center',
  },
  errorText: {
    color: '#C62828',
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  validateButton: {
    marginTop: 20,
    marginBottom: 20,
  },
  modalContent: {
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginTop: 16,
    marginBottom: 12,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  consentList: {
    alignSelf: 'stretch',
    marginBottom: 16,
  },
  consentItem: {
    fontSize: 14,
    color: '#333',
    marginVertical: 4,
    paddingLeft: 16,
  },
  modalFooter: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginBottom: 16,
    fontStyle: 'italic',
  },
  modalButton: {
    width: '100%',
  },
});
