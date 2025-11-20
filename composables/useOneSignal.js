// Global flag to prevent multiple OneSignal logins
let oneSignalLinked = false;

// OneSignal composable to link user to OneSignal player
export const useOneSignal = () => {
  const linkUserToOneSignal = async (userId) => {
    if (typeof window === 'undefined') {
      return;
    }

    // Prevent multiple calls
    if (oneSignalLinked) {
      return true;
    }

    try {
      // Wait for OneSignal to load
      let attempts = 0;
      while (!window.OneSignal && attempts < 50) {
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
      }

      if (!window.OneSignal) {
        return;
      }

      // Get subscription info
      const isPushSupported = await window.OneSignal.Notifications.isPushSupported();
      const permission = await window.OneSignal.Notifications.permission;

      if (!permission) {
        const result = await window.OneSignal.Notifications.requestPermission();
      }

      // Set external user ID using login (this is the correct way in v16)
      // This links the browser to your user ID so backend can send to this user
      try {
        await window.OneSignal.login(userId.toString());

        // Get OneSignal player ID for debugging
        const onesignalId = await window.OneSignal.User.onesignalId;

        oneSignalLinked = true;
        return true;
      } catch (error) {
        // Don't throw - user may already be logged in
        oneSignalLinked = true; // Mark as done even if error
        return false;
      }
    } catch (error) {
      return false;
    }
  };

  return {
    linkUserToOneSignal
  };
};
