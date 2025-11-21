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

        return true;
      } catch (error) {
        console.error('OneSignal: Login error:', error);
        console.error('OneSignal: Error details:', JSON.stringify(error, null, 2));

        // Even if login fails, if we have a valid OneSignal ID, we can still receive notifications
        // The backend can send to the OneSignal ID directly even without external ID link
        if (currentId) {
          console.log('OneSignal: Login failed but have valid ID:', currentId, '- continuing anyway');
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
