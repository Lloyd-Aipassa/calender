<template>
  <div class="tasks-list">
    <div v-if="displayedTasks.length === 0" class="empty-state">
      <p>Geen taken gevonden</p>
    </div>

    <TaskItem
      v-for="task in displayedTasks"
      :key="task.id"
      :task="task"
      :selected-list-id="selectedListId"
      :should-show-priority="shouldShowPriority(task)"
      :should-show-due-date="shouldShowDueDate(task)"
      @toggle-task="$emit('toggle-task', $event)"
      @edit-task="$emit('edit-task', $event)"
      @delete-task="$emit('delete-task', $event)"
      @open-image-popup="$emit('open-image-popup', $event)" />
  </div>
</template>

<script setup>
import TaskItem from './TaskItem.vue';

const props = defineProps({
  displayedTasks: {
    type: Array,
    required: true,
  },
  selectedListId: {
    type: Number,
    default: null,
  },
  listSettings: {
    type: Object,
    required: true,
  },
});

defineEmits(['toggle-task', 'edit-task', 'delete-task', 'open-image-popup']);

function shouldShowPriority(task) {
  if (!task.task_list_id) return true;
  const settings = props.listSettings[task.task_list_id];
  return settings?.showPriority !== false;
}

function shouldShowDueDate(task) {
  if (!task.task_list_id) return true;
  const settings = props.listSettings[task.task_list_id];
  return settings?.showDueDate !== false;
}
</script>

<style scoped>
.tasks-list {
  flex: 1;
  overflow-y: auto;
  padding: 24px 28px;
  scrollbar-width: thin;
  scrollbar-color: #b5b0ab transparent;
}

.tasks-list::-webkit-scrollbar {
  width: 6px;
}

.tasks-list::-webkit-scrollbar-thumb {
  background: #b5b0ab;
  border-radius: 3px;
}

.empty-state {
  text-align: center;
  padding: 80px 24px;
  color: #8a8582;
}

.empty-state::before {
  content: '';
  display: block;
  width: 64px;
  height: 64px;
  margin: 0 auto 20px;
  background: linear-gradient(135deg, #e07a5f 0%, #d4644a 100%);
  border-radius: 50%;
  opacity: 0.12;
}

.empty-state p {
  margin: 0;
  font-size: 15px;
  font-weight: 500;
}

@media (max-width: 768px) {
  .tasks-list {
    padding: 16px;
  }
}
</style>
