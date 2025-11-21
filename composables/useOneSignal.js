// OneSignal composable with JWT Identity Verification
export const useOneSignal = () => {
  const config = useRuntimeConfig();
  const apiBase = config.public.apiBaseUrl;

  // Fetch JWT token from backend
  const fetchOneSignalJWT = async (userId) => {
    try {
      const authToken = localStorage.getItem('authToken');
      const response = await fetch(`${apiBase}/get_onesignal_token.php`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (!response.ok) {
        console.error('OneSignal: Failed to fetch JWT token');
        return null;
      }

      const data = await response.json();
      if (data.success) {
        console.log('OneSignal: JWT token fetched successfully');
        return data.jwt;
      }

      return null;
    } catch (error) {
      console.error('OneSignal: Error fetching JWT:', error);
      return null;
    }
  };

  const linkUserToOneSignal = async (userId) => {
    if (typeof window === 'undefined') {
      console.log('OneSignal: Not in browser environment');
      return;
    }

    console.log('OneSignal: Starting JWT-based login for user:', userId);

    try {
      // Wait for OneSignal to load
      let attempts = 0;
      while (!window.OneSignal && attempts < 50) {
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
      }

      if (!window.OneSignal) {
        console.error('OneSignal: Failed to load after 50 attempts');
        return;
      }

      console.log('OneSignal: SDK loaded successfully');

      // Get subscription info
      const isPushSupported = await window.OneSignal.Notifications.isPushSupported();
      const permission = await window.OneSignal.Notifications.permission;

      console.log('OneSignal: Push supported:', isPushSupported);
      console.log('OneSignal: Permission:', permission);

      if (!permission) {
        console.log('OneSignal: Requesting permission...');
        const result = await window.OneSignal.Notifications.requestPermission();
        console.log('OneSignal: Permission result:', result);
      }

      // Fetch JWT token from backend
      const jwt = await fetchOneSignalJWT(userId);
      if (!jwt) {
        console.error('OneSignal: Failed to get JWT token from backend');
        return false;
      }

      // Login with JWT (Identity Verification enabled)
      try {
        console.log('OneSignal: Logging in with JWT for user ID:', userId);
        await window.OneSignal.login(userId.toString(), jwt);

        // Get OneSignal player ID for debugging
        const onesignalId = await window.OneSignal.User.onesignalId;
        console.log('OneSignal: JWT login successful! OneSignal ID:', onesignalId);

        // Set up JWT refresh handler for when token expires
        window.OneSignal.User.PushSubscription.addEventListener('change', async (event) => {
          console.log('OneSignal: Subscription changed:', event);
        });

        return true;
      } catch (error) {
        console.error('OneSignal: Login error:', error);
        return false;
      }
    } catch (error) {
      console.error('OneSignal: Fatal error:', error);
      return false;
    }
  };

  // Handle JWT invalidation (when token expires)
  const setupJWTRefreshHandler = (userId) => {
    if (typeof window === 'undefined' || !window.OneSignal) return;

    // This will be called when OneSignal needs a fresh JWT
    window.OneSignal.User.addEventListener('subscriptionChange', async (event) => {
      console.log('OneSignal: JWT may need refresh, fetching new token...');

      const newJWT = await fetchOneSignalJWT(userId);
      if (newJWT) {
        console.log('OneSignal: Updating JWT token');
        // OneSignal will automatically use the new JWT on next API call
        await window.OneSignal.login(userId.toString(), newJWT);
      }
    });
  };

  return {
    linkUserToOneSignal,
    setupJWTRefreshHandler
  };
};
