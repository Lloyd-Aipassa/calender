// OneSignal composable to link user to OneSignal player
export const useOneSignal = () => {
  const linkUserToOneSignal = async (userId) => {
    if (typeof window === 'undefined') {
      console.log('OneSignal: Not in browser environment');
      return;
    }

    console.log('OneSignal: Starting login for user:', userId);

    // Check if running in Capacitor (native app)
    // Check for both window.Capacitor and window.plugins.OneSignal (Cordova plugin)
    const isCapacitor = window.Capacitor !== undefined || window.plugins?.OneSignal !== undefined;

    if (isCapacitor) {
      console.log('OneSignal: Using native Cordova plugin');
      console.log('OneSignal: window.plugins available:', !!window.plugins);
      console.log('OneSignal: window.plugins.OneSignal available:', !!window.plugins?.OneSignal);

      // Log available OneSignal methods
      if (window.plugins?.OneSignal) {
        console.log('OneSignal: Available methods:', Object.keys(window.plugins.OneSignal));
      }

      // Wait for OneSignal Cordova plugin to load AND be initialized
      let attempts = 0;
      while ((!window.plugins?.OneSignal?.User || !window.plugins?.OneSignal?._appID) && attempts < 100) {
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
      }

      console.log('OneSignal: After waiting, plugin available:', !!window.plugins?.OneSignal);
      console.log('OneSignal: App ID set:', !!window.plugins?.OneSignal?._appID);
      console.log('OneSignal: Attempts needed:', attempts);

      if (!window.plugins?.OneSignal?.User || !window.plugins?.OneSignal?._appID) {
        console.error('OneSignal: Cordova plugin not initialized yet');
        console.log('OneSignal: window.plugins:', window.plugins);
        if (window.plugins?.OneSignal) {
          console.log('OneSignal: Available methods:', Object.keys(window.plugins.OneSignal));
        }
        return false;
      }

      // Set external user ID for native app using v5 API
      // In OneSignal v5, use login() instead of setExternalUserId()
      try {
        console.log('OneSignal: Calling login with user ID:', userId);
        window.plugins.OneSignal.login(userId.toString());
        console.log('OneSignal: Login called successfully');

        // Wait a bit and then get subscription info to sync via API
        setTimeout(async () => {
          try {
            // Use async getters for v5 API
            const onesignalId = await window.plugins.OneSignal.User.getOnesignalId();
            console.log('OneSignal: OneSignal User ID after login:', onesignalId);

            // Get external ID
            const externalId = await window.plugins.OneSignal.User.getExternalId();
            console.log('OneSignal: External ID:', externalId);

            // Get push subscription token
            const pushToken = await window.plugins.OneSignal.User.pushSubscription.getTokenAsync();
            console.log('OneSignal: Push Token:', pushToken);

            // Get subscription ID
            const subscriptionId = await window.plugins.OneSignal.User.pushSubscription.getIdAsync();
            console.log('OneSignal: Subscription ID:', subscriptionId);

            // WORKAROUND for Cordova v5 bug: ALWAYS use backend API to set external ID
            // The login() method has known issues where External ID doesn't persist on server
            // Use backend endpoint that securely calls OneSignal REST API
            if (subscriptionId) {
              console.log('OneSignal: Using backend API to ensure External ID is synced to server...');
              try {
                const config = useRuntimeConfig();
                const apiBase = config.public.apiBaseUrl;
                const token = localStorage.getItem('authToken');
                const externalIdValue = 'user_' + userId.toString();

                console.log('OneSignal: Calling backend sync endpoint...');

                const response = await fetch(`${apiBase}/sync_onesignal_id.php`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                  },
                  body: JSON.stringify({
                    subscription_id: subscriptionId,
                    external_id: externalIdValue,
                    push_token: pushToken
                  })
                });

                const data = await response.json();
                console.log('OneSignal: Backend API response:', data);
                console.log('OneSignal: Backend API status:', response.status);

                // Verify it worked
                if (response.ok && data.success) {
                  console.log('OneSignal: ✅ External User ID successfully synced to server!');
                } else {
                  console.error('OneSignal: ❌ Backend API failed:', data.error || 'Unknown error');
                }
              } catch (apiError) {
                console.error('OneSignal: Backend API error:', apiError);
              }
            }
          } catch (error) {
            console.error('OneSignal: Error getting user info:', error);
          }
        }, 2000);

        return true;
      } catch (error) {
        console.error('OneSignal: Error during login:', error);
        return false;
      }
    } else {
      console.log('OneSignal: Using web SDK');

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

        // Check if we have a valid OneSignal ID first
        const currentId = await window.OneSignal.User.onesignalId;
        console.log('OneSignal: Current ID before login:', currentId);

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

        // Set external user ID using login (this is the correct way in v16)
        // This links the browser to your user ID so backend can send to this user
        try {
          console.log('OneSignal: Logging in with user ID:', userId);
          await window.OneSignal.login(userId.toString());

          // Get OneSignal player ID for debugging
          const onesignalId = await window.OneSignal.User.onesignalId;
          console.log('OneSignal: Login successful! OneSignal ID:', onesignalId);

          return true;
        } catch (error) {
          // Don't throw - user may already be logged in
          console.error('OneSignal: Login error:', error);
          return false;
        }
      } catch (error) {
        console.error('OneSignal: Fatal error:', error);
        return false;
      }
    }
  };

  return {
    linkUserToOneSignal
  };
};
