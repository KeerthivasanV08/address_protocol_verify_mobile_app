export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface DigipinResponse {
  digipin: string;
  latitude: number;
  longitude: number;
  grid_boundaries: {
    lat_min: number;
    lat_max: number;
    lon_min: number;
    lon_max: number;
  };
  precision_meters: number;
  timestamp: string;
}

export interface AddressParts {
  houseNo?: string;
  street?: string;
  area?: string;
  district?: string;
  pincode?: string;
  landmark?: string;
}

export interface ConsentRequest {
  userId: string;
  action: string;
  clientId?: string;
}

export interface ConsentResponse {
  consentId: string;
  userId: string;
  action: string;
  timestamp: string;
  expiresAt?: string;
  status: 'granted' | 'pending' | 'revoked';
}

export interface ValidationRequest {
  userId: string;
  consentId: string;
  addressParts: AddressParts;
  latitude: number;
  longitude: number;
  digipin?: string;
}

export interface ValidationCheck {
  check_name: string;
  passed: boolean;
  confidence: number;
  details?: string;
}

export interface ValidationResponse {
  requestId: string;
  isValid: boolean;
  confidenceScore: number;
  digipin: string;
  normalizedAddress?: string;
  validationDetails: {
    checks: ValidationCheck[];
    timestamp: string;
    processingTimeMs: number;
  };
  auditLog?: {
    requestId: string;
    userId: string;
    timestamp: string;
    ipAddress?: string;
  };
}

export interface ValidationStatusResponse {
  requestId: string;
  status: 'pending' | 'completed' | 'failed';
  result?: ValidationResponse;
  error?: string;
  timestamp: string;
}

export interface OfflineAddress {
  id: string;
  displayName: string;
  addressParts: AddressParts;
  coordinates: Coordinates;
  digipin: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  action: 'generate_digipin' | 'validate_address' | 'request_consent';
  requestId?: string;
  digipin?: string;
  coordinates?: Coordinates;
  result?: any;
  ipAddress?: string;
}
