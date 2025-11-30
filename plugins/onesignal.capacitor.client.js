export default defineNuxtPlugin(() => {
  if (import.meta.client) {
    // Wait a bit for Cordova plugins to load
    setTimeout(() => {
      // Check if running in Capacitor (native app)
      // Also check for OneSignal Cordova plugin presence
      const isCapacitor = window.Capacitor !== undefined || window.plugins?.OneSignal !== undefined;

      if (isCapacitor) {
        console.log('OneSignal: Running in Capacitor mode (native)');

        // Wait for OneSignal plugin to be available
        if (!window.plugins?.OneSignal) {
          console.log('OneSignal: Plugin not yet available, waiting...');
          return;
        }

        // Initialize OneSignal with v5 API
        const appId = '6cb000af-0fa3-4599-bae3-ab376c12bb36';
        console.log('OneSignal: Initializing with App ID:', appId);

        // Initialize the SDK
        window.plugins.OneSignal.initialize(appId);
        console.log('OneSignal: SDK initialized');

        // Request notification permission
        window.plugins.OneSignal.Notifications.requestPermission(true).then((accepted) => {
          console.log('OneSignal: Notification permission:', accepted);

          // Wait a bit for registration to complete, then log IDs
          setTimeout(async () => {
            // Use addEventListener to get ID when it's available
            window.plugins.OneSignal.User.addEventListener('change', (event) => {
              console.log('OneSignal: User state changed:', event);
              console.log('OneSignal: User ID:', event.current.onesignalId);
            });

            try {
              // Use async getters for v5 API
              const userId = await window.plugins.OneSignal.User.getOnesignalId();
              console.log('OneSignal: User ID:', userId);

              // Get push subscription info
              window.plugins.OneSignal.User.pushSubscription.addEventListener('change', (event) => {
                console.log('OneSignal: Push subscription changed:', event);
                console.log('OneSignal: Push Token:', event.current.token);
                console.log('OneSignal: Subscription ID:', event.current.id);
              });

              const pushId = await window.plugins.OneSignal.User.pushSubscription.getIdAsync();
              const pushToken = await window.plugins.OneSignal.User.pushSubscription.getTokenAsync();
              console.log('OneSignal: Push Subscription ID:', pushId);
              console.log('OneSignal: Push Token:', pushToken);
            } catch (error) {
              console.error('OneSignal: Error getting device info:', error);
            }
          }, 2000);
        });
      } else {
        console.log('OneSignal: Running in browser mode (PWA)');
        // Browser/PWA mode - use the existing web SDK
      }
    }, 1000); // Wait 1 second for Cordova plugins to load
  }

  return {
    provide: {
      oneSignalNative: () => window.plugins?.OneSignal || null
    }
  };
});
