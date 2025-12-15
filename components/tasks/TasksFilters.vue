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
  background: #ffffff;
  padding: 16px 28px;
  border-bottom: 1px solid rgba(26, 22, 20, 0.06);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.filter-buttons {
  display: flex;
  gap: 6px;
  background: #f5f3f0;
  padding: 4px;
  border-radius: 12px;
}

.filter-btn {
  padding: 10px 18px;
  border: none;
  background: transparent;
  border-radius: 10px;
  cursor: pointer;
  transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
  font-size: 13px;
  font-weight: 500;
  font-family: inherit;
  color: #5c5552;
}

.filter-btn:hover {
  background: rgba(255, 255, 255, 0.6);
  color: #1a1614;
}

.filter-btn.active {
  background: #ffffff;
  color: #e07a5f;
  box-shadow: 0 1px 3px rgba(26, 22, 20, 0.08);
  font-weight: 600;
}

.btn-delete-all {
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid #fecaca;
  padding: 10px 16px;
  border-radius: 10px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  font-family: inherit;
  transition: all 150ms ease;
}

.btn-delete-all:hover {
  background: #fee2e2;
  border-color: #fca5a5;
}

/* Responsive */
@media (max-width: 768px) {
  .filter-section {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
    padding: 16px;
  }

  .filter-buttons {
    width: 100%;
  }

  .filter-btn {
    flex: 1;
    text-align: center;
    padding: 12px 10px;
  }

  .btn-delete-all {
    width: 100%;
    text-align: center;
  }
}
</style>
