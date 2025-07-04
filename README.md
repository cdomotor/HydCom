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

This step is required whenever `package.json` changes.

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
