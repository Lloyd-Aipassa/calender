// OneSignal composable to link user to OneSignal player
export const useOneSignal = () => {
  const config = useRuntimeConfig();

  const linkUserToOneSignal = async (userId) => {
    if (!process.client || !window.OneSignal) {
      console.warn('OneSignal not available');
      return;
    }

    try {
      // Wait for OneSignal to be ready
      await window.OneSignal.User.addAlias('external_id', userId.toString());
      console.log('✅ User linked to OneSignal:', userId);

      const playerId = await window.OneSignal.User.PushSubscription.id;
      console.log('📱 OneSignal Player ID:', playerId);

      return playerId;
    } catch (error) {
      console.error('Failed to link user to OneSignal:', error);
    }
  };

  return {
    linkUserToOneSignal
  };
};
