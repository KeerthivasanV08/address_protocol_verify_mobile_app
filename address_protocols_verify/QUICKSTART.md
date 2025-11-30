# AAVA AIA Mobile - Quick Start Guide

## 🚀 Get Started in 2 Minutes

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Run the App
```bash
npm run dev
```

Then:
- Press **'w'** for web browser
- Press **'i'** for iOS simulator (macOS only)
- Press **'a'** for Android emulator
- Scan QR code with **Expo Go** app on your phone

### Step 3: Explore the App

The app will open with a welcome screen and automatically navigate to the home page. You can:

1. **Generate DIGIPIN** - Create a unique digital address identifier
2. **Validate Address** - Verify address accuracy with consent flow
3. **View History** - See past validations and export audit logs

## 📱 Demo Mode

The app runs in **demo mode** by default, which means:
- ✅ Works completely offline
- ✅ Uses realistic mock data
- ✅ No backend required
- ✅ Perfect for testing

## 🔌 Connect to Real Backend

To use the live AAVA backend:

1. Edit `.env` file:
```bash
EXPO_PUBLIC_API_BASE_URL=http://your-backend-url:8000
EXPO_PUBLIC_DEMO_MODE=false
```

2. Restart dev server:
```bash
# Press Ctrl+C to stop, then:
npm run dev
```

## 🗺️ Maps Note

- **Web**: Maps show as placeholders (expected behavior)
- **iOS/Android**: Full interactive Google Maps

## 🔐 Database

The app uses Supabase (already configured):
- User profiles
- Consent management
- Validation history
- Audit logs

All tables have Row-Level Security enabled.

## 📄 Features Overview

### DIGIPIN Generation
- Pick location on map or enter coordinates
- See 4m x 4m grid boundaries
- Copy DIGIPIN to clipboard

### Address Validation
- Fill address form with fuzzy matching
- Grant consent via modal
- View detailed validation results
- See confidence scoring

### History & Audit
- View all past validations
- Tap to see full details
- Export audit logs as JSON

## 🐛 Common Issues

**Q: Maps not showing on web?**
A: Expected. Use iOS/Android for maps.

**Q: Location permission denied?**
A: Check device settings and grant permission.

**Q: Backend connection failed?**
A: App auto-falls back to demo mode.

## 📚 Full Documentation

See **README.md** for complete documentation including:
- Full project structure
- API endpoints
- Security best practices
- Building for production
- Troubleshooting guide

## 🎯 Demo User

Default demo user credentials:
- **User ID**: demo-user-001
- **Demo Mode**: Enabled

## 📦 Project Structure

```
app/              # Screens (Expo Router)
src/
  ├── api/        # Backend services
  ├── components/ # Reusable UI
  ├── context/    # State management
  └── utils/      # Helper functions
types/            # TypeScript types
```

## 🛠️ Tech Stack

- **Framework**: Expo / React Native
- **Language**: TypeScript
- **Database**: Supabase
- **Maps**: react-native-maps
- **Navigation**: Expo Router

---

**Need help?** Check the full README.md or troubleshooting section.

**Ready to build?** Run `npm run build` to export for web.
