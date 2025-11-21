export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();

  if (process.client) {
    window.OneSignalDeferred = window.OneSignalDeferred || [];

    window.OneSignalDeferred.push(async function(OneSignal) {
      await OneSignal.init({
        appId: config.public.oneSignalAppId,
        allowLocalhostAsSecureOrigin: true,
        serviceWorkerPath: '/OneSignalSDKWorker.js',
        serviceWorkerUpdaterPath: '/OneSignalSDKUpdaterWorker.js',
        path: '/',
        notifyButton: {
          enable: false, // We'll handle our own permission prompt
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
