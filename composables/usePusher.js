// Global Pusher service for chat notifications
import Pusher from 'pusher-js';

let pusherInstance = null;
let currentChannel = null; // Current conversation channel for UI updates
let userChannel = null; // User-level channel for notifications (always active)
let currentUserId = null;
let currentConversationId = null;
let currentCallback = null; // Store the current UI update callback
let swRegistration = null; // Service Worker registration for notifications

// Show notification function - works globally
async function showGlobalNotification(messageData) {

  // Check if we should show notification
  // Skip notification ONLY if:
  // 1. Page is visible (not minimized/background)
  // 2. Page has focus (actively looking at it)
  // This way notifications show when:
  // - Different tab is active
  // - Different window is active
  // - Browser is minimized
  const isPageVisible = document.visibilityState === 'visible';
  const isPageFocused = document.hasFocus();


  // ALWAYS show notification regardless of focus state (for testing)
  // We'll rely on the OS to not show duplicates

  if (!('Notification' in window)) {
    return;
  }

  if (Notification.permission !== 'granted') {
    return;
  }

  const title = `Nieuw bericht van ${messageData.sender_name}`;
  const notificationOptions = {
    body: messageData.message,
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: `chat-${messageData.id}-${Date.now()}`, // Unique per message to show all notifications
    vibrate: [200, 100, 200],
    requireInteraction: false,
    data: {
      url: '/chat',
      conversation_id: messageData.conversation_id
    }
  };

  // Use Service Worker for notifications (works on mobile!)
  if (swRegistration && swRegistration.showNotification) {
    try {
      await swRegistration.showNotification(title, notificationOptions);
    } catch (error) {
    }
  } else {
    // Fallback to direct notification for older desktop browsers
    try {
      const notification = new Notification(title, notificationOptions);

      notification.onclick = () => {
        window.focus();
        // Navigate to chat if possible
        if (window.location.pathname !== '/chat') {
          window.location.href = '/chat';
        }
      };
    } catch (error) {
    }
  }
}

export const usePusher = () => {
  const initPusher = async (userId, apiBase) => {
    // Check if there's already a Pusher instance (from Calendar.vue or previous init)
    if (pusherInstance) {

      // But still subscribe to user channel if not already done
      if (!userChannel) {
        const userChannelName = `user-${userId}`;
        userChannel = pusherInstance.subscribe(userChannelName);

        userChannel.bind('pusher:subscription_succeeded', () => {
        });

        userChannel.bind('chat-message', (data) => {
          const isOwnMessage = parseInt(data.sender_id) === parseInt(userId);
          if (!isOwnMessage) {
            showGlobalNotification(data);
          }
        });
      }

      return pusherInstance;
    }

    currentUserId = userId;

    // Register Service Worker (same as Calendar.vue)
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        swRegistration = registration;
      } catch (error) {
      }
    }

    const token = localStorage.getItem('authToken');
    if (!token) {
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
    });

    pusherInstance.connection.bind('error', (err) => {
    });

    // Subscribe to user-level channel for notifications (like Calendar.vue does)
    // This channel is ALWAYS active, even when chat is not open
    const userChannelName = `user-${userId}`;
    userChannel = pusherInstance.subscribe(userChannelName);

    userChannel.bind('pusher:subscription_succeeded', () => {
    });

    userChannel.bind('pusher:subscription_error', (err) => {
    });

    // Listen for chat messages on user channel (for notifications)
    userChannel.bind('chat-message', (data) => {

      // Check if message is from another user
      const isOwnMessage = parseInt(data.sender_id) === parseInt(userId);

      if (!isOwnMessage) {
        // Always show notification for messages from others
        showGlobalNotification(data);
      } else {
      }
    });

    return pusherInstance;
  };

  const subscribeToConversation = (conversationId, onNewMessage) => {
    // Wait for Pusher to be initialized
    const trySubscribe = () => {
      if (!pusherInstance) {
        setTimeout(trySubscribe, 100);
        return;
      }


      // Check if already subscribed to this conversation
      if (currentConversationId === conversationId && currentChannel) {
        currentCallback = onNewMessage; // Update the callback for UI updates
        return;
      }

      // Unsubscribe from previous channel if any
      if (currentChannel) {
        // Unbind all events first to prevent memory leaks
        currentChannel.unbind_all();
        pusherInstance.unsubscribe(currentChannel.name);
        currentChannel = null;
      }

      const channelName = `private-conversation-${conversationId}`;
      currentConversationId = conversationId;
      currentCallback = onNewMessage; // Store the callback

      currentChannel = pusherInstance.subscribe(channelName);

      currentChannel.bind('pusher:subscription_succeeded', () => {
      });

      currentChannel.bind('pusher:subscription_error', (err) => {
      });

      currentChannel.bind('new-message', (data) => {

        // Check if message is from another user
        const isOwnMessage = parseInt(data.sender_id) === parseInt(currentUserId);

        if (!isOwnMessage) {
          // DON'T show notification here - user channel handles that
          // Only trigger UI update callback when chat is open
          if (currentCallback) {
            currentCallback(data);
          }
        } else {
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
    }
  };

  const disconnect = () => {
    if (pusherInstance) {
      // Unsubscribe from user channel
      if (userChannel) {
        userChannel.unbind_all();
        pusherInstance.unsubscribe(userChannel.name);
        userChannel = null;
      }

      pusherInstance.disconnect();
      pusherInstance = null;
      currentChannel = null;
      currentConversationId = null;
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
