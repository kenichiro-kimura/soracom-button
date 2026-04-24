# SORACOM LTE-M Button for Enterprise Simulator

A multi-platform SORACOM LTE-M Button for Enterprise simulator that works on Windows, Mac, Android, and iOS. This project demonstrates how to build cross-platform applications with maximum code sharing between Electron (desktop) and React Native (mobile) platforms.

## Architecture Overview

This project uses a **monorepo structure with shared business logic** to maximize code reuse across platforms:

```
packages/
├── core/           # Shared business logic library (@soracom-button/core)
├── electron/       # Desktop application (Windows, Mac, Linux)
└── mobile/         # Mobile application (Android, iOS)
```

### Shared Core Library (`@soracom-button/core`)

The core library contains **platform-agnostic business logic** shared between desktop and mobile apps:

- **SORACOM API Communication**: HTTP/UDP data transmission logic
- **Configuration Management**: Settings and WireGuard configuration handling
- **Button Interaction Logic**: Click detection, timing, and event management
- **Internationalization**: Multi-language support (7 languages)
- **Type Definitions**: Shared TypeScript interfaces and enums
- **Business Logic**: Battery management, transmission state handling

### Platform-Specific Implementations

Each platform provides adapters that implement the core library's abstract interfaces:

#### Electron Desktop App
- **Storage**: `electron-store` for persistent configuration
- **UDP Transport**: Node.js `dgram` module
- **SORACOM Arc**: `libsoratun` native library integration
- **UI**: HTML/CSS/JavaScript with Electron renderer

#### React Native Mobile App
- **Storage**: `AsyncStorage` for configuration persistence
- **UDP Transport**: `react-native-udp` for network communication
- **Haptic Feedback**: Native vibration and haptic patterns
- **UI**: Native mobile components optimized for touch interaction

## Features

### Core Functionality
- ✅ **Button Simulation**: Single click, double click, long press (1s+)
- ✅ **SORACOM Integration**: Data transmission to SORACOM Harvest
- ✅ **WireGuard Support**: SORACOM Arc Integration via WireGuard
- ✅ **Multi-language**: English, Japanese, Chinese, Korean, Spanish, German, French
- ✅ **Battery Simulation**: Configurable battery levels (0.25V - 1.0V)
- ✅ **Visual Feedback**: LED status indicators with color-coded states

### Platform-Specific Features

#### Desktop (Electron)
- Native desktop window management
- System menu integration
- File-based WireGuard configuration
- libsoratun integration for enhanced security
- Keyboard shortcuts

#### Mobile (React Native)
- Native touch interaction with haptic feedback
- Device-optimized UI scaling
- Background task support
- Platform-specific design guidelines
- Mobile-optimized configuration screens

## Getting Started

### Prerequisites

- **Node.js 18+**
- **Desktop Development**: Electron build tools
- **Mobile Development**: React Native environment setup
  - Android: Android Studio
  - iOS: Xcode (macOS only)

### Installation

1. **Clone and install dependencies**:
```bash
git clone https://github.com/kenichiro-kimura/soracom-button.git
cd soracom-button
npm install
```

2. **Build the shared core library**:
```bash
npm run build:core
```

### Running Applications

#### Desktop Application
```bash
# Development
npm start

# Build for distribution
npm run build-mac      # macOS
npm run build-win64    # Windows 64-bit
npm run build-win32    # Windows 32-bit
```

#### Mobile Application
```bash
# Start development server
npm run start:mobile

# Run on Android
npm run android

# Run on iOS (macOS only)
npm run ios
```

### Development Commands

```bash
# Build all packages
npm run build

# Run all tests
npm test

# Lint all packages
npm run lint

# Package-specific commands
npm run build:core       # Build shared library
npm run test:electron    # Test desktop app
npm run lint:mobile      # Lint mobile app
```

## SORACOM Setup

### Prerequisites
1. **SORACOM Account**: Create account at [SORACOM Console](https://console.soracom.io)
2. **SORACOM Harvest**: Enable data collection service
3. **Network Access**: Ensure device can reach SORACOM platform

### Option 1: SORACOM Arc Integration (Recommended)

The app supports SORACOM Arc Integration for secure WireGuard-based connectivity:

1. **Create SORACOM Arc Virtual SIM**
2. **Download WireGuard Configuration**
3. **Configure in App**:
   - Desktop: `File > WireGuard config`
   - Mobile: Settings screen
4. **Paste WireGuard config directly** - no additional setup required

### Option 2: Direct Network Access

If Arc Integration is unavailable:
1. **Connect device to SORACOM Air** or existing **SORACOM Arc setup**
2. **Ensure network connectivity** to `button.soracom.io:23080`
3. **Enable SORACOM Harvest** in your SIM group

### Verification

1. **Send test data** using the button interface
2. **Check SORACOM Console** > Data Collection > SORACOM Harvest Data
3. **Verify data arrival** with correct click type and battery level

## Usage

### Basic Operation

1. **Start Application** (desktop or mobile)
2. **Configure Battery Level** using the dropdown/picker
3. **Interact with Button**:
   - **Single Tap/Click**: Quick press and release
   - **Double Tap/Click**: Two quick presses within 300ms
   - **Long Press**: Hold for 1+ seconds then release
4. **Monitor Status**: Watch LED indicator and status messages
5. **Verify Data**: Check SORACOM Harvest for transmitted data

### Visual Feedback

- **LED Indicator**:
  - 🔴 **Red**: Transmission successful
  - 🟢 **Green**: Transmission failed  
  - 🟠 **Orange (blinking)**: Transmission in progress
  - ⚫ **Off**: Idle state

- **Status Messages**:
  - **"SENDING"**: Data transmission in progress
  - **"SUCCESS"**: Data transmitted successfully
  - **"FAILED"**: Transmission error occurred

## Development

### Code Sharing Strategy

The project achieves **~80% code sharing** through:

1. **Business Logic Abstraction**: All SORACOM-specific logic in core library
2. **Interface-Based Design**: Platform adapters implement standard interfaces
3. **Dependency Injection**: Platform-specific implementations injected at runtime
4. **Shared Types**: Common TypeScript definitions across all packages

### Adding New Features

1. **Core Logic**: Add to `packages/core/src/` if platform-agnostic
2. **Platform Adapters**: Implement platform-specific interfaces
3. **UI Components**: Create platform-appropriate user interfaces
4. **Tests**: Add unit tests for core logic and integration tests

### Architecture Benefits

- **Maintainability**: Single source of truth for business logic
- **Consistency**: Identical behavior across platforms
- **Efficiency**: Parallel development for different platforms
- **Quality**: Shared tests ensure consistent functionality

## Contributing

1. **Fork the repository**
2. **Create feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit changes**: `git commit -m 'Add amazing feature'`
4. **Push to branch**: `git push origin feature/amazing-feature`
5. **Open Pull Request**

### Development Standards

- **TypeScript**: Strict type checking enabled
- **ESLint**: Code style and quality enforcement
- **Jest**: Unit and integration testing
- **Conventional Commits**: Standardized commit messages

## License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- **[SORACOM](https://soracom.io/)**: For the excellent IoT platform and LTE-M Button hardware
- **[0x6b](https://github.com/0x6b/)**: Developer of libsoratun library enabling SORACOM Arc Integration
- **SORACOM User Group**: Community feedback and feature suggestions

## Support

- **Documentation**: Check the README files in each package directory
- **Issues**: Report bugs via [GitHub Issues](https://github.com/kenichiro-kimura/soracom-button/issues)
- **Community**: Reach out with hashtag `#soracomug` on social media
- **SORACOM Support**: For platform-specific questions, contact SORACOM support
