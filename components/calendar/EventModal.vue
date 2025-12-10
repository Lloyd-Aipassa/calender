<template>
  <div v-if="show" class="modal-overlay" @click="$emit('close')">
    <div class="modal" @click.stop>
      <h3>{{ editingEvent ? 'Afspraak Bewerken' : 'Nieuwe Afspraak' }}</h3>
      <form @submit.prevent="$emit('save')">
        <div class="form-group">
          <label>Titel:</label>
          <input v-model="formData.title" type="text" required />
        </div>
        <div class="form-group">
          <label>Datum:</label>
          <input v-model="formData.date" type="date" required />
        </div>
        <div class="form-group">
          <label>Start tijd:</label>
          <input v-model="formData.time" type="time" required />
        </div>
        <div class="form-group">
          <label>Eind tijd:</label>
          <input v-model="formData.endTime" type="time" required />
        </div>
        <div class="form-group">
          <label>Beschrijving:</label>
          <textarea v-model="formData.description" rows="3"></textarea>
        </div>
        <div class="form-group">
          <label>Herinnering:</label>
          <select v-model="formData.reminder_minutes">
            <option :value="null">Geen herinnering</option>
            <option :value="0">Op het moment van het event</option>
            <option :value="15">15 minuten van tevoren</option>
            <option :value="30">30 minuten van tevoren</option>
            <option :value="60">1 uur van tevoren</option>
            <option :value="1440">1 dag van tevoren</option>
            <option :value="2880">2 dagen van tevoren</option>
            <option :value="10080">1 week van tevoren</option>
          </select>
        </div>
        <div class="modal-actions">
          <button v-if="editingEvent" type="button" @click="$emit('delete')" class="btn-danger" :disabled="isSaving">
            Verwijderen
          </button>
          <button type="button" @click="$emit('close')" class="btn-secondary" :disabled="isSaving">Annuleren</button>
          <button type="submit" class="btn-primary" :disabled="isSaving">
            {{ isSaving ? 'Bezig...' : (editingEvent ? 'Bijwerken' : 'Toevoegen') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  show: {
    type: Boolean,
    required: true
  },
  editingEvent: {
    type: Object,
    default: null
  },
  formData: {
    type: Object,
    required: true
  },
  isSaving: {
    type: Boolean,
    default: false
  }
});

defineEmits(['close', 'save', 'delete']);
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal {
  background: white;
  padding: 30px;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.modal h3 {
  margin-top: 0;
  margin-bottom: 20px;
  color: #333;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
  color: #333;
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.form-group select {
  background: white;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #fa0101;
}

.modal-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 20px;
}

/* Button styles */
.btn-primary {
  background-color: #fa0101a0;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
}

.btn-primary:hover:not(:disabled) {
  background-color: #c80101;
}

.btn-primary:disabled {
  background-color: #ccc;
  cursor: not-allowed;
  opacity: 0.6;
}

.btn-secondary {
  background-color: #6c757d47;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
}

.btn-secondary:hover:not(:disabled) {
  background-color: #545b62;
}

.btn-secondary:disabled {
  background-color: #ccc;
  cursor: not-allowed;
  opacity: 0.6;
}

.btn-danger {
  background-color: #dc3545;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
}

.btn-danger:hover:not(:disabled) {
  background-color: #c82333;
}

.btn-danger:disabled {
  background-color: #ccc;
  cursor: not-allowed;
  opacity: 0.6;
}

@media (max-width: 768px) {
  .modal {
    margin: 20px;
    width: calc(100% - 40px);
  }
}
</style>
