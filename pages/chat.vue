<template>
  <div class="chat-page">
    <div class="chat-container">
      <!-- Sidebar met conversations -->
      <ChatSidebar
        :conversations="conversations"
        :selected-conv="selectedConv"
        :show-sidebar="showSidebar"
        @select-conversation="selectConversation"
        @show-new-chat-modal="showNewChatModal = true"
      />

      <!-- Main chat area -->
      <div class="main-chat">
        <div v-if="!selectedConv" class="no-conversation">
          <p>Selecteer een gesprek om te starten</p>
        </div>

        <template v-else>
          <!-- Chat header -->
          <ChatHeader
            :conversation-name="getCurrentConversationName()"
            @toggle-sidebar="toggleSidebar"
          />

          <!-- Messages -->
          <MessagesList
            ref="messagesListRef"
            :messages="messages"
            :current-user-id="currentUserId"
          />

          <!-- Input area -->
          <ChatInput
            v-model="newMessage"
            :sending="sending"
            @send="sendMessage"
          />
        </template>
      </div>
    </div>

    <!-- New chat modal -->
    <NewChatModal
      :show="showNewChatModal"
      :available-users="availableUsers"
      v-model:selected-user-id="newChatUserId"
      @close="closeNewChatModal"
      @start-conversation="startNewConversation"
    />
  </div>
</template>

<script setup>
import { usePusher } from '~/composables/usePusher';
import ChatSidebar from '~/components/chat/ChatSidebar.vue';
import ChatHeader from '~/components/chat/ChatHeader.vue';
import MessagesList from '~/components/chat/MessagesList.vue';
import ChatInput from '~/components/chat/ChatInput.vue';
import NewChatModal from '~/components/chat/NewChatModal.vue';

const config = useRuntimeConfig();
const apiBase = config.public.apiBaseUrl;

const conversations = ref([]);
const messages = ref([]);
const selectedConv = ref(null);
const newMessage = ref('');
const currentUserId = ref(null);
const sending = ref(false);
const showNewChatModal = ref(false);
const newChatUserId = ref('');
const availableUsers = ref([]);
const showSidebar = ref(true);

// Use global Pusher service instead of local instance
const { subscribeToConversation, unsubscribeFromConversation } = usePusher();
const messagesListRef = ref(null);

// Helper om auth token te krijgen
function getAuthToken() {
  return localStorage.getItem('authToken');
}

// Request notification permission
async function requestNotificationPermission() {
  if ('Notification' in window && Notification.permission === 'default') {
    try {
      const permission = await Notification.requestPermission();
    } catch (error) {
    }
  }
}

// Mobile in-app notification banner (not currently used - global service handles notifications)
function showMobileNotificationBanner(messageData) {

  // Remove existing banner if any
  const existingBanner = document.querySelector('.mobile-notification-banner');
  if (existingBanner) {
    existingBanner.remove();
  }

  // Create notification banner
  const banner = document.createElement('div');
  banner.className = 'mobile-notification-banner';
  banner.innerHTML = `
    <div class="notification-content">
      <div class="notification-header">
        <strong>${messageData.sender_name}</strong>
        <button class="notification-close">×</button>
      </div>
      <div class="notification-body">${messageData.message}</div>
    </div>
  `;


  // Add vibration feedback
  if ('vibrate' in navigator) {
    navigator.vibrate([200, 100, 200]);
  }

  // Add to page
  document.body.appendChild(banner);

  // Close button handler
  const closeBtn = banner.querySelector('.notification-close');
  closeBtn.onclick = (e) => {
    e.stopPropagation();
    banner.remove();
  };

  // Auto-remove after 5 seconds
  setTimeout(() => {
    if (banner.parentElement) {
      banner.classList.add('fade-out');
      setTimeout(() => banner.remove(), 300);
    }
  }, 5000);

  // Click banner to dismiss
  banner.onclick = () => {
    banner.remove();
  };
}

// Setup chat page (no longer initializes Pusher - handled globally in layout)
onMounted(async () => {
  // Check if user is logged in
  const token = getAuthToken();
  if (!token) {
    navigateTo('/login');
    return;
  }

  // Request notification permission
  await requestNotificationPermission();

  // Haal huidige user info op
  try {
    const userInfo = await $fetch(`${apiBase}/get_user_info.php`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    currentUserId.value = userInfo.user.id;
  } catch (error) {
    navigateTo('/login');
    return;
  }

  // Laad conversations
  await loadConversations();

  // Laad beschikbare users
  await loadAvailableUsers();
});

// Cleanup: unsubscribe when leaving chat page
// DON'T unsubscribe when leaving chat - global service keeps listening for notifications!
// onUnmounted(() => {
// });

async function loadConversations() {
  try {
    const response = await $fetch(`${apiBase}/chat/get_conversations.php`, {
      headers: { Authorization: `Bearer ${getAuthToken()}` }
    });
    conversations.value = response.conversations;
  } catch (error) {
  }
}

async function loadAvailableUsers() {
  try {
    const response = await $fetch(`${apiBase}/chat/get_users.php`, {
      headers: { Authorization: `Bearer ${getAuthToken()}` }
    });
    availableUsers.value = response.users;
  } catch (error) {
  }
}

async function selectConversation(convId) {
  selectedConv.value = convId;

  // Hide sidebar on mobile when selecting conversation
  if (window.innerWidth <= 768) {
    showSidebar.value = false;
  }

  // Laad messages
  try {
    const response = await $fetch(
      `${apiBase}/chat/get_messages.php?conversation_id=${convId}`,
      { headers: { Authorization: `Bearer ${getAuthToken()}` } }
    );
    messages.value = response.messages;
  } catch (error) {
    return;
  }

  // Subscribe to conversation using global Pusher service
  // The global service will handle notifications even when we navigate away
  subscribeToConversation(convId, (data) => {
    // This callback is for updating the UI when chat is open

    // Add message to the list (only from other users - global service filters this)
    messages.value.push(data);
    scrollToBottom();
  });

  // Scroll naar beneden
  await nextTick();
  scrollToBottom();
}

async function sendMessage() {
  if (!newMessage.value.trim() || sending.value) return;

  sending.value = true;
  const messageText = newMessage.value;
  newMessage.value = '';

  // Voeg bericht direct toe aan UI (optimistic update)
  const tempMessage = {
    id: Date.now(),
    conversation_id: selectedConv.value,
    sender_id: currentUserId.value,
    message: messageText,
    created_at: new Date().toISOString()
  };
  messages.value.push(tempMessage);
  scrollToBottom();

  try {
    const response = await $fetch(`${apiBase}/chat/send_message.php`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        conversation_id: selectedConv.value,
        message: messageText
      })
    });
  } catch (error) {
    // Verwijder optimistic message bij fout
    messages.value = messages.value.filter(m => m.id !== tempMessage.id);
  } finally {
    sending.value = false;
  }
}

async function startNewConversation() {
  if (!newChatUserId.value) return;

  try {
    const response = await $fetch(`${apiBase}/chat/start_conversation.php`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        user_id: parseInt(newChatUserId.value)
      })
    });

    showNewChatModal.value = false;
    newChatUserId.value = '';

    // Reload conversations
    await loadConversations();

    // Select the new conversation
    selectConversation(response.conversation_id);
  } catch (error) {
    alert('Kon gesprek niet starten. Controleer of het user ID correct is.');
  }
}

function getConversationName(conv) {
  if (!conv.participants || conv.participants.length === 0) {
    return 'Unknown';
  }
  return conv.participants[0].name || conv.participants[0].email;
}

function getCurrentConversationName() {
  const conv = conversations.value.find(c => c.id === selectedConv.value);
  return conv ? getConversationName(conv) : '';
}

function scrollToBottom() {
  nextTick(() => {
    const container = messagesListRef.value?.messagesContainer;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  });
}

function closeNewChatModal() {
  showNewChatModal.value = false;
  newChatUserId.value = '';
}

function toggleSidebar() {
  showSidebar.value = !showSidebar.value;
}

// DON'T disconnect Pusher - it's managed globally by the layout!
// onUnmounted(() => {
//   // pusher is now managed by global service
// });
</script>

<style scoped>
.chat-page {
  height: 100%;
  padding: 20px;
  background: #f5f5f5;
  display: flex;
  flex-direction: column;
}

.chat-container {
  display: flex;
  flex: 1;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.main-chat {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.no-conversation {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 18px;
}

/* Responsive */
@media (max-width: 768px) {
  .chat-page {
    padding: 0;
  }

  .chat-container {
    border-radius: 0;
  }

  .main-chat {
    width: 100%;
  }
}

/* Mobile notification banner */
.mobile-notification-banner {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  width: calc(100% - 40px);
  max-width: 400px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  z-index: 10000;
  animation: slideDown 0.3s ease-out;
  cursor: pointer;
}

.mobile-notification-banner.fade-out {
  animation: slideUp 0.3s ease-in;
}

@keyframes slideDown {
  from {
    transform: translateX(-50%) translateY(-100px);
    opacity: 0;
  }
  to {
    transform: translateX(-50%) translateY(0);
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    transform: translateX(-50%) translateY(0);
    opacity: 1;
  }
  to {
    transform: translateX(-50%) translateY(-100px);
    opacity: 0;
  }
}

.mobile-notification-banner .notification-content {
  padding: 16px;
}

.mobile-notification-banner .notification-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.mobile-notification-banner .notification-header strong {
  color: #fa0101;
  font-size: 16px;
}

.mobile-notification-banner .notification-close {
  background: none;
  border: none;
  font-size: 24px;
  color: #999;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background 0.2s;
}

.mobile-notification-banner .notification-close:hover {
  background: #f5f5f5;
}

.mobile-notification-banner .notification-body {
  color: #333;
  font-size: 14px;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
}
</style>
