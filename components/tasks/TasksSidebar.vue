<template>
  <div class="tasks-sidebar">
    <div class="sidebar-header">
      <h3>Mijn Lijsten</h3>
      <div class="sidebar-actions">
        <button @click="goToSettings" class="btn-icon gear" title="Instellingen">
          <img src="/svg/gear.svg" width="28" alt="Instellingen" />
        </button>
        <button @click="$emit('show-new-list-modal')" class="btn-icon" title="Nieuwe lijst">+</button>
      </div>
    </div>

    <div class="lists-container">
      <!-- All tasks option -->
      <div
        @click="$emit('select-list', null)"
        :class="['list-item', { active: selectedListId === null }]">
        <div class="list-color" style="background-color: #999"></div>
        <div class="list-info">
          <div class="list-name">Alle Taken</div>
          <div class="list-count">{{ allTasksCount }}</div>
        </div>
      </div>

      <!-- Task lists -->
      <div
        v-for="list in taskLists"
        :key="list.id"
        @click="$emit('select-list', list.id)"
        :class="['list-item', { active: selectedListId === list.id }]">
        <div class="list-color" :style="{ backgroundColor: list.color }"></div>
        <div class="list-info">
          <div class="list-name">
            {{ list.name }}
            <span v-if="list.access_type === 'shared'" class="shared-badge">gedeeld</span>
          </div>
          <div class="list-count">{{ list.task_count || 0 }}</div>
        </div>
        <div class="list-actions" @click.stop>
          <button
            v-if="list.access_type === 'owner'"
            @click="$emit('open-list-menu', list)"
            class="btn-icon-small">
            ⋮
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  taskLists: {
    type: Array,
    required: true,
  },
  selectedListId: {
    type: Number,
    default: null,
  },
  allTasksCount: {
    type: Number,
    required: true,
  },
});

defineEmits(['select-list', 'show-new-list-modal', 'open-list-menu']);

function goToSettings() {
  navigateTo('/task-settings');
}
</script>

<style scoped>
/* Sidebar */
.tasks-sidebar {
  width: 280px;
  background: white;
  border-right: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  padding: 20px;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sidebar-header h3 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.sidebar-actions {
  display: flex;
  gap: 8px;
}

.lists-container {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
}

.list-item {
  display: flex;
  align-items: center;
  padding: 12px;
  margin-bottom: 4px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
}

.list-item:hover {
  background: #f5f5f5;
}

.list-item.active {
  background: #e3f2fd;
}

.list-color {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  margin-right: 12px;
  flex-shrink: 0;
}

.list-info {
  flex: 1;
  min-width: 0;
}

.list-name {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.shared-badge {
  font-size: 10px;
  background: #ff9ff3;
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  margin-left: 6px;
}

.list-count {
  font-size: 12px;
  color: #999;
}

.list-actions {
  margin-left: auto;
}

/* Buttons */
.btn-icon,
.btn-icon-small {
  background: #fa0101;
  color: white;
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 20px;
  transition: all 0.2s;
}
 .gear
 {
 background: #fa010100;
}

.btn-icon-small {
  width: 24px;
  height: 24px;
  font-size: 16px;
  background: transparent;
  color: #666;
}

.btn-icon:hover,
.btn-icon-small:hover {
  transform: scale(1.1);
}

/* Responsive */
@media (max-width: 768px) {
  .tasks-sidebar {
    width: 100%;
    height: auto;
    max-height: 200px;
    border-right: none;
    border-bottom: 1px solid #e0e0e0;
  }

  .lists-container {
    display: flex;
    overflow-x: auto;
    overflow-y: hidden;
    padding: 10px;
  }

  .list-item {
    min-width: 150px;
    margin-right: 8px;
    margin-bottom: 0;
  }
}
</style>
