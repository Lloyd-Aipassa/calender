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
  background: #ffffff;
  border-radius: 16px;
  padding: 18px 20px;
  margin-bottom: 12px;
  display: flex;
  align-items: flex-start;
  gap: 14px;
  box-shadow: 0 1px 3px rgba(26, 22, 20, 0.04);
  border: 1px solid rgba(26, 22, 20, 0.06);
  transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
  border-left: 4px solid transparent;
  animation: taskIn 0.3s ease-out backwards;
}

@keyframes taskIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.task-item.priority-high {
  border-left-color: #e07a5f;
}

.task-item.priority-medium {
  border-left-color: #f59e0b;
}

.task-item.priority-low {
  border-left-color: #81a88d;
}

.task-item.completed {
  opacity: 0.5;
  background: #faf9f7;
}

.task-item.completed .task-title {
  text-decoration: line-through;
  color: #8a8582;
}

.task-item:hover {
  box-shadow: 0 4px 12px rgba(26, 22, 20, 0.08);
  transform: translateY(-2px);
  border-color: rgba(26, 22, 20, 0.1);
}

.task-checkbox {
  padding-top: 2px;
}

.task-checkbox input {
  width: 22px;
  height: 22px;
  cursor: pointer;
  accent-color: #e07a5f;
  border-radius: 6px;
}

.task-content {
  flex: 1;
  cursor: pointer;
  min-width: 0;
}

.task-title {
  font-size: 15px;
  font-weight: 600;
  color: #1a1614;
  margin-bottom: 4px;
  line-height: 1.4;
}

.task-description {
  font-size: 13px;
  color: #5c5552;
  margin-bottom: 10px;
  line-height: 1.5;
}

.task-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  font-size: 11px;
}

.task-due-date,
.task-priority,
.task-list-badge,
.task-shared {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 5px 10px;
  border-radius: 8px;
  background: #f5f3f0;
  color: #5c5552;
  font-weight: 500;
}

.task-due-date img {
  opacity: 0.6;
}

.task-priority.priority-high {
  background: rgba(224, 122, 95, 0.12);
  color: #e07a5f;
}

.task-priority.priority-medium {
  background: rgba(245, 158, 11, 0.12);
  color: #d97706;
}

.task-priority.priority-low {
  background: rgba(129, 168, 141, 0.12);
  color: #6a9175;
}

.task-list-badge {
  background: rgba(224, 122, 95, 0.1);
  color: #e07a5f;
}

.task-shared {
  background: rgba(129, 168, 141, 0.12);
  color: #6a9175;
}

.btn-delete {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 10px;
  border-radius: 10px;
  transition: all 150ms ease;
  opacity: 0.5;
}

.task-item:hover .btn-delete {
  opacity: 1;
}

.btn-delete:hover {
  background: #fef2f2;
}

.btn-delete img {
  opacity: 0.7;
  transition: opacity 150ms ease;
}

.btn-delete:hover img {
  opacity: 1;
  filter: brightness(0) saturate(100%) invert(27%) sepia(51%) saturate(2878%) hue-rotate(346deg) brightness(97%) contrast(97%);
}

/* Task thumbnail in list */
.task-header-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.task-thumbnail {
  width: 48px;
  height: 48px;
  object-fit: cover;
  border-radius: 10px;
  cursor: pointer;
  flex-shrink: 0;
  transition: all 200ms ease;
  box-shadow: 0 2px 6px rgba(26, 22, 20, 0.1);
}

.task-thumbnail:hover {
  transform: scale(1.08);
  box-shadow: 0 4px 12px rgba(26, 22, 20, 0.15);
}

@media (max-width: 768px) {
  .task-item {
    padding: 14px 16px;
    border-radius: 14px;
    gap: 12px;
  }

  .task-title {
    font-size: 14px;
  }

  .task-description {
    font-size: 12px;
  }

  .task-meta {
    gap: 6px;
  }

  .task-due-date,
  .task-priority,
  .task-list-badge,
  .task-shared {
    padding: 4px 8px;
    font-size: 10px;
  }

  .task-thumbnail {
    width: 40px;
    height: 40px;
  }
}
</style>
