export default () => ({
  expo: {
    name: 'Orderly Mobile',
    slug: 'orderly-mobile',
    version: '1.0.0',
    orientation: 'portrait',
    scheme: 'orderly',
    userInterfaceStyle: 'light',
    splash: {
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },
    assetBundlePatterns: ['**/*'],
    ios: {
      supportsTablet: true,
    },
    android: {
      adaptiveIcon: {
        backgroundColor: '#ffffff',
      },
    },
    web: {
      bundler: 'metro',
    },
    extra: {
      apiBaseUrl: process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000/api',
    },
  },
})
