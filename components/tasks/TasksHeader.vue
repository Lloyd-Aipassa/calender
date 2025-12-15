<template>
  <div class="tasks-header">
    <h2>{{ currentListName }}</h2>

    <!-- Mobile list selector -->
    <select
      :value="selectedListId"
      @change="$emit('select-list', $event.target.value ? parseInt($event.target.value) : null)"
      class="mobile-list-selector">
      <option :value="null">Alle Taken</option>
      <option
        v-for="list in taskLists"
        :key="list.id"
        :value="list.id"
        :style="{ color: list.color }">
        {{ list.name }} ({{ list.task_count }})
      </option>
    </select>

    <div class="header-actions">
      <button
        v-if="selectedListId && currentList?.access_type === 'owner'"
        @click="$emit('open-share-list-modal')"
        class="btn-share">
        👥 Delen
      </button>
      <button @click="$emit('show-add-task')" class="btn-primary">
        <span>+</span>
        Nieuwe Taak
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  currentListName: {
    type: String,
    required: true,
  },
  selectedListId: {
    type: Number,
    default: null,
  },
  taskLists: {
    type: Array,
    required: true,
  },
  currentList: {
    type: Object,
    default: null,
  },
});

defineEmits(['select-list', 'open-share-list-modal', 'show-add-task']);
</script>

<style scoped>
.tasks-header {
  background: #ffffff;
  padding: 24px 28px;
  border-bottom: 1px solid rgba(26, 22, 20, 0.06);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.tasks-header h2 {
  margin: 0;
  color: #1a1614;
  font-size: 20px;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.mobile-list-selector {
  display: none;
  width: 100%;
  max-width: 300px;
  padding: 12px 16px;
  margin: 10px 0;
  border: 1px solid rgba(26, 22, 20, 0.1);
  border-radius: 12px;
  background: #faf9f7;
  font-size: 15px;
  font-family: inherit;
  color: #1a1614;
  cursor: pointer;
  outline: none;
  transition: all 150ms ease;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%238a8582' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 14px center;
  padding-right: 44px;
}

.mobile-list-selector:focus {
  border-color: #e07a5f;
  background-color: #ffffff;
  box-shadow: 0 0 0 3px rgba(224, 122, 95, 0.1);
}

.btn-primary {
  background: linear-gradient(135deg, #e07a5f 0%, #d4644a 100%);
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  font-family: inherit;
  transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(224, 122, 95, 0.3);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(224, 122, 95, 0.4);
}

.btn-primary:active {
  transform: translateY(0);
}

.btn-primary span {
  font-size: 18px;
  font-weight: 300;
}

.btn-share {
  background: linear-gradient(135deg, #81a88d 0%, #6a9175 100%);
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 12px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  font-family: inherit;
  transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(129, 168, 141, 0.3);
}

.btn-share:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(129, 168, 141, 0.4);
}

/* Responsive */
@media (max-width: 768px) {
  .tasks-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
    padding: 20px 16px;
  }

  .tasks-header h2 {
    font-size: 18px;
  }

  .mobile-list-selector {
    display: block;
  }

  .header-actions {
    width: 100%;
  }

  .btn-primary {
    flex: 1;
    justify-content: center;
  }
}
</style>
