export default defineNuxtPlugin(() => {
  if (import.meta.client) {
    window.OneSignalDeferred = window.OneSignalDeferred || [];

    window.OneSignalDeferred.push(async function(OneSignal) {
      const appId = '6cb000af-0fa3-4599-bae3-ab376c12bb36';
      console.log('OneSignal: Initializing with App ID:', appId);

      await OneSignal.init({
        appId: appId,
        allowLocalhostAsSecureOrigin: true,
        serviceWorkerParam: { scope: '/' },
        serviceWorkerPath: 'OneSignalSDKWorker.js',
        notifyButton: {
          enable: false,
        },
      });

      console.log('OneSignal: Initialized with config');

      // Request notification permission on load
      const permission = await OneSignal.Notifications.permission;
      console.log('OneSignal: Initial permission check:', permission);

      if (!permission) {
        console.log('OneSignal: Requesting notification permission...');
        await OneSignal.Notifications.requestPermission();
      }
    });
  }

  return {
    provide: {
      oneSignal: () => window.OneSignal
    }
  };
});
