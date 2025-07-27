# SORACOM Button Mobile App

React Native mobile application for SORACOM LTE-M Button for Enterprise simulation.

## Features

- Cross-platform button simulation (Android/iOS)
- SORACOM API integration using shared core library
- Multi-language support (7 languages)
- Haptic feedback for enhanced user experience
- Battery level management
- Real-time transmission status and LED indicators

## Setup

### Prerequisites

- Node.js 18+
- React Native development environment set up
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

### Installation

1. Install dependencies:
```bash
npm install
```

2. For iOS, install CocoaPods dependencies:
```bash
cd ios && pod install && cd ..
```

### Running the App

#### Android
```bash
npm run android
# or from the root workspace
npm run android
```

#### iOS
```bash
npm run ios
# or from the root workspace
npm run ios
```

#### Development Server
```bash
npm start
# or from the root workspace
npm run start:mobile
```

## Architecture

The mobile app uses the shared `@soracom-button/core` library for business logic and provides platform-specific implementations for:

- **Storage**: AsyncStorage adapter for configuration management
- **UDP Communication**: react-native-udp for SORACOM data transmission
- **Haptic Feedback**: Enhanced user interaction feedback
- **UI Components**: Native mobile interface optimized for touch interaction

## Key Components

- **MainScreen**: Primary button interface with touch interaction
- **BatterySelector**: Battery level configuration
- **StatusDisplay**: Real-time transmission status
- **LedIndicator**: Visual feedback with animations
- **SoracomButtonService**: Main service layer integrating core functionality

## Development

### Testing
```bash
npm test
```

### Linting
```bash
npm run lint
```

## Platform-Specific Features

### Android
- Material Design components
- Android-specific haptic patterns
- Background task support

### iOS
- iOS design guidelines compliance
- iOS-specific haptic feedback
- Background app refresh support

## Shared Functionality

The following features are shared with the Electron desktop app through `@soracom-button/core`:

- SORACOM API communication logic
- Configuration management
- Multi-language support
- Button interaction logic
- Business logic and data models