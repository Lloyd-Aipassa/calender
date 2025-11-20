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

@media (max-width: 768px) {
  .back-btn {
    display: flex !important;
  }
}
</style>
