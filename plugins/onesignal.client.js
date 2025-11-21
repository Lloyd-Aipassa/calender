export default defineNuxtPlugin(() => {
  if (import.meta.client) {
    // Register service worker manually first
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/OneSignalSDKWorker.js', { scope: '/' })
        .then(reg => console.log('OneSignal: Service worker registered manually', reg))
        .catch(err => console.error('OneSignal: Service worker registration failed', err));
    }

    window.OneSignalDeferred = window.OneSignalDeferred || [];

    window.OneSignalDeferred.push(async function(OneSignal) {
      const appId = '6cb000af-0fa3-4599-bae3-ab376c12bb36';
      console.log('OneSignal: Initializing with App ID:', appId);

      await OneSignal.init({
        appId: appId,
        allowLocalhostAsSecureOrigin: true,
        serviceWorkerParam: { scope: '/' },
        serviceWorkerPath: 'OneSignalSDKWorker.js',
        serviceWorkerUpdaterPath: 'OneSignalSDKUpdaterWorker.js',
        notifyButton: {
          enable: false,
        },
      });

      console.log('OneSignal: Initialized successfully');
    });
  }

  return {
    provide: {
      oneSignal: () => window.OneSignal
    }
  };
});
