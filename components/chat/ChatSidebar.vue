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

@media (max-width: 768px) {
  .sidebar {
    width: 100%;
    position: absolute;
    z-index: 10;
    background: white;
    height: 100%;
    transition: transform 0.3s;
  }

  .sidebar.hidden {
    transform: translateX(-100%);
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
}
</style>
