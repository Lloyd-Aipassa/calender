<template>
  <div v-if="show" class="modal-overlay" @click="$emit('close')">
    <div class="modal" @click.stop>
      <h3>Nieuwe Takenlijst</h3>
      <form @submit.prevent="$emit('create')">
        <div class="form-group">
          <label>Naam:</label>
          <input
            :value="form.name"
            @input="$emit('update:form', { ...form, name: $event.target.value })"
            type="text"
            required
            placeholder="Bijv. Boodschappen, Werk, Privé" />
        </div>

        <div class="form-group">
          <label>Kleur:</label>
          <div class="color-picker">
            <div
              v-for="color in colorOptions"
              :key="color"
              @click="$emit('update:form', { ...form, color })"
              :class="['color-option', { selected: form.color === color }]"
              :style="{ backgroundColor: color }"></div>
          </div>
        </div>

        <div class="modal-actions">
          <button type="button" @click="$emit('close')" class="btn-secondary">
            Annuleren
          </button>
          <button type="submit" class="btn-primary">Aanmaken</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
defineProps({
  show: {
    type: Boolean,
    required: true,
  },
  form: {
    type: Object,
    required: true,
  },
  colorOptions: {
    type: Array,
    required: true,
  },
});

defineEmits(['close', 'create', 'update:form']);
</script>

<style scoped>
/* Modals */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  border-radius: 12px;
  padding: 24px;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal h3 {
  margin: 0 0 20px 0;
  color: #333;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
  color: #333;
  font-size: 14px;
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
}

.modal-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 20px;
}

/* Color picker */
.color-picker {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.color-option {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  cursor: pointer;
  border: 3px solid transparent;
  transition: all 0.2s;
}

.color-option:hover {
  transform: scale(1.1);
}

.color-option.selected {
  border-color: #333;
  transform: scale(1.15);
}

/* Buttons */
.btn-primary {
  background: #fa0101;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  transition: all 0.2s;
}

.btn-primary:hover {
  background: #d80000;
}

.btn-secondary {
  background: #f5f5f5;
  color: #333;
  border: 1px solid #ddd;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
}
</style>
