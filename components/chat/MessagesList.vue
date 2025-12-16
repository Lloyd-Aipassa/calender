<template>
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
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  messages: {
    type: Array,
    required: true
  },
  currentUserId: {
    type: Number,
    required: true
  }
});

const messagesContainer = ref(null);

function formatTime(timestamp) {
  return new Date(timestamp).toLocaleTimeString('nl-NL', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

defineExpose({
  messagesContainer
});
</script>

<style scoped>
.messages {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  background: linear-gradient(180deg, #faf9f7 0%, #f5f3f0 100%);
  scrollbar-width: thin;
  scrollbar-color: #b5b0ab transparent;
}

.messages::-webkit-scrollbar {
  width: 6px;
}

.messages::-webkit-scrollbar-track {
  background: transparent;
}

.messages::-webkit-scrollbar-thumb {
  background: #b5b0ab;
  border-radius: 3px;
}

.message {
  margin-bottom: 16px;
  max-width: 65%;
  animation: messageIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes messageIn {
  from {
    opacity: 0;
    transform: translateY(12px) scale(0.96);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.message.own {
  margin-left: auto;
}

.message.other {
  margin-right: auto;
}

.message .sender {
  font-size: 11px;
  color: #8a8582;
  margin-bottom: 6px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  padding-left: 4px;
}

.message .content {
  background: #ffffff;
  padding: 12px 16px;
  border-radius: 16px;
  word-wrap: break-word;
  box-shadow: 0 1px 3px rgba(26, 22, 20, 0.06);
  font-size: 14px;
  line-height: 1.5;
  color: #1a1614;
  border: 1px solid rgba(26, 22, 20, 0.04);
}

.message.own .content {
  background: linear-gradient(135deg, #e07a5f 0%, #d4644a 100%);
  color: white;
  border-radius: 16px 16px 6px 16px;
  border: none;
  box-shadow: 0 2px 8px rgba(224, 122, 95, 0.25);
}

.message.other .content {
  background: #ffffff;
  border-radius: 16px 16px 16px 6px;
}

.message .time {
  font-size: 10px;
  color: #b5b0ab;
  margin-top: 6px;
  font-weight: 500;
  padding: 0 4px;
}

.message.own .time {
  text-align: right;
  color: #b5b0ab;
}

@media (max-width: 768px) {
  .messages {
    padding: 16px;
    padding-bottom: 80px; /* Ruimte voor de sticky input */
  }

  .message {
    max-width: 85%;
    margin-bottom: 12px;
  }

  .message .content {
    padding: 10px 14px;
    font-size: 14px;
  }

  .message .sender {
    font-size: 10px;
  }
}
</style>
