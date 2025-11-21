export default defineNuxtPlugin(() => {
  if (import.meta.client) {
    window.OneSignalDeferred = window.OneSignalDeferred || [];

    window.OneSignalDeferred.push(async function(OneSignal) {
      const appId = '6cb000af-0fa3-4599-bae3-ab376c12bb36';
      console.log('OneSignal: Initializing with App ID:', appId);

      await OneSignal.init({
        appId: appId,
        allowLocalhostAsSecureOrigin: true,
        // Let OneSignal manage its own service worker
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
