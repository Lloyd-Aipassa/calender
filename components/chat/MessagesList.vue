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

@media (max-width: 768px) {
  .message {
    max-width: 85%;
  }
}
</style>
