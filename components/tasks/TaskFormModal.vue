<template>
  <div v-if="show" class="modal-overlay" @click="$emit('close')">
    <div class="modal" @click.stop>
      <h3>{{ editingTask ? 'Taak Bewerken' : 'Nieuwe Taak' }}</h3>
      <form @submit.prevent="$emit('save')">
        <div class="form-group">
          <label>Titel:</label>
          <input
            :value="form.title"
            @input="$emit('update:form', { ...form, title: $event.target.value })"
            type="text"
            required
            placeholder="Bijv. Boodschappen doen" />
        </div>

        <div class="form-group">
          <label>Beschrijving:</label>
          <textarea
            :value="form.description"
            @input="$emit('update:form', { ...form, description: $event.target.value })"
            rows="3"
            placeholder="Optionele beschrijving"></textarea>
        </div>

        <div class="form-group">
          <label>Afbeelding:</label>
          <div class="image-upload-container">
            <input
              ref="imageInput"
              type="file"
              accept="image/*"
              @change="$emit('image-select', $event)"
              class="image-input" />
            <button type="button" @click="$refs.imageInput.click()" class="btn-upload">
              📷 Afbeelding kiezen
            </button>
            <div v-if="form.image_path || imagePreview" class="image-preview">
              <img
                :src="imagePreview || `${apiBase.replace('/endpoints', '')}/${form.image_path}`"
                alt="Task image"
                @click="$emit('open-image-popup', imagePreview || `${apiBase.replace('/endpoints', '')}/${form.image_path}`)" />
              <button type="button" @click="$emit('remove-image')" class="btn-remove-image">
                ✕
              </button>
            </div>
          </div>
        </div>

        <div class="form-group">
          <label>Takenlijst:</label>
          <select
            :value="form.task_list_id"
            @input="$emit('update:form', { ...form, task_list_id: parseInt($event.target.value) || null })"
            required>
            <option :value="null" disabled>Selecteer een lijst</option>
            <option v-for="list in editableLists" :key="list.id" :value="list.id">
              {{ list.name }}
            </option>
          </select>
        </div>

        <div class="form-row">
          <div v-if="showPriorityField" class="form-group">
            <label>Prioriteit:</label>
            <select
              :value="form.priority"
              @input="$emit('update:form', { ...form, priority: $event.target.value })">
              <option value="low">Laag</option>
              <option value="medium">Gemiddeld</option>
              <option value="high">Hoog</option>
            </select>
          </div>

          <div v-if="showDueDateField" class="form-group">
            <label>Vervaldatum:</label>
            <input
              :value="form.due_date"
              @input="$emit('update:form', { ...form, due_date: $event.target.value })"
              type="date" />
          </div>
        </div>

        <div class="modal-actions">
          <button type="button" @click="$emit('close')" class="btn-secondary">Annuleren</button>
          <button type="submit" class="btn-primary">
            {{ editingTask ? 'Bijwerken' : 'Toevoegen' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
const config = useRuntimeConfig();
const apiBase = config.public.apiBaseUrl;

defineProps({
  show: {
    type: Boolean,
    required: true,
  },
  editingTask: {
    type: Object,
    default: null,
  },
  form: {
    type: Object,
    required: true,
  },
  imagePreview: {
    type: String,
    default: null,
  },
  editableLists: {
    type: Array,
    required: true,
  },
  showPriorityField: {
    type: Boolean,
    required: true,
  },
  showDueDateField: {
    type: Boolean,
    required: true,
  },
});

defineEmits(['close', 'save', 'update:form', 'image-select', 'remove-image', 'open-image-popup']);
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

.form-row {
  display: flex;
  gap: 16px;
}

.form-row .form-group {
  flex: 1;
}

.modal-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 20px;
}

/* Image upload styles */
.image-upload-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.image-input {
  display: none;
}

.btn-upload {
  padding: 10px 15px;
  background: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  align-self: flex-start;
}

.btn-upload:hover {
  background: #45a049;
}

.image-preview {
  position: relative;
  width: fit-content;
}

.image-preview img {
  max-width: 200px;
  max-height: 150px;
  border-radius: 4px;
  border: 2px solid #ddd;
  cursor: pointer;
  transition: transform 0.2s;
}

.image-preview img:hover {
  transform: scale(1.05);
}

.btn-remove-image {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #f44336;
  color: white;
  border: none;
  cursor: pointer;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.btn-remove-image:hover {
  background: #d32f2f;
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

/* Responsive */
@media (max-width: 768px) {
  .form-row {
    flex-direction: column;
  }
}
</style>
