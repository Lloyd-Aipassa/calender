<template>
  <div class="chat-header">
    <button @click="$emit('toggle-sidebar')" class="back-btn">←</button>
    <h3>{{ conversationName }}</h3>
  </div>
</template>

<script setup>
const props = defineProps({
  conversationName: {
    type: String,
    required: true
  }
});

const emit = defineEmits(['toggle-sidebar']);
</script>

<style scoped>
.chat-header {
  padding: 20px 24px;
  border-bottom: 1px solid rgba(26, 22, 20, 0.06);
  background: #ffffff;
  display: flex;
  align-items: center;
  gap: 14px;
  position: relative;
}

.chat-header::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 24px;
  right: 24px;
  height: 1px;
  background: linear-gradient(90deg, transparent 0%, rgba(26, 22, 20, 0.06) 20%, rgba(26, 22, 20, 0.06) 80%, transparent 100%);
}

.chat-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  flex: 1;
  color: #1a1614;
  letter-spacing: -0.01em;
}

.back-btn {
  display: none;
  background: #f5f3f0;
  border: 1px solid rgba(26, 22, 20, 0.08);
  font-size: 18px;
  cursor: pointer;
  padding: 0;
  width: 36px;
  height: 36px;
  align-items: center;
  justify-content: center;
  color: #5c5552;
  border-radius: 10px;
  transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
}

.back-btn:hover {
  background: #ebe8e4;
  color: #1a1614;
}

@media (max-width: 768px) {
  .chat-header {
    padding: 16px;
  }

  .chat-header::after {
    left: 16px;
    right: 16px;
  }

  .back-btn {
    display: flex !important;
  }
}
</style>
