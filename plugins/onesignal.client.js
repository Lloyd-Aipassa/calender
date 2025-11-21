export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();

  if (import.meta.client) {
    window.OneSignalDeferred = window.OneSignalDeferred || [];

    window.OneSignalDeferred.push(async function(OneSignal) {
      // IMPORTANT: Don't specify serviceWorkerPath here!
      // OneSignal v16 will automatically use its own hosted Service Worker
      // which is what we want for proper push notification support
      await OneSignal.init({
        appId: config.public.oneSignalAppId,
        allowLocalhostAsSecureOrigin: true,
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
