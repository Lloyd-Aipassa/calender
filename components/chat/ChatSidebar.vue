<template>
  <div class="sidebar" :class="{ hidden: !showSidebar }">
    <div class="sidebar-header">
      <h3>Berichten</h3>
      <button @click="$emit('show-new-chat-modal')" class="new-chat-btn">+</button>
    </div>

    <div v-if="conversations.length === 0" class="empty-state">
      Nog geen gesprekken
    </div>

    <div
      v-for="conv in conversations"
      :key="conv.id"
      @click="$emit('select-conversation', conv.id)"
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
</template>

<script setup>
const props = defineProps({
  conversations: {
    type: Array,
    required: true
  },
  selectedConv: {
    type: Number,
    default: null
  },
  showSidebar: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(['select-conversation', 'show-new-chat-modal']);

function getConversationName(conv) {
  if (!conv.participants || conv.participants.length === 0) {
    return 'Unknown';
  }
  return conv.participants[0].name || conv.participants[0].email;
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
</script>

<style scoped>
/* Sidebar */
.sidebar {
  width: 340px;
  border-right: 1px solid rgba(26, 22, 20, 0.08);
  display: flex;
  flex-direction: column;
  background: #ffffff;
}

.sidebar-header {
  padding: 24px 20px;
  border-bottom: 1px solid rgba(26, 22, 20, 0.06);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #ffffff;
}

.sidebar-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #1a1614;
  letter-spacing: -0.02em;
}

.new-chat-btn {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: linear-gradient(135deg, #e07a5f 0%, #d4644a 100%);
  color: white;
  border: none;
  font-size: 22px;
  font-weight: 300;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(224, 122, 95, 0.3);
}

.new-chat-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(224, 122, 95, 0.4);
}

.new-chat-btn:active {
  transform: translateY(0);
}

.empty-state {
  padding: 48px 24px;
  text-align: center;
  color: #8a8582;
  font-size: 14px;
}

.conversation {
  padding: 16px 20px;
  cursor: pointer;
  border-bottom: 1px solid rgba(26, 22, 20, 0.04);
  display: flex;
  justify-content: space-between;
  transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.conversation::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: #e07a5f;
  opacity: 0;
  transition: opacity 150ms ease;
}

.conversation:hover {
  background: #faf9f7;
}

.conversation:hover::before {
  opacity: 0.5;
}

.conversation.active {
  background: linear-gradient(90deg, rgba(224, 122, 95, 0.08) 0%, rgba(224, 122, 95, 0.02) 100%);
}

.conversation.active::before {
  opacity: 1;
}

.conv-content {
  flex: 1;
  min-width: 0;
}

.conv-content strong {
  display: block;
  margin-bottom: 4px;
  font-size: 14px;
  font-weight: 600;
  color: #1a1614;
}

.last-message {
  margin: 0;
  font-size: 13px;
  color: #8a8582;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.4;
}

.conv-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
  margin-left: 12px;
}

.badge {
  background: linear-gradient(135deg, #e07a5f 0%, #d4644a 100%);
  color: white;
  border-radius: 10px;
  padding: 2px 8px;
  font-size: 11px;
  font-weight: 700;
  min-width: 20px;
  text-align: center;
  box-shadow: 0 2px 6px rgba(224, 122, 95, 0.3);
}

.time {
  font-size: 11px;
  color: #b5b0ab;
  font-weight: 500;
}

/* Conversation list animation */
.conversation {
  animation: slideIn 0.3s ease-out backwards;
}

.conversation:nth-child(1) { animation-delay: 0.05s; }
.conversation:nth-child(2) { animation-delay: 0.1s; }
.conversation:nth-child(3) { animation-delay: 0.15s; }
.conversation:nth-child(4) { animation-delay: 0.2s; }
.conversation:nth-child(5) { animation-delay: 0.25s; }

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-12px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@media (max-width: 768px) {
  .sidebar {
    width: 100%;
    position: absolute;
    z-index: 10;
    background: #ffffff;
    height: 100%;
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .sidebar.hidden {
    transform: translateX(-100%);
  }

  .sidebar-header {
    padding: 20px 16px;
  }

  .sidebar-header h3 {
    font-size: 17px;
  }

  .new-chat-btn {
    width: 36px;
    height: 36px;
    font-size: 20px;
    border-radius: 10px;
  }

  .conversation {
    padding: 14px 16px;
  }

  .conv-content strong {
    font-size: 14px;
  }

  .last-message {
    font-size: 12px;
  }
}
</style>
