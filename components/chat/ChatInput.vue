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
  gap: 12px;
  padding: 20px 24px;
  border-top: 1px solid rgba(26, 22, 20, 0.06);
  background: #ffffff;
}

.input-area input {
  flex: 1;
  padding: 14px 20px;
  border: 1px solid rgba(26, 22, 20, 0.1);
  border-radius: 16px;
  font-size: 14px;
  font-family: inherit;
  outline: none;
  background: #faf9f7;
  color: #1a1614;
  transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
}

.input-area input::placeholder {
  color: #b5b0ab;
}

.input-area input:focus {
  border-color: #e07a5f;
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(224, 122, 95, 0.1);
}

.input-area button {
  padding: 14px 28px;
  background: linear-gradient(135deg, #e07a5f 0%, #d4644a 100%);
  color: white;
  border: none;
  border-radius: 16px;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  font-family: inherit;
  transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(224, 122, 95, 0.3);
}

.input-area button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(224, 122, 95, 0.4);
}

.input-area button:active:not(:disabled) {
  transform: translateY(0);
}

.input-area button:disabled {
  background: #ebe8e4;
  color: #b5b0ab;
  cursor: not-allowed;
  box-shadow: none;
}

@media (max-width: 768px) {
  .input-area {
    position: fixed;
    bottom: 64px; /* Hoogte van de mobiele header */
    left: 0;
    right: 0;
    padding: 16px;
    gap: 10px;
    z-index: 100;
    box-shadow: 0 -4px 12px rgba(26, 22, 20, 0.08);
  }

  .input-area input {
    font-size: 16px; /* Prevents zoom on iOS */
    padding: 12px 16px;
    border-radius: 14px;
  }

  .input-area button {
    padding: 12px 20px;
    border-radius: 14px;
    font-size: 14px;
  }
}
</style>
