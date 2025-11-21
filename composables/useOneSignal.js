// OneSignal composable to link user to OneSignal player
export const useOneSignal = () => {
  const linkUserToOneSignal = async (userId) => {
    if (typeof window === 'undefined') {
      console.log('OneSignal: Not in browser environment');
      return;
    }

    console.log('OneSignal: Starting login for user:', userId, '(v2)');

    try {
      // Wait for OneSignal to fully initialize using their deferred promise
      await new Promise((resolve) => {
        if (window.OneSignal && window.OneSignal.User) {
          console.log('OneSignal: Already initialized');
          resolve();
        } else {
          window.OneSignalDeferred = window.OneSignalDeferred || [];
          window.OneSignalDeferred.push(() => {
            console.log('OneSignal: Deferred initialization complete');
            resolve();
          });
        }
      });

      // Additional wait to ensure everything is ready
      await new Promise(resolve => setTimeout(resolve, 1000));

      console.log('OneSignal: SDK fully ready');

      // Wait for OneSignal to get an ID (may take a moment)
      let currentId = await window.OneSignal.User.onesignalId;
      let retries = 0;
      while (!currentId && retries < 10) {
        console.log('OneSignal: Waiting for ID...', retries + 1);
        await new Promise(resolve => setTimeout(resolve, 500));
        currentId = await window.OneSignal.User.onesignalId;
        retries++;
      }
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

      // Check if user is already logged in with this external ID
      // In SDK v16, externalId is a property, not a function
      const currentExternalId = window.OneSignal.User.externalId;
      console.log('OneSignal: Current external ID:', currentExternalId);

      if (currentExternalId === userId.toString()) {
        console.log('OneSignal: User already logged in with correct ID');
        const onesignalId = await window.OneSignal.User.onesignalId;
        console.log('OneSignal: Current OneSignal ID:', onesignalId);

        // CRITICAL: Check if subscription is in broken state (external ID set but no OneSignal ID)
        if (!onesignalId || onesignalId === 'undefined') {
          console.warn('OneSignal: BROKEN STATE DETECTED - External ID set but no OneSignal ID!');
          console.log('OneSignal: Attempting to fix by logging out and back in...');

          try {
            await window.OneSignal.logout();
            await new Promise(resolve => setTimeout(resolve, 1000));
            console.log('OneSignal: Logged out, now logging back in...');

            // Try login, but don't fail if it errors - we can still get the ID
            try {
              await window.OneSignal.login(userId.toString());
            } catch (loginError) {
              console.warn('OneSignal: Login failed, but checking if ID was generated anyway:', loginError);
            }

            await new Promise(resolve => setTimeout(resolve, 1000));

            // Check for OneSignal ID - it may have been generated even if login "failed"
            const newOnesignalId = await window.OneSignal.User.onesignalId;
            console.log('OneSignal: After re-login attempt, OneSignal ID:', newOnesignalId);

            if (newOnesignalId) {
              // Send to backend
              const config = useRuntimeConfig();
              const apiBase = config.public.apiBaseUrl;
              const token = localStorage.getItem('authToken');

              await fetch(`${apiBase}/update_onesignal_id.php`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ onesignal_id: newOnesignalId })
              });
              console.log('OneSignal: Fixed! New ID sent to backend');
              return true;
            } else {
              console.error('OneSignal: Re-login failed to generate OneSignal ID');
              return false;
            }
          } catch (error) {
            console.error('OneSignal: Failed to fix broken state:', error);

            // Last attempt - check if we somehow got an ID anyway
            const finalId = await window.OneSignal.User.onesignalId;
            if (finalId) {
              console.log('OneSignal: Found ID despite errors:', finalId);
              const config = useRuntimeConfig();
              const apiBase = config.public.apiBaseUrl;
              const token = localStorage.getItem('authToken');

              await fetch(`${apiBase}/update_onesignal_id.php`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ onesignal_id: finalId })
              });
              console.log('OneSignal: Recovered! ID sent to backend');
              return true;
            }

            return false;
          }
        }

        // Valid state - send ID to backend if we have it
        if (onesignalId) {
          try {
            const config = useRuntimeConfig();
            const apiBase = config.public.apiBaseUrl;
            const token = localStorage.getItem('authToken');

            await fetch(`${apiBase}/update_onesignal_id.php`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({ onesignal_id: onesignalId })
            });
            console.log('OneSignal: ID sent to backend');
          } catch (error) {
            console.error('OneSignal: Failed to send ID to backend:', error);
          }
        }

        return true;
      }

      // User not logged in or wrong ID, need to login
      // If there's an existing session with different ID, logout first
      if (currentExternalId && currentExternalId !== userId.toString()) {
        console.log('OneSignal: Different user logged in, logging out first...');
        await window.OneSignal.logout();
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Set external user ID using login (this is the correct way in v16)
      // This links the browser to your user ID so backend can send to this user
      try {
        console.log('OneSignal: Logging in with user ID:', userId);
        await window.OneSignal.login(userId.toString());

        // Get OneSignal player ID for debugging
        const onesignalId = await window.OneSignal.User.onesignalId;
        console.log('OneSignal: Login successful! OneSignal ID:', onesignalId);

        // Send OneSignal ID to backend
        if (onesignalId) {
          try {
            const config = useRuntimeConfig();
            const apiBase = config.public.apiBaseUrl;
            const token = localStorage.getItem('authToken');

            await fetch(`${apiBase}/update_onesignal_id.php`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({ onesignal_id: onesignalId })
            });
            console.log('OneSignal: ID sent to backend');
          } catch (error) {
            console.error('OneSignal: Failed to send ID to backend:', error);
          }
        }

        return true;
      } catch (error) {
        console.error('OneSignal: Login error:', error);
        console.error('OneSignal: Error details:', JSON.stringify(error, null, 2));

        // Even if login fails, if we have a valid OneSignal ID, we can still receive notifications
        // The backend can send to the OneSignal ID directly even without external ID link
        if (currentId) {
          console.log('OneSignal: Login failed but have valid ID:', currentId, '- continuing anyway');

          // Send OneSignal ID to backend so it can send notifications directly
          try {
            const config = useRuntimeConfig();
            const apiBase = config.public.apiBaseUrl;
            const token = localStorage.getItem('authToken');

            await fetch(`${apiBase}/update_onesignal_id.php`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({ onesignal_id: currentId })
            });
            console.log('OneSignal: ID sent to backend');
          } catch (error) {
            console.error('OneSignal: Failed to send ID to backend:', error);
          }

          return true;
        }
        return false;
      }
    } catch (error) {
      console.error('OneSignal: Fatal error:', error);
      return false;
    }
  };

  return {
    linkUserToOneSignal
  };
};
