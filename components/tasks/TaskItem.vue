<template>
  <div :class="['task-item', { completed: task.completed }, `priority-${task.priority}`]">
    <div class="task-checkbox">
      <input
        type="checkbox"
        :checked="task.completed"
        @change="$emit('toggle-task', task)"
        :disabled="!canEdit" />
    </div>

    <div class="task-content" @click="$emit('edit-task', task)">
      <div class="task-header-row">
        <div class="task-title">{{ task.title }}</div>
        <img
          v-if="task.image_path"
          :src="`${apiBase.replace('/endpoints', '')}/${task.image_path}`"
          alt="Task image"
          class="task-thumbnail"
          @click.stop="$emit('open-image-popup', `${apiBase.replace('/endpoints', '')}/${task.image_path}`)" />
      </div>
      <div v-if="task.description" class="task-description">{{ task.description }}</div>
      <div class="task-meta">
        <span v-if="task.due_date && shouldShowDueDate" class="task-due-date">
          <img src="/svg/calendar.svg" width="15" alt="" />
          {{ formatDate(task.due_date) }}
        </span>
        <span v-if="shouldShowPriority" :class="['task-priority', `priority-${task.priority}`]">
          {{ priorityLabel(task.priority) }}
        </span>
        <span v-if="task.list_name && !selectedListId" class="task-list-badge">
          {{ task.list_name }}
        </span>
        <span v-if="task.task_type === 'shared'" class="task-shared">
          Gedeeld door {{ task.creator }}
        </span>
      </div>
    </div>

    <button
      v-if="canEdit"
      @click="$emit('delete-task', task)"
      class="btn-delete"
      title="Verwijderen">
      <img src="/svg/trash.svg" width="15" alt="" />
    </button>
  </div>
</template>

<script setup>
const config = useRuntimeConfig();
const apiBase = config.public.apiBaseUrl;

const props = defineProps({
  task: {
    type: Object,
    required: true,
  },
  selectedListId: {
    type: Number,
    default: null,
  },
  shouldShowPriority: {
    type: Boolean,
    required: true,
  },
  shouldShowDueDate: {
    type: Boolean,
    required: true,
  },
});

defineEmits(['toggle-task', 'edit-task', 'delete-task', 'open-image-popup']);

const canEdit = computed(() => {
  return props.task.task_type === 'own' || props.task.permission_level === 'edit';
});

function priorityLabel(priority) {
  const labels = {
    low: '🟢 Laag',
    medium: '🟡 Gemiddeld',
    high: '🔴 Hoog',
  };
  return labels[priority] || priority;
}

function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString('nl-NL', options);
}
</script>

<style scoped>
.task-item {
  background: white;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.2s;
  border-left: 4px solid transparent;
}

.task-item.priority-high {
  border-left-color: #ff6b6b;
}

.task-item.priority-medium {
  border-left-color: #feca57;
}

.task-item.priority-low {
  border-left-color: #96ceb4;
}

.task-item.completed {
  opacity: 0.6;
}

.task-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.task-checkbox input {
  width: 20px;
  height: 20px;
  cursor: pointer;
}

.task-content {
  flex: 1;
  cursor: pointer;
}

.task-title {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
}

.task-description {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

.task-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  font-size: 12px;
}

.task-due-date,
.task-priority,
.task-list-badge,
.task-shared {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 4px;
  background: #f5f5f5;
}

.task-list-badge {
  background: #e3f2fd;
  color: #1976d2;
}

.task-shared {
  background: #fff3e0;
  color: #f57c00;
}

.btn-delete {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
  transition: all 0.2s;
}

.btn-delete:hover {
  background: #ffe0e0;
}

/* Task thumbnail in list */
.task-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}

.task-thumbnail {
  width: 40px;
  height: 40px;
  object-fit: cover;
  border-radius: 4px;
  cursor: pointer;
  flex-shrink: 0;
  transition: transform 0.2s;
}

.task-thumbnail:hover {
  transform: scale(1.1);
}
</style>
