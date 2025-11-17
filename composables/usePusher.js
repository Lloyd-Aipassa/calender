// Global Pusher service for chat notifications
import Pusher from 'pusher-js';

let pusherInstance = null;
let currentChannel = null;
let currentUserId = null;
let currentConversationId = null;
let currentCallback = null; // Store the current UI update callback
let swRegistration = null; // Service Worker registration for notifications

// Show notification function - works globally
async function showGlobalNotification(messageData) {
  console.log('🔔 Global notification called:', messageData);
  console.log('📱 document.hasFocus():', document.hasFocus());
  console.log('📱 document.hidden:', document.hidden);
  console.log('📱 document.visibilityState:', document.visibilityState);

  // Only show notification if page is NOT visible AND focused
  const isPageVisible = document.visibilityState === 'visible';
  const isPageFocused = document.hasFocus();

  if (isPageVisible && isPageFocused) {
    console.log('⏭️ Page is visible AND focused - skipping notification (user can see the page)');
    return;
  }

  console.log('📢 Showing notification - page state:', { visible: isPageVisible, focused: isPageFocused });

  if (!('Notification' in window)) {
    console.log('❌ Notifications not supported');
    return;
  }

  if (Notification.permission !== 'granted') {
    console.log('❌ Notification permission not granted');
    return;
  }

  const title = `Nieuw bericht van ${messageData.sender_name}`;
  const notificationOptions = {
    body: messageData.message,
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: `chat-${messageData.conversation_id}`,
    vibrate: [200, 100, 200],
    requireInteraction: false,
    data: {
      url: '/chat',
      conversation_id: messageData.conversation_id
    }
  };

  // EXACT COPY of Calendar.vue notification logic
  // Gebruik Service Worker voor notificaties (werkt beter op mobiel)
  if (swRegistration && swRegistration.showNotification) {
    console.log('✅ Toon notificatie via Service Worker:', title);
    try {
      await swRegistration.showNotification(title, notificationOptions);
    } catch (error) {
      console.error('Service Worker notification failed:', error);
      // Fallback naar normale notificatie
      new Notification(title, notificationOptions);
    }
  } else {
    // Fallback voor desktop browsers
    console.log('✅ Toon notificatie direct:', title);
    new Notification(title, notificationOptions);
  }
}

export const usePusher = () => {
  const initPusher = async (userId, apiBase) => {
    if (pusherInstance) {
      console.log('Pusher already initialized');
      return pusherInstance;
    }

    console.log('Initializing global Pusher service...');
    currentUserId = userId;

    // Register Service Worker (same as Calendar.vue)
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        swRegistration = registration;
        console.log('✅ Service Worker registered for notifications');
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }

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
    // Wait for Pusher to be initialized
    const trySubscribe = () => {
      if (!pusherInstance) {
        console.log('⏳ Pusher not yet initialized, waiting...');
        setTimeout(trySubscribe, 100);
        return;
      }

      console.log('✅ Pusher ready, subscribing now...');

      // Check if already subscribed to this conversation
      if (currentConversationId === conversationId && currentChannel) {
        console.log('⚠️ Already subscribed to this conversation, updating callback');
        currentCallback = onNewMessage; // Update the callback for UI updates
        return;
      }

      // Unsubscribe from previous channel if any
      if (currentChannel) {
        console.log('🔄 Unsubscribing from previous channel:', currentChannel.name);
        // Unbind all events first to prevent memory leaks
        currentChannel.unbind_all();
        pusherInstance.unsubscribe(currentChannel.name);
        currentChannel = null;
      }

      const channelName = `private-conversation-${conversationId}`;
      console.log('🌍 Global service subscribing to:', channelName);
      currentConversationId = conversationId;
      currentCallback = onNewMessage; // Store the callback

      currentChannel = pusherInstance.subscribe(channelName);

      currentChannel.bind('pusher:subscription_succeeded', () => {
        console.log('✅ Global service subscribed to', channelName);
      });

      currentChannel.bind('pusher:subscription_error', (err) => {
        console.error('❌ Global subscription error:', err);
      });

      currentChannel.bind('new-message', (data) => {
        console.log('📨 Global service received message:', data);

        // Check if message is from another user
        const isOwnMessage = parseInt(data.sender_id) === parseInt(currentUserId);
        console.log('Is own message?', isOwnMessage, '(sender:', data.sender_id, 'current:', currentUserId, ')');

        if (!isOwnMessage) {
          // Always show notification (global service handles this)
          console.log('🔔 Triggering global notification...');
          showGlobalNotification(data);

          // Also trigger callback if provided (for updating UI when chat is open)
          // Use currentCallback instead of onNewMessage closure
          if (currentCallback) {
            console.log('📲 Calling UI update callback');
            currentCallback(data);
          }
        } else {
          console.log('⏭️ Skipping own message');
        }
      });
    };

    // Start trying to subscribe
    trySubscribe();
  };

  const unsubscribeFromConversation = () => {
    if (currentChannel) {
      pusherInstance.unsubscribe(currentChannel.name);
      currentChannel = null;
      currentConversationId = null;
      console.log('🌍 Global service unsubscribed from current channel');
    }
  };

  const disconnect = () => {
    if (pusherInstance) {
      pusherInstance.disconnect();
      pusherInstance = null;
      currentChannel = null;
      currentConversationId = null;
      console.log('🌍 Global Pusher disconnected');
    }
  };

  const getCurrentConversation = () => currentConversationId;

  return {
    initPusher,
    subscribeToConversation,
    unsubscribeFromConversation,
    disconnect,
    getInstance: () => pusherInstance,
    getCurrentConversation
  };
};
