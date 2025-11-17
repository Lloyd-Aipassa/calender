<template>
  <div class="chat-page">
    <div class="chat-container">
      <!-- Sidebar met conversations -->
      <div class="sidebar" :class="{ hidden: !showSidebar }">
        <div class="sidebar-header">
          <h3>Berichten</h3>
          <button @click="showNewChatModal = true" class="new-chat-btn">+</button>
        </div>

        <div v-if="conversations.length === 0" class="empty-state">
          Nog geen gesprekken
        </div>

        <div
          v-for="conv in conversations"
          :key="conv.id"
          @click="selectConversation(conv.id)"
          :class="['conversation', { active: selectedConv === conv.id }]"
        >
          <div class="conv-content">
            <strong>{{ getConversationName(conv) }}</strong>
            <p class="last-message">{{ conv.last_message || 'Geen berichten' }}</p>
          </div>
          <div class="conv-meta">
            <span v-if="conv.unread_count > 0" class="badge">
              {{ conv.unread_count }}
            </span>
            <span v-if="conv.last_message_time" class="time">
              {{ formatDate(conv.last_message_time) }}
            </span>
          </div>
        </div>
      </div>

      <!-- Main chat area -->
      <div class="main-chat">
        <div v-if="!selectedConv" class="no-conversation">
          <p>Selecteer een gesprek om te starten</p>
        </div>

        <template v-else>
          <!-- Chat header -->
          <div class="chat-header">
            <button @click="toggleSidebar" class="back-btn">←</button>
            <h3>{{ getCurrentConversationName() }}</h3>
          </div>

          <!-- Messages -->
          <div class="messages" ref="messagesContainer">
            <div
              v-for="msg in messages"
              :key="msg.id"
              :class="['message', msg.sender_id === currentUserId ? 'own' : 'other']"
            >
              <div v-if="msg.sender_id !== currentUserId" class="sender">
                {{ msg.sender_name }}
              </div>
              <div class="content">{{ msg.message }}</div>
              <div class="time">{{ formatTime(msg.created_at) }}</div>
            </div>
          </div>

          <!-- Input area -->
          <div class="input-area">
            <input
              v-model="newMessage"
              @keyup.enter="sendMessage"
              placeholder="Type een bericht..."
              :disabled="sending"
            />
            <button
              @click="sendMessage"
              :disabled="!newMessage || !newMessage.trim() || sending"
              class="send-btn">
              Verstuur
            </button>
          </div>
        </template>
      </div>
    </div>

    <!-- New chat modal -->
    <div v-if="showNewChatModal" class="modal-overlay" @click="closeNewChatModal">
      <div class="modal" @click.stop>
        <h3>Nieuw gesprek starten</h3>
        <p>Selecteer een gebruiker om mee te chatten:</p>

        <select v-model="newChatUserId" class="user-select">
          <option value="">-- Kies een gebruiker --</option>
          <option v-for="user in availableUsers" :key="user.id" :value="user.id">
            {{ user.name }} ({{ user.email }})
          </option>
        </select>

        <div class="modal-buttons">
          <button @click="closeNewChatModal" class="btn-cancel">Annuleren</button>
          <button @click="startNewConversation" :disabled="!newChatUserId" class="btn-primary">
            Start gesprek
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import Pusher from 'pusher-js';

const apiBase = 'https://calender.brooklynwebdesign.nl/api/endpoints';

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

let pusher = null;
let currentChannel = null;
const messagesContainer = ref(null);

// Helper om auth token te krijgen
function getAuthToken() {
  return localStorage.getItem('authToken');
}

// Request notification permission
async function requestNotificationPermission() {
  if ('Notification' in window && Notification.permission === 'default') {
    try {
      const permission = await Notification.requestPermission();
      console.log('Notification permission:', permission);
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    }
  }
}

// Show browser notification (same approach as Calendar.vue - works better!)
async function showNotification(messageData) {
  console.log('🔔 showNotification called:', messageData);

  // Only show notification if window is NOT in focus
  if (document.hasFocus()) {
    console.log('⏭️ Window has focus - skipping notification (user can see messages)');
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

  console.log('✅ Window NOT in focus - showing notification');

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
      navigateTo('/chat');
      notification.close();
    };

    // Auto-close after 5 seconden
    setTimeout(() => notification.close(), 5000);
    console.log('✅ Regular notification shown!');
  } catch (error) {
    console.error('Regular notification failed:', error);
  }
}

// Show mobile in-app notification banner
function showMobileNotificationBanner(messageData) {
  console.log('showMobileNotificationBanner called');

  // Remove existing banner if any
  const existingBanner = document.querySelector('.mobile-notification-banner');
  if (existingBanner) {
    console.log('Removing existing banner');
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

  console.log('Banner created:', banner);

  // Add vibration feedback
  if ('vibrate' in navigator) {
    console.log('Vibrating device...');
    navigator.vibrate([200, 100, 200]);
  }

  // Add to page
  console.log('Appending banner to body...');
  document.body.appendChild(banner);
  console.log('Banner appended. Total banners in DOM:', document.querySelectorAll('.mobile-notification-banner').length);

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

// Setup Pusher
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
    console.error('Failed to get user info:', error);
    navigateTo('/login');
    return;
  }

  // Initialiseer Pusher
  pusher = new Pusher('eca46c4499768c752eed', {
    cluster: 'eu',
    authEndpoint: `${apiBase}/chat/pusher_auth.php`,
    auth: {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  });

  // Debug Pusher
  pusher.connection.bind('connected', () => {
    console.log('Pusher connected!');
  });

  pusher.connection.bind('error', (err) => {
    console.error('Pusher error:', err);
  });

  pusher.connection.bind('state_change', (states) => {
    console.log('Pusher state:', states.current);
  });

  // Laad conversations
  await loadConversations();

  // Laad beschikbare users
  await loadAvailableUsers();
});

async function loadConversations() {
  try {
    const response = await $fetch(`${apiBase}/chat/get_conversations.php`, {
      headers: { Authorization: `Bearer ${getAuthToken()}` }
    });
    conversations.value = response.conversations;
  } catch (error) {
    console.error('Failed to load conversations:', error);
  }
}

async function loadAvailableUsers() {
  try {
    const response = await $fetch(`${apiBase}/chat/get_users.php`, {
      headers: { Authorization: `Bearer ${getAuthToken()}` }
    });
    availableUsers.value = response.users;
  } catch (error) {
    console.error('Failed to load users:', error);
  }
}

async function selectConversation(convId) {
  selectedConv.value = convId;

  // Hide sidebar on mobile when selecting conversation
  if (window.innerWidth <= 768) {
    showSidebar.value = false;
  }

  // Unsubscribe van vorige channel
  if (currentChannel) {
    pusher.unsubscribe(currentChannel.name);
  }

  // Laad messages
  try {
    const response = await $fetch(
      `${apiBase}/chat/get_messages.php?conversation_id=${convId}`,
      { headers: { Authorization: `Bearer ${getAuthToken()}` } }
    );
    messages.value = response.messages;
  } catch (error) {
    console.error('Failed to load messages:', error);
    return;
  }

  // Subscribe naar nieuwe messages via Pusher
  const channelName = `private-conversation-${convId}`;
  console.log('📡 Subscribing to:', channelName);

  currentChannel = pusher.subscribe(channelName);

  currentChannel.bind('pusher:subscription_succeeded', () => {
    console.log('Successfully subscribed to', channelName);
  });

  currentChannel.bind('pusher:subscription_error', (err) => {
    console.error('Subscription error:', err);
  });

  currentChannel.bind('new-message', (data) => {
    console.log('📨 Received new message:', data);
    console.log('Current user ID:', currentUserId.value, 'Sender ID:', data.sender_id);
    console.log('Type check:', typeof currentUserId.value, typeof data.sender_id);

    // Convert both to numbers for comparison
    const isOwnMessage = parseInt(data.sender_id) === parseInt(currentUserId.value);
    console.log('Is own message?', isOwnMessage);

    // Voeg nieuw bericht toe (alleen als het niet van jezelf is - want die hebben we al lokaal)
    if (!isOwnMessage) {
      messages.value.push(data);
      scrollToBottom();

      // Toon notificatie als het venster niet in focus is
      console.log('Calling showNotification...');
      showNotification(data);
    } else {
      console.log('Skipping notification - own message');
    }
  });

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
    console.log('📤 Sending message to server...');
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
    console.log('Message sent, server response:', response);
  } catch (error) {
    console.error('Failed to send message:', error);
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
    console.error('Failed to start conversation:', error);
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

function formatTime(timestamp) {
  return new Date(timestamp).toLocaleTimeString('nl-NL', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

function formatDate(timestamp) {
  const date = new Date(timestamp);
  const today = new Date();

  if (date.toDateString() === today.toDateString()) {
    return formatTime(timestamp);
  }

  return date.toLocaleDateString('nl-NL', {
    day: 'numeric',
    month: 'short'
  });
}

function scrollToBottom() {
  nextTick(() => {
    const container = messagesContainer.value;
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

onUnmounted(() => {
  if (pusher) {
    pusher.disconnect();
  }
});
</script>

<style scoped>
.chat-page {
  min-height: calc(100vh - 64px);
  padding: 20px;
  background: #f5f5f5;
}

.chat-container {
  display: flex;
  height: calc(100vh - 104px);
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

/* Sidebar */
.sidebar {
  width: 320px;
  border-right: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  padding: 20px;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #fff;
}

.sidebar-header h3 {
  margin: 0;
  font-size: 20px;
}

.new-chat-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #4caf50;
  color: white;
  border: none;
  font-size: 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.new-chat-btn:hover {
  background: #45a049;
}

.empty-state {
  padding: 40px 20px;
  text-align: center;
  color: #999;
}

.conversation {
  padding: 15px 20px;
  cursor: pointer;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  transition: background 0.2s;
}

.conversation:hover {
  background: #f8f8f8;
}

.conversation.active {
  background: #e3f2fd;
}

.conv-content {
  flex: 1;
  min-width: 0;
}

.conv-content strong {
  display: block;
  margin-bottom: 4px;
  font-size: 15px;
}

.last-message {
  margin: 0;
  font-size: 13px;
  color: #666;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.conv-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.badge {
  background: #ff5722;
  color: white;
  border-radius: 12px;
  padding: 2px 8px;
  font-size: 12px;
  font-weight: bold;
}

.time {
  font-size: 11px;
  color: #999;
}

/* Main chat */
.main-chat {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.no-conversation {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 18px;
}

.chat-header {
  padding: 20px;
  border-bottom: 1px solid #e0e0e0;
  background: #fafafa;
  display: flex;
  align-items: center;
  gap: 12px;
}

.chat-header h3 {
  margin: 0;
  font-size: 18px;
  flex: 1;
}

.back-btn {
  display: none;
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  align-items: center;
  justify-content: center;
  color: #666;
}

.messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background: #fafafa;
}

.message {
  margin-bottom: 20px;
  max-width: 60%;
  animation: fadeIn 0.2s;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.message.own {
  margin-left: auto;
}

.message.other {
  margin-right: auto;
}

.message .sender {
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
  font-weight: 500;
}

.message .content {
  background: white;
  padding: 10px 15px;
  border-radius: 12px;
  word-wrap: break-word;
  box-shadow: 0 1px 2px rgba(0,0,0,0.1);
}

.message.own .content {
  background: #4caf50;
  color: white;
  border-bottom-right-radius: 4px;
}

.message.other .content {
  background: white;
  border-bottom-left-radius: 4px;
}

.message .time {
  font-size: 11px;
  color: #999;
  margin-top: 4px;
}

.message.own .time {
  text-align: right;
}

/* Input area */
.input-area {
  display: flex;
  gap: 10px;
  padding: 20px;
  border-top: 1px solid #e0e0e0;
  background: white;
}

.input-area input {
  flex: 1;
  padding: 12px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 24px;
  font-size: 14px;
  outline: none;
}

.input-area input:focus {
  border-color: #4caf50;
}

.input-area button {
  padding: 12px 24px;
  background: #4caf50;
  color: white;
  border: none;
  border-radius: 24px;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.2s;
}

.input-area button:hover:not(:disabled) {
  background: #45a049;
}

.input-area button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  padding: 30px;
  border-radius: 8px;
  width: 400px;
  max-width: 90%;
}

.modal h3 {
  margin: 0 0 10px 0;
}

.modal p {
  color: #666;
  margin-bottom: 20px;
}

.modal input,
.user-select {
  width: 100%;
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 14px;
  margin-bottom: 20px;
}

.user-select {
  cursor: pointer;
  background: white;
}

.user-select:focus {
  outline: none;
  border-color: #4caf50;
}

.modal-buttons {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.modal-buttons button {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}

.btn-cancel {
  background: #f5f5f5;
  color: #333;
}

.btn-cancel:hover {
  background: #e0e0e0;
}

.btn-primary {
  background: #4caf50;
  color: white;
}

.btn-primary:hover {
  background: #45a049;
}

/* Responsive */
@media (max-width: 768px) {
  .chat-page {
    padding: 0;
  }

  .chat-container {
    height: calc(100vh - 64px);
    border-radius: 0;
  }

  .sidebar {
    width: 100%;
    position: absolute;
    z-index: 10;
    transition: transform 0.3s;
  }

  .sidebar.hidden {
    transform: translateX(-100%);
  }

  .main-chat {
    width: 100%;
  }

  .back-btn {
    display: flex !important;
  }

  .message {
    max-width: 85%;
  }

  .sidebar-header h3 {
    font-size: 18px;
  }

  .new-chat-btn {
    width: 32px;
    height: 32px;
    font-size: 20px;
  }

  .conversation {
    padding: 12px 15px;
    background-color: #fff;
  }

  .conv-content strong {
    font-size: 14px;
  }

  .last-message {
    font-size: 12px;
  }

  .input-area {
    padding: 15px;
  }

  .input-area input {
    font-size: 16px; /* Prevents zoom on iOS */
  }

  .modal {
    width: 90%;
    padding: 20px;
  }

  .modal h3 {
    font-size: 18px;
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
