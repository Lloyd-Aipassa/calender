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
  padding: 20px 30px;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #999;
}
</style>
