export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();

  if (import.meta.client) {
    window.OneSignalDeferred = window.OneSignalDeferred || [];

    window.OneSignalDeferred.push(async function(OneSignal) {
      await OneSignal.init({
        appId: config.public.oneSignalAppId,
        allowLocalhostAsSecureOrigin: true,
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
