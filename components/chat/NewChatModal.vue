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

.btn-primary:disabled {
  background: #ccc;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .modal {
    width: 90%;
    padding: 20px;
  }

  .modal h3 {
    font-size: 18px;
  }
}
</style>
