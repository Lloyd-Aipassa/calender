export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();

  if (process.client) {
    window.OneSignalDeferred = window.OneSignalDeferred || [];

    window.OneSignalDeferred.push(async function(OneSignal) {
      await OneSignal.init({
        appId: config.public.oneSignalAppId,
        allowLocalhostAsSecureOrigin: true,
        notifyButton: {
          enable: false, // We'll handle our own permission prompt
        },
      });


      // Request notification permission on load
      const permission = await OneSignal.Notifications.permission;

      if (!permission) {
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
