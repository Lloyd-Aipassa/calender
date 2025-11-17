// Global Pusher service for chat notifications
import Pusher from 'pusher-js';

let pusherInstance = null;
let currentChannel = null;
let currentUserId = null;
let currentConversationId = null;
let currentCallback = null; // Store the current UI update callback

// Show notification function - works globally
async function showGlobalNotification(messageData) {
  console.log('🔔 Global notification called:', messageData);
  console.log('📱 document.hasFocus():', document.hasFocus());
  console.log('📱 document.hidden:', document.hidden);
  console.log('📱 document.visibilityState:', document.visibilityState);

  // Check if window is visible - use Page Visibility API
  const isPageVisible = document.visibilityState === 'visible' && document.hasFocus();

  if (isPageVisible) {
    console.log('⏭️ Page is visible and focused - skipping notification');
    return;
  }

  if (!('Notification' in window)) {
    console.log('❌ Notifications not supported');
    return;
  }

  if (Notification.permission !== 'granted') {
    console.log('❌ Notification permission not granted');
    return;
  }

  console.log('✅ Page NOT visible/focused - showing notification');

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

  // Use Service Worker for notifications (works better on mobile and PWA)
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    console.log('✅ Showing notification via Service Worker:', title);
    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification(title, notificationOptions);
      console.log('✅ Service Worker notification shown!');
      return;
    } catch (error) {
      console.error('Service Worker notification failed:', error);
      // Fall through to regular notification
    }
  }

  // Fallback: Regular browser notification (desktop)
  console.log('✅ Showing regular notification:', title);
  try {
    const notification = new Notification(title, notificationOptions);

    notification.onclick = () => {
      window.focus();
      // Navigate to chat page
      window.location.href = '/chat';
      notification.close();
    };

    // Auto-close after 5 seconds
    setTimeout(() => notification.close(), 5000);
    console.log('✅ Regular notification shown!');
  } catch (error) {
    console.error('Regular notification failed:', error);
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
