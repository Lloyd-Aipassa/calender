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
  background: white;
  padding: 20px 30px;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.tasks-header h2 {
  margin: 0;
  color: #333;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.mobile-list-selector {
  display: none;
  width: 100%;
  max-width: 300px;
  padding: 10px 15px;
  margin: 10px 0;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: white;
  font-size: 16px;
  color: #333;
  cursor: pointer;
  outline: none;
  transition: border-color 0.2s;
}

.mobile-list-selector:focus {
  border-color: #fa0101;
}

.mobile-list-selector option {
  padding: 10px;
}

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

.btn-share {
  background: #4ecdc4;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
}

/* Responsive */
@media (max-width: 768px) {
  .tasks-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .mobile-list-selector {
    display: block;
  }
}
</style>
