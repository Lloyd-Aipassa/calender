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
  console.log('🔔 Global notification called:', messageData);
  console.log('📱 document.hasFocus():', document.hasFocus());
  console.log('📱 document.hidden:', document.hidden);
  console.log('📱 document.visibilityState:', document.visibilityState);

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

  console.log('📢 Notification check - page state:', { visible: isPageVisible, focused: isPageFocused });

  // ALWAYS show notification regardless of focus state (for testing)
  // We'll rely on the OS to not show duplicates
  console.log('✅ Showing notification (focus detection disabled for testing)');

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
    console.log('✅ Using Service Worker notification (mobile compatible)');
    try {
      await swRegistration.showNotification(title, notificationOptions);
      console.log('✅ Service Worker notification shown');
    } catch (error) {
      console.error('❌ Service Worker notification failed:', error);
    }
  } else {
    // Fallback to direct notification for older desktop browsers
    console.log('✅ Using direct notification (desktop fallback)');
    try {
      const notification = new Notification(title, notificationOptions);
      console.log('✅ Notification created:', notification);

      notification.onclick = () => {
        console.log('Notification clicked!');
        window.focus();
        // Navigate to chat if possible
        if (window.location.pathname !== '/chat') {
          window.location.href = '/chat';
        }
      };
    } catch (error) {
      console.error('❌ Direct notification failed:', error);
    }
  }
}

export const usePusher = () => {
  const initPusher = async (userId, apiBase) => {
    // Check if there's already a Pusher instance (from Calendar.vue or previous init)
    if (pusherInstance) {
      console.log('⚠️ Pusher already initialized, reusing existing instance');

      // But still subscribe to user channel if not already done
      if (!userChannel) {
        const userChannelName = `user-${userId}`;
        console.log('📺 Subscribing to user notification channel (late):', userChannelName);
        userChannel = pusherInstance.subscribe(userChannelName);

        userChannel.bind('pusher:subscription_succeeded', () => {
          console.log('✅ Subscribed to user notification channel:', userChannelName);
        });

        userChannel.bind('chat-message', (data) => {
          console.log('📨 Received chat message on user channel:', data);
          const isOwnMessage = parseInt(data.sender_id) === parseInt(userId);
          if (!isOwnMessage) {
            console.log('🔔 Triggering notification from user channel...');
            showGlobalNotification(data);
          }
        });
      }

      return pusherInstance;
    }

    console.log('Initializing NEW Pusher instance...');
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

    // Subscribe to user-level channel for notifications (like Calendar.vue does)
    // This channel is ALWAYS active, even when chat is not open
    const userChannelName = `user-${userId}`;
    console.log('📺 Subscribing to user notification channel:', userChannelName);
    userChannel = pusherInstance.subscribe(userChannelName);

    userChannel.bind('pusher:subscription_succeeded', () => {
      console.log('✅ Subscribed to user notification channel:', userChannelName);
    });

    userChannel.bind('pusher:subscription_error', (err) => {
      console.error('❌ User channel subscription error:', err);
    });

    // Listen for chat messages on user channel (for notifications)
    userChannel.bind('chat-message', (data) => {
      console.log('📨 Received chat message on user channel:', data);

      // Check if message is from another user
      const isOwnMessage = parseInt(data.sender_id) === parseInt(userId);
      console.log('Is own message?', isOwnMessage, '(sender:', data.sender_id, 'current:', userId, ')');

      if (!isOwnMessage) {
        // Always show notification for messages from others
        console.log('🔔 Triggering notification from user channel...');
        showGlobalNotification(data);
      } else {
        console.log('⏭️ Skipping own message from user channel');
      }
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
        console.log('📨 Conversation channel received message:', data);

        // Check if message is from another user
        const isOwnMessage = parseInt(data.sender_id) === parseInt(currentUserId);
        console.log('Is own message?', isOwnMessage, '(sender:', data.sender_id, 'current:', currentUserId, ')');

        if (!isOwnMessage) {
          // DON'T show notification here - user channel handles that
          // Only trigger UI update callback when chat is open
          if (currentCallback) {
            console.log('📲 Calling UI update callback (conversation channel)');
            currentCallback(data);
          }
        } else {
          console.log('⏭️ Skipping own message (conversation channel)');
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
