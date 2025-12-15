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
  width: 300px;
  background: #ffffff;
  border-right: 1px solid rgba(26, 22, 20, 0.08);
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  padding: 24px 20px;
  border-bottom: 1px solid rgba(26, 22, 20, 0.06);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sidebar-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #1a1614;
  letter-spacing: -0.02em;
}

.sidebar-actions {
  display: flex;
  gap: 8px;
}

.lists-container {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
  scrollbar-width: thin;
  scrollbar-color: #b5b0ab transparent;
}

.lists-container::-webkit-scrollbar {
  width: 6px;
}

.lists-container::-webkit-scrollbar-thumb {
  background: #b5b0ab;
  border-radius: 3px;
}

.list-item {
  display: flex;
  align-items: center;
  padding: 14px 16px;
  margin-bottom: 6px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.list-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 0;
  background: #e07a5f;
  border-radius: 0 3px 3px 0;
  transition: height 150ms ease;
}

.list-item:hover {
  background: #faf9f7;
}

.list-item:hover::before {
  height: 50%;
}

.list-item.active {
  background: linear-gradient(90deg, rgba(224, 122, 95, 0.1) 0%, rgba(224, 122, 95, 0.02) 100%);
}

.list-item.active::before {
  height: 70%;
}

.list-color {
  width: 18px;
  height: 18px;
  border-radius: 6px;
  margin-right: 14px;
  flex-shrink: 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.list-info {
  flex: 1;
  min-width: 0;
}

.list-name {
  font-size: 14px;
  font-weight: 500;
  color: #1a1614;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: flex;
  align-items: center;
  gap: 8px;
}

.shared-badge {
  font-size: 9px;
  font-weight: 600;
  background: linear-gradient(135deg, #81a88d 0%, #6a9175 100%);
  color: white;
  padding: 3px 7px;
  border-radius: 6px;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.list-count {
  font-size: 12px;
  color: #8a8582;
  margin-top: 2px;
}

.list-actions {
  margin-left: auto;
}

/* Buttons */
.btn-icon {
  background: linear-gradient(135deg, #e07a5f 0%, #d4644a 100%);
  color: white;
  border: none;
  border-radius: 10px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 20px;
  font-weight: 300;
  transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(224, 122, 95, 0.3);
}

.btn-icon:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(224, 122, 95, 0.4);
}

.gear {
  background: #f5f3f0 !important;
  box-shadow: none !important;
  border: 1px solid rgba(26, 22, 20, 0.08);
}

.gear:hover {
  background: #ebe8e4 !important;
  transform: rotate(45deg);
}

.gear img {
  opacity: 0.6;
}

.btn-icon-small {
  width: 28px;
  height: 28px;
  font-size: 16px;
  background: transparent;
  color: #8a8582;
  border: none;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 150ms ease;
}

.btn-icon-small:hover {
  background: #f5f3f0;
  color: #1a1614;
}

/* List animation */
.list-item {
  animation: slideIn 0.3s ease-out backwards;
}

.list-item:nth-child(1) { animation-delay: 0.05s; }
.list-item:nth-child(2) { animation-delay: 0.1s; }
.list-item:nth-child(3) { animation-delay: 0.15s; }
.list-item:nth-child(4) { animation-delay: 0.2s; }
.list-item:nth-child(5) { animation-delay: 0.25s; }

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-12px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .tasks-sidebar {
    width: 100%;
    height: auto;
    max-height: 180px;
    border-right: none;
    border-bottom: 1px solid rgba(26, 22, 20, 0.08);
  }

  .sidebar-header {
    padding: 16px;
  }

  .lists-container {
    display: flex;
    overflow-x: auto;
    overflow-y: hidden;
    padding: 12px 16px;
    gap: 8px;
  }

  .list-item {
    min-width: 140px;
    margin-right: 0;
    margin-bottom: 0;
    padding: 12px 14px;
    border-radius: 10px;
    flex-shrink: 0;
  }

  .list-item::before {
    display: none;
  }

  .list-item.active {
    background: rgba(224, 122, 95, 0.12);
    border: 1px solid rgba(224, 122, 95, 0.2);
  }
}
</style>
