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

            // WORKAROUND for Cordova v5 bug: ALWAYS use REST API to set external ID
            // The login() method has known issues where External ID doesn't persist on server
            // Use the new User API endpoint for setting aliases
            if (subscriptionId) {
              console.log('OneSignal: Using REST API to ensure External ID is synced to server...');
              try {
                const appId = '6cb000af-0fa3-4599-bae3-ab376c12bb36';
                const externalIdValue = 'user_' + userId.toString();
                const apiUrl = `https://api.onesignal.com/apps/${appId}/subscriptions/${subscriptionId}/user/identity`;

                console.log('OneSignal: API URL:', apiUrl);

                const response = await fetch(apiUrl, {
                  method: 'PATCH',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Basic os_v2_app_nsyablypuncztoxdvm3wyev3gzu5mv4nmvkef5mgnzychjberxqevkgmhj3s3ylte7aszztsfzoj4y432ii6zg4me6gbavm3zks5vfq'
                  },
                  body: JSON.stringify({
                    identity: {
                      external_id: externalIdValue
                    }
                  })
                });

                const data = await response.json();
                console.log('OneSignal: REST API response:', data);
                console.log('OneSignal: REST API status:', response.status);

                // Log detailed error if present
                if (data.errors && data.errors.length > 0) {
                  console.error('OneSignal: API errors:', JSON.stringify(data.errors));

                  // If subscription not found (404), try creating it via user creation endpoint
                  if (data.errors[0]?.code === 'subscription-0') {
                    console.log('OneSignal: Subscription not found, creating via user endpoint...');
                    try {
                      const createUserUrl = `https://api.onesignal.com/apps/${appId}/users`;
                      const createResponse = await fetch(createUserUrl, {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                          'Authorization': 'Basic os_v2_app_nsyablypuncztoxdvm3wyev3gzu5mv4nmvkef5mgnzychjberxqevkgmhj3s3ylte7aszztsfzoj4y432ii6zg4me6gbavm3zks5vfq'
                        },
                        body: JSON.stringify({
                          identity: {
                            external_id: externalIdValue
                          },
                          subscriptions: [
                            {
                              type: 'AndroidPush',
                              token: pushToken,
                              enabled: true
                            }
                          ]
                        })
                      });
                      const createData = await createResponse.json();
                      console.log('OneSignal: User creation response:', createData);
                      if (createResponse.ok) {
                        console.log('OneSignal: ✅ User created and External ID synced!');
                      } else {
                        console.error('OneSignal: User creation failed:', createData);
                      }
                    } catch (createError) {
                      console.error('OneSignal: User creation error:', createError);
                    }
                  }
                }

                // Verify it worked
                if (response.ok) {
                  console.log('OneSignal: ✅ External User ID successfully synced to server!');
                } else if (response.status !== 404) {
                  console.error('OneSignal: ❌ REST API failed with status:', response.status);
                  console.error('OneSignal: Full response:', JSON.stringify(data));
                }
              } catch (apiError) {
                console.error('OneSignal: REST API error:', apiError);
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
