# HydCom
Hydrogropher's Companion App

## Getting Started

After cloning or pulling new updates, install dependencies to ensure all required modules (like `tslib`) are present:

```bash
npm install
```
If you encounter an error about `react-native-reanimated` when running the app, install it via:
```bash
npx expo install react-native-reanimated
```

Ensure `index.js` imports `react-native-reanimated` before other modules:

```javascript
import 'react-native-reanimated';
```

This step is required whenever `package.json` changes.

## Encrypted Data Storage

The app now stores sample and survey data using AES encryption so it works in
Expo Go without extra native modules. Data files are saved under the app's
document directory as `samples.enc` and `surveys.enc`. The encryption key is a
static placeholder found in `src/utils/cryptoUtils.js`—replace it with your own
secret for production use.

## Troubleshooting Camera Issues

If the camera view shows a blank screen even after granting permissions:

1. Reinstall the camera module to ensure it is properly linked:

   ```bash
   expo install expo-camera
   ```

2. Restart the Expo development server:

   ```bash
   npx expo start -c
   ```

3. Force quit and reopen the Expo Go app on your device.

### Resolving duplicate React with sentry-expo
If Metro fails to resolve `./cjs/react.development.js` from `sentry-expo`, the bundler is picking up Sentry's internal copy of React. We provide a `metro.config.js` that aliases `react` to the project's own version. Ensure this file is in the project root and restart `expo start` after running `npm install`.

