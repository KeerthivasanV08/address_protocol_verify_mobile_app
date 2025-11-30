# AAVA AIA Mobile App

**Address Validation Protocol - Address Intelligence Agent**

A complete React Native Expo mobile application that serves as the front-end for the AAVA (Address Validation Protocol) backend. This app enables users to generate DIGIPINs, validate addresses with consent management, and view validation history with full audit trails.

## Features

### 🗺️ DIGIPIN Generation
- Interactive map with pin placement
- Manual coordinate input
- Real-time grid boundary visualization (4m x 4m precision)
- Current location detection
- Copy-to-clipboard functionality

### ✅ Address Validation
- Complete address form with fuzzy matching
- Smart consent management with modal flow
- Real-time location integration
- High-confidence validation scoring
- Detailed validation check results

### 📜 History & Audit
- Persistent validation history
- Audit log export (JSON format)
- Detailed result viewing
- Sync with Supabase database

### 🔒 Security & Privacy
- Secure storage for user data and consent
- Row-Level Security (RLS) on all database tables
- Clear consent explanation and management
- Data encryption

### 🎯 Demo Mode
- Works offline with mock data
- Perfect for testing and demonstrations
- Automatic fallback when backend unavailable

## Technology Stack

- **Framework**: Expo SDK 54 / React Native
- **Language**: TypeScript
- **Navigation**: Expo Router (file-based routing)
- **Maps**: react-native-maps with Google Maps
- **Database**: Supabase (PostgreSQL with RLS)
- **Location**: expo-location
- **Storage**: expo-secure-store
- **API Client**: axios with fallback mechanisms

## Prerequisites

- Node.js 18+ and npm
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (macOS) or Android Emulator
- Supabase account (already configured)
- Optional: Google Maps API key for native builds

## Installation

### 1. Clone and Install Dependencies

```bash
# Install dependencies
npm install
```

### 2. Environment Configuration

The `.env` file is already configured with:
- Supabase credentials (auto-populated)
- Demo mode enabled by default
- Demo user ID

To connect to a live AAVA backend:

```bash
# Edit .env file
EXPO_PUBLIC_API_BASE_URL=http://your-backend-url:8000
EXPO_PUBLIC_DEMO_MODE=false
```

### 3. Google Maps Setup (Optional - for Native Builds)

For iOS and Android native builds, add your Google Maps API key:

**In app.json:**
```json
{
  "ios": {
    "config": {
      "googleMapsApiKey": "YOUR_IOS_MAPS_KEY"
    }
  },
  "android": {
    "config": {
      "googleMaps": {
        "apiKey": "YOUR_ANDROID_MAPS_KEY"
      }
    }
  }
}
```

**Get a Maps API key:**
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a project and enable Maps SDK
3. Create API credentials

## Running the App

### Web (Development)

```bash
npm run dev
# Press 'w' to open in web browser
```

**Note**: Maps functionality is limited on web. A placeholder view is shown. Use iOS/Android for full map experience.

### iOS Simulator

```bash
npm run dev
# Press 'i' to open iOS simulator
```

### Android Emulator

```bash
npm run dev
# Press 'a' to open Android emulator
```

### Physical Device

```bash
npm run dev
# Scan QR code with Expo Go app
```

## Project Structure

```
aava-aia-mobile/
├── app/                          # Expo Router screens
│   ├── (tabs)/                   # Tab navigation screens
│   │   ├── index.tsx            # Home screen
│   │   ├── generate-digipin.tsx # DIGIPIN generation
│   │   ├── validate.tsx         # Address validation
│   │   └── history.tsx          # Validation history
│   ├── index.tsx                # Welcome/Splash screen
│   ├── validation-result.tsx    # Validation details
│   └── _layout.tsx              # Root layout with providers
│
├── src/
│   ├── api/                     # API layer
│   │   ├── client.ts           # Axios client setup
│   │   ├── aavaService.ts      # AAVA backend service
│   │   └── demoService.ts      # Offline/demo mode service
│   │
│   ├── components/              # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   ├── MapView.tsx
│   │   └── LoadingSpinner.tsx
│   │
│   ├── context/                 # React Context providers
│   │   └── UserContext.tsx     # User state management
│   │
│   └── utils/                   # Utility functions
│       ├── supabase.ts         # Supabase client
│       ├── storage.ts          # Secure storage wrapper
│       ├── auditLogger.ts      # Audit logging
│       └── fuzzyMatch.ts       # Address fuzzy matching
│
├── types/
│   ├── api.ts                   # API type definitions
│   └── env.d.ts                # Environment variables types
│
├── .env                         # Environment configuration
├── .env.example                # Environment template
├── app.json                    # Expo configuration
├── package.json                # Dependencies
└── tsconfig.json               # TypeScript configuration
```

## App Flow

### 1. Welcome Screen
- Auto-initializes demo user
- Shows AAVA branding
- Auto-navigates to Home after 2 seconds

### 2. Home Screen
- Feature overview cards
- User profile display
- Demo mode indicator
- Quick navigation to all features

### 3. Generate DIGIPIN
1. Select location (current or manual coordinates)
2. View location on map
3. Generate DIGIPIN via backend/demo
4. See 4m x 4m grid overlay
5. Copy DIGIPIN for use

### 4. Validate Address
1. Request consent (if not granted)
2. Fill address form with fuzzy predictions
3. Set location (current or manual)
4. Submit validation request
5. View detailed results with confidence scoring

### 5. History
1. View all past validations
2. Pull to refresh
3. Tap record for full details
4. Export audit logs as JSON

## Database Schema

The app uses Supabase with the following tables:

### `user_profiles`
- Stores user information
- Syncs with secure storage

### `consents`
- Tracks consent grants/revocations
- 24-hour expiration by default

### `validation_history`
- Complete validation records
- Includes checks, scores, and metadata

### `audit_logs`
- Full audit trail
- All user actions logged

All tables have Row-Level Security (RLS) enabled.

## Demo Mode

Demo mode is enabled by default and provides:

### Features
- Works completely offline
- Canned responses with realistic data
- Sample address database (3 locations)
- Fuzzy matching for predictions
- Instant validation results

### Demo Addresses
1. Connaught Place, New Delhi (28.6315, 77.2167)
2. India Gate, New Delhi (28.6129, 77.2295)
3. Gateway of India, Mumbai (18.922, 72.8347)

### Switching to Live Backend
1. Set up AAVA FastAPI backend
2. Update `.env`:
   ```
   EXPO_PUBLIC_API_BASE_URL=http://your-backend:8000
   EXPO_PUBLIC_DEMO_MODE=false
   ```
3. Restart Expo dev server

## API Endpoints

The app expects these AAVA backend endpoints:

```
POST /generate-digipin
  Body: { latitude, longitude }
  Returns: { digipin, grid_boundaries, ... }

POST /consent
  Body: { userId, action, clientId }
  Returns: { consentId, status, timestamp, ... }

POST /validate-address
  Body: { userId, consentId, addressParts, latitude, longitude }
  Returns: { requestId, isValid, confidenceScore, digipin, validationDetails, ... }

GET /validation-status/:requestId
  Returns: { requestId, status, result, ... }
```

## Security Best Practices

### Implemented
- ✅ Secure storage for sensitive data
- ✅ RLS on all database tables
- ✅ Consent validation before operations
- ✅ Encrypted Supabase connection
- ✅ No hardcoded secrets

### Recommendations
- Use environment-specific `.env` files
- Never commit API keys to version control
- Implement backend authentication
- Use HTTPS in production
- Regular security audits

## Troubleshooting

### Maps Not Showing (Web)
**Expected**: Maps use a placeholder on web. Use iOS/Android for full experience.

### Location Permission Denied
1. Check device settings
2. Grant location permission to Expo Go
3. Restart app

### Backend Connection Failed
- Verify `EXPO_PUBLIC_API_BASE_URL` in `.env`
- Check backend is running
- App auto-falls back to demo mode

### Supabase Errors
- Verify credentials in `.env`
- Check database migrations applied
- Ensure RLS policies configured

### Build Errors
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Expo cache
expo start -c
```

## Building for Production

### EAS Build (Recommended)

```bash
# Install EAS CLI
npm install -g eas-cli

# Configure project
eas build:configure

# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android
```

### Local Builds

Refer to [Expo documentation](https://docs.expo.dev/build/setup/) for local build setup.

## Testing

### Manual Testing Checklist
- [ ] Generate DIGIPIN with current location
- [ ] Generate DIGIPIN with manual coordinates
- [ ] Request consent flow
- [ ] Validate address (all fields)
- [ ] Validate address (minimal fields)
- [ ] View validation results
- [ ] Check validation history
- [ ] Export audit logs
- [ ] Test offline mode
- [ ] Test map interactions

## Contributing

This is a demonstration app for the AAVA protocol. For production use:

1. Implement comprehensive error handling
2. Add unit and integration tests
3. Implement proper authentication
4. Add analytics and monitoring
5. Optimize performance
6. Add accessibility features

## License

MIT License - See LICENSE file for details

## Support

For issues and questions:
- Check troubleshooting section
- Review Expo documentation
- Check AAVA backend documentation

## Acknowledgments

- Built with Expo and React Native
- Maps by Google Maps / react-native-maps
- Database by Supabase
- Icons by Lucide React Native

---

**Version**: 1.0.0
**Last Updated**: 2025
**Demo Mode**: Active by default
