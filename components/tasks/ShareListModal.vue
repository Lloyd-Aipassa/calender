<template>
  <div v-if="show" class="modal-overlay" @click="$emit('close')">
    <div class="modal modal-large" @click.stop>
      <h3>Lijst Delen: {{ currentList?.name }}</h3>

      <!-- Invite form -->
      <div class="share-section">
        <h4>Deel met gebruiker</h4>
        <form @submit.prevent="$emit('share')" class="invite-form">
          <select
            :value="form.shared_with_user_id"
            @input="$emit('update:form', { ...form, shared_with_user_id: $event.target.value })"
            required
            class="invite-user">
            <option :value="null" disabled>Selecteer een gebruiker</option>
            <option v-for="user in availableUsers" :key="user.id" :value="user.id">
              {{ user.name }} ({{ user.email }})
            </option>
          </select>
          <select
            :value="form.permission_level"
            @input="$emit('update:form', { ...form, permission_level: $event.target.value })"
            class="invite-permission">
            <option value="view">Alleen bekijken</option>
            <option value="edit">Bekijken en bewerken</option>
          </select>
          <button type="submit" class="btn-primary">Delen</button>
        </form>
      </div>

      <!-- Shared with -->
      <div v-if="listShares.length > 0" class="share-section">
        <h4>Gedeeld met</h4>
        <div class="shared-list">
          <div v-for="share in listShares" :key="share.id" class="shared-item">
            <div class="shared-info">
              <div class="shared-name">{{ share.user_name }}</div>
              <div class="shared-email">{{ share.user_email }}</div>
              <div class="shared-permission">
                {{ share.permission_level === 'edit' ? '✏️ Kan bewerken' : '👁️ Kan alleen bekijken' }}
              </div>
            </div>
            <button @click="$emit('unshare', share.shared_with_user_id)" class="btn-revoke">
              Intrekken
            </button>
          </div>
        </div>
      </div>

      <div class="modal-actions">
        <button type="button" @click="$emit('close')" class="btn-secondary">Sluiten</button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  show: {
    type: Boolean,
    required: true,
  },
  currentList: {
    type: Object,
    default: null,
  },
  form: {
    type: Object,
    required: true,
  },
  availableUsers: {
    type: Array,
    required: true,
  },
  listShares: {
    type: Array,
    required: true,
  },
});

defineEmits(['close', 'share', 'unshare', 'update:form']);
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

.modal-large {
  max-width: 600px;
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

/* Share section */
.share-section {
  margin-bottom: 24px;
  padding-bottom: 24px;
  border-bottom: 1px solid #e0e0e0;
}

.share-section:last-of-type {
  border-bottom: none;
}

.share-section h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.invite-form {
  display: flex;
  gap: 10px;
  align-items: center;
}

.invite-user {
  flex: 1;
  min-width: 200px;
}

.invite-permission {
  width: 180px;
}

.shared-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.shared-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
}

.shared-info {
  flex: 1;
}

.shared-name {
  font-weight: 500;
  color: #333;
  margin-bottom: 2px;
}

.shared-email {
  font-size: 13px;
  color: #666;
  margin-bottom: 4px;
}

.shared-permission {
  font-size: 12px;
  color: #999;
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

.btn-revoke {
  background: #ff6b6b;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
}

/* Responsive */
@media (max-width: 768px) {
  .invite-form {
    flex-direction: column;
  }
}
</style>
