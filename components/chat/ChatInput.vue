<template>
  <div class="input-area">
    <input
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      @keyup.enter="$emit('send')"
      placeholder="Type een bericht..."
      :disabled="sending"
    />
    <button
      @click="$emit('send')"
      :disabled="!modelValue || !modelValue.trim() || sending"
      class="send-btn">
      Verstuur
    </button>
  </div>
</template>

<script setup>
const props = defineProps({
  modelValue: {
    type: String,
    required: true
  },
  sending: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:modelValue', 'send']);
</script>

<style scoped>
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

@media (max-width: 768px) {
  .input-area {
    padding: 15px;
  }

  .input-area input {
    font-size: 16px; /* Prevents zoom on iOS */
  }
}
</style>
