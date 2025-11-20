<template>
  <div class="filter-section">
    <div class="filter-buttons">
      <button @click="$emit('update:filter', 'all')" :class="['filter-btn', { active: filter === 'all' }]">
        Alle ({{ filteredTasksCount }})
      </button>
      <button
        @click="$emit('update:filter', 'active')"
        :class="['filter-btn', { active: filter === 'active' }]">
        Actief ({{ activeTasksCount }})
      </button>
      <button
        @click="$emit('update:filter', 'completed')"
        :class="['filter-btn', { active: filter === 'completed' }]">
        Voltooid ({{ completedTasksCount }})
      </button>
    </div>

    <button
      v-if="filter === 'completed' && completedTasksCount > 0"
      @click="$emit('delete-all-completed')"
      class="btn-delete-all"
      title="Verwijder alle voltooide taken">
      🗑️ Alles Verwijderen
    </button>
  </div>
</template>

<script setup>
defineProps({
  filter: {
    type: String,
    required: true,
  },
  filteredTasksCount: {
    type: Number,
    required: true,
  },
  activeTasksCount: {
    type: Number,
    required: true,
  },
  completedTasksCount: {
    type: Number,
    required: true,
  },
});

defineEmits(['update:filter', 'delete-all-completed']);
</script>

<style scoped>
.filter-section {
  background: white;
  padding: 15px 30px;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.filter-buttons {
  display: flex;
  gap: 10px;
}

.filter-btn {
  padding: 8px 16px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
}

.filter-btn:hover {
  background: #f5f5f5;
}

.filter-btn.active {
  background: #fa0101;
  color: white;
  border-color: #fa0101;
}

.btn-delete-all {
  background: #ff6b6b;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 13px;
}

/* Responsive */
@media (max-width: 768px) {
  .filter-section {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
}
</style>
