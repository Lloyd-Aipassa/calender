// Global Pusher service for chat notifications
import Pusher from 'pusher-js';

let pusherInstance = null;
let currentChannel = null;
let currentUserId = null;

export const usePusher = () => {
  const initPusher = async (userId, apiBase) => {
    if (pusherInstance) {
      console.log('Pusher already initialized');
      return pusherInstance;
    }

    console.log('Initializing global Pusher service...');
    currentUserId = userId;

    const token = localStorage.getItem('authToken');
    if (!token) {
      console.error('No auth token found');
      return null;
    }

    pusherInstance = new Pusher('eca46c4499768c752eed', {
      cluster: 'eu',
      authEndpoint: `${apiBase}/chat/pusher_auth.php`,
      auth: {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    });

    pusherInstance.connection.bind('connected', () => {
      console.log('Global Pusher connected!');
    });

    pusherInstance.connection.bind('error', (err) => {
      console.error('Global Pusher error:', err);
    });

    return pusherInstance;
  };

  const subscribeToConversation = (conversationId, onNewMessage) => {
    if (!pusherInstance) {
      console.error('Pusher not initialized');
      return;
    }

    // Unsubscribe from previous channel if any
    if (currentChannel) {
      pusherInstance.unsubscribe(currentChannel.name);
      currentChannel = null;
    }

    const channelName = `private-conversation-${conversationId}`;
    console.log('Subscribing to:', channelName);

    currentChannel = pusherInstance.subscribe(channelName);

    currentChannel.bind('pusher:subscription_succeeded', () => {
      console.log('Successfully subscribed to', channelName);
    });

    currentChannel.bind('pusher:subscription_error', (err) => {
      console.error('Subscription error:', err);
    });

    currentChannel.bind('new-message', (data) => {
      console.log('📨 New message received:', data);

      // Only trigger callback for messages from other users
      if (parseInt(data.sender_id) !== parseInt(currentUserId)) {
        onNewMessage(data);
      }
    });
  };

  const unsubscribeFromConversation = () => {
    if (currentChannel) {
      pusherInstance.unsubscribe(currentChannel.name);
      currentChannel = null;
      console.log('Unsubscribed from current channel');
    }
  };

  const disconnect = () => {
    if (pusherInstance) {
      pusherInstance.disconnect();
      pusherInstance = null;
      currentChannel = null;
      console.log('Pusher disconnected');
    }
  };

  return {
    initPusher,
    subscribeToConversation,
    unsubscribeFromConversation,
    disconnect,
    getInstance: () => pusherInstance
  };
};
