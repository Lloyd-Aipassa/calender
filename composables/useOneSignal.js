// OneSignal composable to link user to OneSignal player
export const useOneSignal = () => {
  const linkUserToOneSignal = async (userId) => {
    if (typeof window === 'undefined') {
      console.warn('Not on client side');
      return;
    }

    try {
      // Wait for OneSignal to load
      let attempts = 0;
      while (!window.OneSignal && attempts < 50) {
        console.log('⏳ Waiting for OneSignal to load...');
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
      }

      if (!window.OneSignal) {
        console.error('❌ OneSignal failed to load after 5 seconds');
        return;
      }

      console.log('✅ OneSignal available, setting up...');

      // Get subscription info
      const isPushSupported = await window.OneSignal.Notifications.isPushSupported();
      const permission = await window.OneSignal.Notifications.permission;

      console.log('📱 Push supported:', isPushSupported);
      console.log('📱 Permission:', permission);

      if (!permission) {
        console.log('🔔 Requesting notification permission...');
        const result = await window.OneSignal.Notifications.requestPermission();
        console.log('📱 Permission result:', result);
      }

      // Set external user ID using login (this is the correct way in v16)
      // This links the browser to your user ID so backend can send to this user
      try {
        console.log('🔄 Logging in user to OneSignal:', userId);
        await window.OneSignal.login(userId.toString());
        console.log('✅ User logged in to OneSignal');

        // Get OneSignal player ID for debugging
        const onesignalId = await window.OneSignal.User.onesignalId;
        console.log('📱 OneSignal ID:', onesignalId);

        return true;
      } catch (error) {
        console.error('❌ OneSignal login error:', error);
        console.log('🔍 Error details:', error.message);
        // Don't throw - user may already be logged in
        return false;
      }
    } catch (error) {
      console.error('❌ Failed to link user to OneSignal:', error);
    }
  };

  return {
    linkUserToOneSignal
  };
};
