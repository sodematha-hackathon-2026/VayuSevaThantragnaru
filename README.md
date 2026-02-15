# Sri Sode Vadiraja Matha App

A React Native mobile application for Sri Sode Vadiraja Matha featuring news updates, announcements, seva booking, room booking, and panchanga.

## Features

- **Bilingual Support**: English and Kannada (ಕನ್ನಡ) interface
- **Phone Authentication**: OTP-based login with international country code support (190+ countries)
- **Home Dashboard**: News, announcements, darshana timings, and social media links
- **Language Persistence**: Selected language is saved and persists across app sessions
- **Bottom Tab Navigation**: Easy navigation between Home, Seva Booking, Room Booking, Panchanga, and Profile
- **Responsive Design**: Optimized for both Android and iOS devices

## Prerequisites

### Required Software

| Software | Version | Download |
|----------|---------|----------|
| Node.js | >= 20.x | [nodejs.org](https://nodejs.org/) |
| npm | >= 10.x | Comes with Node.js |
| React Native | 0.83.1 | Installed via npm |
| JDK | 17 | [Oracle JDK](https://www.oracle.com/java/technologies/downloads/) |
| Android Studio | Latest | [developer.android.com](https://developer.android.com/studio) |
| Xcode | Latest (macOS only) | Mac App Store |

### Android Setup

1. Install Android Studio
2. Install Android SDK (API Level 34)
3. Configure ANDROID_HOME environment variable
4. Add platform-tools to PATH

### iOS Setup (macOS only)

1. Install Xcode from Mac App Store
2. Install Xcode Command Line Tools:
   ```bash
   xcode-select --install
   ```
3. Install CocoaPods:
   ```bash
   sudo gem install cocoapods
   ```

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd SodeMathaApp
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure Firebase:
   - Add `google-services.json` to `android/app/`
   - Add `GoogleService-Info.plist` to `ios/SodeMathaApp/` (iOS only)

4. Link vector icons (Android):
   ```bash
   cd android
   ./gradlew clean
   cd ..
   ```

5. Install iOS pods (macOS only):
   ```bash
   cd ios
   pod install
   cd ..
   ```

## Running the App

### Start Metro Bundler

```bash
npm start
```

### Run on Android

In a new terminal:

```bash
npm run android
```

Or build from Android Studio:
1. Open `android/` folder in Android Studio
2. Click Run button

### Run on iOS (macOS only)

In a new terminal:

```bash
npm run ios
```

Or build from Xcode:
1. Open `ios/SodeMathaApp.xcworkspace` in Xcode
2. Click Run button

## Project Structure

```
SodeMathaApp/
├── src/
│   ├── context/           # React Context (Language)
│   │   └── LanguageContext.tsx
│   ├── navigation/        # Navigation setup
│   │   ├── AppDrawer.tsx
│   │   ├── AuthStack.tsx
│   │   └── RootNavigator.tsx
│   ├── screens/           # App screens
│   │   ├── HomeScreen.tsx
│   │   ├── LoginScreen.tsx
│   │   ├── SevaBookingScreen.tsx
│   │   ├── RoomBookingScreen.tsx
│   │   ├── PanchangaScreen.tsx
│   │   └── ProfileScreen.tsx
│   └── utils/             # Utilities
│       ├── countries.ts   # Country codes list
│       └── translations.ts # i18n translations
├── assets/                # Images and static files
├── android/               # Android native code
└── ios/                   # iOS native code
```

## Key Dependencies

- **React Native**: 0.83.1
- **React**: 19.2.0
- **React Navigation**: 7.x
  - @react-navigation/bottom-tabs: ^7.12.0
  - @react-navigation/native: ^7.1.28
  - @react-navigation/native-stack: ^7.12.0
- **Firebase**: 23.8.6
  - @react-native-firebase/app
  - @react-native-firebase/auth
  - @react-native-firebase/firestore
  - @react-native-firebase/storage
- **React Native Vector Icons**: 10.3.0 (Ionicons)
- **React Hook Form**: 7.71.1
- **AsyncStorage**: ^2.1.0 (for language persistence)
- **React Native Confirmation Code Field**: ^8.0.1 (OTP input)
- **Yup**: ^1.7.1 (form validation)

## Features Implementation

### Login Page
- Phone number authentication with OTP
- International country code selector (190+ countries)
- Searchable country dropdown
- Privacy Policy and Terms & Conditions links
- Consent checkbox
- Language toggle (English/Kannada)
- 60-second cooldown for resend OTP
- Vadiraja Theertharu image header

### Home Page
- Matha logo and Swamiji photos
- Top 5 news articles with images
- Flash updates carousel for announcements
- Darshana and Prasada timings table
- Social media links (Instagram, Facebook)
- Sign out button
- All content translates based on selected language

### Language Support
- Toggle between English and Kannada
- Language preference persists across app sessions
- All UI elements translate dynamically
- Stored in AsyncStorage

## Troubleshooting

### Metro bundler cache issues
```bash
npm start -- --reset-cache
```

### Android build issues
```bash
cd android
./gradlew clean
cd ..
npm run android
```

### iOS build issues
```bash
cd ios
pod deintegrate
pod install
cd ..
npm run ios
```

### Icons not displaying
```bash
cd android
./gradlew clean
cd ..
npm run android
```

### AsyncStorage issues
If language preference is not persisting:
```bash
npm install @react-native-async-storage/async-storage
cd android
./gradlew clean
cd ..
npm run android
```

## Development

### Reload App
- **Android**: Press `R` twice or `Ctrl+M` → Reload
- **iOS**: Press `Cmd+R`

### Debug Menu
- **Android**: `Ctrl+M` (Windows/Linux) or `Cmd+M` (macOS)
- **iOS**: `Cmd+D`

### Adding Translations
Edit `src/utils/translations.ts` to add new translations:
```typescript
export const translations = {
  en: {
    yourKey: "Your English Text",
  },
  kn: {
    yourKey: "ನಿಮ್ಮ ಕನ್ನಡ ಪಠ್ಯ",
  },
};
```

Use in components:
```typescript
import { t } from '../utils/translations';
import { useLanguage } from '../context/LanguageContext';

const { language } = useLanguage();
<Text>{t('yourKey', language)}</Text>
```

## Firebase Configuration

Ensure Firebase is properly configured:
1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable Authentication (Phone Auth)
3. Create Firestore database with collections: `news`, `announcements`
4. Download configuration files:
   - `google-services.json` → `android/app/`
   - `GoogleService-Info.plist` → `ios/SodeMathaApp/`

## License

Private - All rights reserved
