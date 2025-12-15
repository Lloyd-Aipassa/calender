<template>
  <div v-if="show" class="modal-overlay" @click="$emit('close')">
    <div class="modal" @click.stop>
      <h3>Nieuw gesprek starten</h3>
      <p>Selecteer een gebruiker om mee te chatten:</p>

      <select :value="selectedUserId" @change="$emit('update:selectedUserId', Number($event.target.value))" class="user-select">
        <option value="">-- Kies een gebruiker --</option>
        <option v-for="user in availableUsers" :key="user.id" :value="user.id">
          {{ user.name }} ({{ user.email }})
        </option>
      </select>

      <div class="modal-buttons">
        <button @click="$emit('close')" class="btn-cancel">Annuleren</button>
        <button @click="$emit('start-conversation')" :disabled="!selectedUserId" class="btn-primary">
          Start gesprek
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  show: {
    type: Boolean,
    required: true
  },
  availableUsers: {
    type: Array,
    required: true
  },
  selectedUserId: {
    type: [Number, String],
    default: ''
  }
});

const emit = defineEmits(['close', 'start-conversation', 'update:selectedUserId']);
</script>

<style scoped>
/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(26, 22, 20, 0.4);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal {
  background: #ffffff;
  padding: 32px;
  border-radius: 20px;
  width: 420px;
  max-width: 90%;
  box-shadow:
    0 4px 6px rgba(26, 22, 20, 0.02),
    0 24px 48px rgba(26, 22, 20, 0.12);
  animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.96);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 700;
  color: #1a1614;
  letter-spacing: -0.02em;
}

.modal p {
  color: #8a8582;
  margin-bottom: 24px;
  font-size: 14px;
  line-height: 1.5;
}

.modal input,
.user-select {
  width: 100%;
  padding: 14px 16px;
  border: 1px solid rgba(26, 22, 20, 0.1);
  border-radius: 12px;
  font-size: 14px;
  font-family: inherit;
  margin-bottom: 24px;
  background: #faf9f7;
  color: #1a1614;
  transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
}

.user-select {
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%238a8582' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 14px center;
  padding-right: 44px;
}

.user-select:focus {
  outline: none;
  border-color: #e07a5f;
  background-color: #ffffff;
  box-shadow: 0 0 0 3px rgba(224, 122, 95, 0.1);
}

.modal-buttons {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.modal-buttons button {
  padding: 12px 24px;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  font-family: inherit;
  transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-cancel {
  background: #f5f3f0;
  color: #5c5552;
  border: 1px solid rgba(26, 22, 20, 0.08);
}

.btn-cancel:hover {
  background: #ebe8e4;
  color: #1a1614;
}

.btn-primary {
  background: linear-gradient(135deg, #e07a5f 0%, #d4644a 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(224, 122, 95, 0.3);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(224, 122, 95, 0.4);
}

.btn-primary:disabled {
  background: #ebe8e4;
  color: #b5b0ab;
  cursor: not-allowed;
  box-shadow: none;
}

@media (max-width: 768px) {
  .modal {
    width: 92%;
    padding: 24px;
    border-radius: 16px;
  }

  .modal h3 {
    font-size: 17px;
  }

  .modal-buttons {
    flex-direction: column-reverse;
  }

  .modal-buttons button {
    width: 100%;
    justify-content: center;
  }
}
</style>
