import type {
  DigipinResponse,
  ConsentResponse,
  ValidationRequest,
  ValidationResponse,
  ValidationStatusResponse,
  OfflineAddress,
} from '@/types/api';

const generateRandomId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

const calculateDigipin = (lat: number, lon: number): string => {
  const latCell = Math.floor((lat + 90) * 10000);
  const lonCell = Math.floor((lon + 180) * 10000);
  return `DP${latCell.toString(16).toUpperCase()}${lonCell.toString(16).toUpperCase()}`;
};

const calculateGridBoundaries = (lat: number, lon: number) => {
  const gridSize = 0.000036;
  return {
    lat_min: lat - gridSize / 2,
    lat_max: lat + gridSize / 2,
    lon_min: lon - gridSize / 2,
    lon_max: lon + gridSize / 2,
  };
};

export const offlineAddresses: OfflineAddress[] = [
  {
    id: '1',
    displayName: 'Connaught Place, New Delhi',
    addressParts: {
      houseNo: 'Block A',
      street: 'Inner Circle',
      area: 'Connaught Place',
      district: 'New Delhi',
      pincode: '110001',
    },
    coordinates: { latitude: 28.6315, longitude: 77.2167 },
    digipin: 'DP786A8A4C31E2',
  },
  {
    id: '2',
    displayName: 'India Gate, New Delhi',
    addressParts: {
      street: 'Rajpath',
      area: 'India Gate',
      district: 'New Delhi',
      pincode: '110001',
    },
    coordinates: { latitude: 28.6129, longitude: 77.2295 },
    digipin: 'DP786A8A4C31F0',
  },
  {
    id: '3',
    displayName: 'Gateway of India, Mumbai',
    addressParts: {
      street: 'Apollo Bandar',
      area: 'Colaba',
      district: 'Mumbai',
      pincode: '400001',
    },
    coordinates: { latitude: 18.922, longitude: 72.8347 },
    digipin: 'DP786A504C2890',
  },
];

export const demoService = {
  generateDigipin(latitude: number, longitude: number): DigipinResponse {
    const digipin = calculateDigipin(latitude, longitude);
    const gridBoundaries = calculateGridBoundaries(latitude, longitude);

    return {
      digipin,
      latitude,
      longitude,
      grid_boundaries: gridBoundaries,
      precision_meters: 4,
      timestamp: new Date().toISOString(),
    };
  },

  requestConsent(userId: string, action: string): ConsentResponse {
    const consentId = `consent-${generateRandomId()}`;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    return {
      consentId,
      userId,
      action,
      timestamp: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      status: 'granted',
    };
  },

  validateAddress(payload: ValidationRequest): ValidationResponse {
    const requestId = `req-${generateRandomId()}`;
    const digipin =
      payload.digipin ||
      calculateDigipin(payload.latitude, payload.longitude);

    const addressStr = Object.values(payload.addressParts)
      .filter(Boolean)
      .join(', ');

    const checks = [
      {
        check_name: 'coordinate_validity',
        passed: true,
        confidence: 1.0,
        details: 'Coordinates are within valid range',
      },
      {
        check_name: 'digipin_match',
        passed: true,
        confidence: 0.95,
        details: 'DIGIPIN matches coordinate grid',
      },
      {
        check_name: 'address_completeness',
        passed: Object.keys(payload.addressParts).length >= 3,
        confidence: 0.85,
        details: 'Address has sufficient components',
      },
      {
        check_name: 'geocoding_reverse_match',
        passed: true,
        confidence: 0.88,
        details: 'Reverse geocoding confirms location',
      },
    ];

    const avgConfidence =
      checks.reduce((sum, check) => sum + check.confidence, 0) / checks.length;
    const allPassed = checks.every((check) => check.passed);

    return {
      requestId,
      isValid: allPassed,
      confidenceScore: Math.round(avgConfidence * 100) / 100,
      digipin,
      normalizedAddress: addressStr || 'Demo Location',
      validationDetails: {
        checks,
        timestamp: new Date().toISOString(),
        processingTimeMs: Math.random() * 500 + 200,
      },
      auditLog: {
        requestId,
        userId: payload.userId,
        timestamp: new Date().toISOString(),
        ipAddress: '192.168.1.1',
      },
    };
  },

  getValidationStatus(requestId: string): ValidationStatusResponse {
    return {
      requestId,
      status: 'completed',
      result: {
        requestId,
        isValid: true,
        confidenceScore: 0.92,
        digipin: 'DP786A8A4C31E2',
        normalizedAddress: 'Demo Address',
        validationDetails: {
          checks: [],
          timestamp: new Date().toISOString(),
          processingTimeMs: 350,
        },
      },
      timestamp: new Date().toISOString(),
    };
  },
};

export default demoService;
