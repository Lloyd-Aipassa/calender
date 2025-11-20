<template>
  <div class="tasks-page">
    <!-- Sidebar with lists -->
    <TasksSidebar
      :task-lists="taskLists"
      :selected-list-id="selectedListId"
      :all-tasks-count="allTasksCount"
      @select-list="selectList"
      @show-new-list-modal="showNewListModal = true"
      @open-list-menu="openListMenu" />

    <!-- Main content -->
    <div class="tasks-main">
      <TasksHeader
        :current-list-name="currentListName"
        :selected-list-id="selectedListId"
        :task-lists="taskLists"
        :current-list="currentList"
        @select-list="selectList"
        @open-share-list-modal="openShareListModal"
        @show-add-task="showAddTask = true" />

      <!-- Filter knoppen -->
      <TasksFilters
        :filter="filter"
        :filtered-tasks-count="filteredTasks.length"
        :active-tasks-count="activeTasks.length"
        :completed-tasks-count="completedTasks.length"
        @update:filter="filter = $event"
        @delete-all-completed="deleteAllCompleted" />

      <!-- Taken lijst -->
      <TasksList
        :displayed-tasks="displayedTasks"
        :selected-list-id="selectedListId"
        :list-settings="listSettings"
        @toggle-task="toggleTask"
        @edit-task="editTask"
        @delete-task="confirmDelete"
        @open-image-popup="openImagePopup" />
    </div>

    <!-- New List Modal -->
    <NewListModal
      :show="showNewListModal"
      :form="newListForm"
      :color-options="colorOptions"
      @close="closeNewListModal"
      @create="createList"
      @update:form="newListForm = $event" />

    <!-- Share List Modal -->
    <ShareListModal
      :show="showShareListModal"
      :current-list="currentList"
      :form="shareListForm"
      :available-users="availableUsers"
      :list-shares="listShares"
      @close="closeShareListModal"
      @share="shareList"
      @unshare="unshareList"
      @update:form="shareListForm = $event" />

    <!-- Add/Edit Task Modal -->
    <TaskFormModal
      :show="showAddTask"
      :editing-task="editingTask"
      :form="taskForm"
      :image-preview="imagePreview"
      :editable-lists="editableLists"
      :show-priority-field="showPriorityField"
      :show-due-date-field="showDueDateField"
      @close="closeModal"
      @save="saveTask"
      @update:form="taskForm = $event"
      @image-select="handleImageSelect"
      @remove-image="removeImage"
      @open-image-popup="openImagePopup" />

    <!-- Image Popup Modal -->
    <ImagePopup :show="showImagePopup" :image-url="popupImageUrl" @close="closeImagePopup" />

    <!-- Edit List Modal -->
    <EditListModal
      :show="showEditListModal"
      :form="editListForm"
      :color-options="colorOptions"
      @close="closeEditListModal"
      @update="updateList"
      @delete="deleteList"
      @update:form="editListForm = $event" />
  </div>
</template>

<script setup>
import NewListModal from '~/components/tasks/NewListModal.vue';
import EditListModal from '~/components/tasks/EditListModal.vue';
import ShareListModal from '~/components/tasks/ShareListModal.vue';
import TaskFormModal from '~/components/tasks/TaskFormModal.vue';
import ImagePopup from '~/components/tasks/ImagePopup.vue';

const config = useRuntimeConfig();
const apiBase = config.public.apiBaseUrl;

// State
const taskLists = ref([]);
const tasks = ref([]);
const selectedListId = ref(null);
const filter = ref('all');

const showNewListModal = ref(false);
const showEditListModal = ref(false);
const showShareListModal = ref(false);
const showAddTask = ref(false);
const editingTask = ref(null);
const editingList = ref(null);
const listShares = ref([]);
const allUsers = ref([]);

const newListForm = ref({
  name: '',
  color: '#fa0101',
});

const editListForm = ref({
  name: '',
  color: '#fa0101',
});

const shareListForm = ref({
  shared_with_user_id: null,
  permission_level: 'view',
});

const taskForm = ref({
  title: '',
  description: '',
  image_path: null,
  priority: 'medium',
  due_date: '',
  task_list_id: null,
});

// Image upload state
const imageInput = ref(null);
const imagePreview = ref(null);
const selectedImageFile = ref(null);

// List settings from localStorage
const listSettings = ref({});
const showImagePopup = ref(false);
const popupImageUrl = ref('');

const colorOptions = [
  '#fa0101',
  '#ff6b6b',
  '#4ecdc4',
  '#45b7d1',
  '#96ceb4',
  '#feca57',
  '#ff9ff3',
  '#54a0ff',
  '#48dbfb',
  '#00d2d3',
  '#1abc9c',
  '#f39c12',
];

// Computed
const currentList = computed(() => {
  return taskLists.value.find((l) => l.id === selectedListId.value);
});

const currentListName = computed(() => {
  if (!selectedListId.value) return 'Alle Taken';
  return currentList.value?.name || 'Taken';
});

const editableLists = computed(() => {
  return taskLists.value.filter(
    (l) => l.access_type === 'owner' || l.permission_level === 'edit'
  );
});

const allTasksCount = computed(() => {
  return tasks.value.length;
});

const filteredTasks = computed(() => {
  let filtered = tasks.value;

  // Filter by list if selected
  if (selectedListId.value) {
    filtered = filtered.filter((t) => t.task_list_id === selectedListId.value);
  }

  return filtered;
});

const activeTasks = computed(() => {
  return filteredTasks.value.filter((t) => !t.completed);
});

const completedTasks = computed(() => {
  return filteredTasks.value.filter((t) => t.completed);
});

const displayedTasks = computed(() => {
  if (filter.value === 'active') return activeTasks.value;
  if (filter.value === 'completed') return completedTasks.value;
  return filteredTasks.value;
});

const availableUsers = computed(() => {
  // Filter out users who already have access to this list
  const sharedUserIds = listShares.value.map(s => s.shared_with_user_id);
  return allUsers.value.filter(u => !sharedUserIds.includes(u.id));
});

// Check if priority field should be shown based on selected list settings
const showPriorityField = computed(() => {
  if (!taskForm.value.task_list_id) return true; // Show by default if no list selected
  const settings = listSettings.value[taskForm.value.task_list_id];
  return settings?.showPriority !== false; // Show by default if no settings
});

// Check if due date field should be shown based on selected list settings
const showDueDateField = computed(() => {
  if (!taskForm.value.task_list_id) return true; // Show by default if no list selected
  const settings = listSettings.value[taskForm.value.task_list_id];
  return settings?.showDueDate !== false; // Show by default if no settings
});

// Helper functions
function getAuthToken() {
  return localStorage.getItem('authToken') || '';
}

// List functions
async function fetchLists() {
  try {
    const response = await fetch(`${apiBase}/get_task_lists.php`, {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });

    if (!response.ok) throw new Error('Failed to fetch lists');

    const data = await response.json();
    taskLists.value = data.lists || [];
  } catch (error) {
    console.error('Error fetching lists:', error);
    alert('Fout bij ophalen takenlijsten');
  }
}

async function fetchTasks() {
  try {
    const url = selectedListId.value
      ? `${apiBase}/get_tasks.php?list_id=${selectedListId.value}`
      : `${apiBase}/get_tasks.php`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });

    if (!response.ok) throw new Error('Failed to fetch tasks');

    const data = await response.json();
    tasks.value = data.tasks || [];
  } catch (error) {
    console.error('Error fetching tasks:', error);
    alert('Fout bij ophalen taken');
  }
}

function selectList(listId) {
  selectedListId.value = listId;
  fetchTasks();
}

async function createList() {
  try {
    const response = await fetch(`${apiBase}/create_task_list.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify(newListForm.value),
    });

    if (!response.ok) throw new Error('Failed to create list');

    const data = await response.json();
    if (data.success) {
      await fetchLists();
      closeNewListModal();
      selectList(data.list.id);
    }
  } catch (error) {
    console.error('Error creating list:', error);
    alert('Fout bij aanmaken lijst');
  }
}

async function updateList() {
  try {
    const response = await fetch(`${apiBase}/update_task_list.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify({
        id: editingList.value.id,
        ...editListForm.value,
      }),
    });

    if (!response.ok) throw new Error('Failed to update list');

    const data = await response.json();
    if (data.success) {
      await fetchLists();
      closeEditListModal();
    }
  } catch (error) {
    console.error('Error updating list:', error);
    alert('Fout bij bijwerken lijst');
  }
}

async function deleteList() {
  if (!confirm('Weet je zeker dat je deze lijst wilt verwijderen? Alle taken in deze lijst worden ook verwijderd.')) {
    return;
  }

  try {
    const response = await fetch(`${apiBase}/delete_task_list.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify({ id: editingList.value.id }),
    });

    if (!response.ok) throw new Error('Failed to delete list');

    const data = await response.json();
    if (data.success) {
      if (selectedListId.value === editingList.value.id) {
        selectedListId.value = null;
      }
      await fetchLists();
      await fetchTasks();
      closeEditListModal();
    }
  } catch (error) {
    console.error('Error deleting list:', error);
    alert('Fout bij verwijderen lijst');
  }
}

function openListMenu(list) {
  editingList.value = list;
  editListForm.value = {
    name: list.name,
    color: list.color,
  };
  showEditListModal.value = true;
}

async function fetchAllUsers() {
  try {
    const response = await fetch(`${apiBase}/get_all_users.php`, {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });

    if (!response.ok) throw new Error('Failed to fetch users');

    const data = await response.json();
    allUsers.value = data.users || [];
  } catch (error) {
    console.error('Error fetching users:', error);
  }
}

async function openShareListModal() {
  showShareListModal.value = true;
  await Promise.all([fetchListShares(), fetchAllUsers()]);
}

async function fetchListShares() {
  if (!selectedListId.value) return;

  try {
    const response = await fetch(
      `${apiBase}/get_list_shares.php?list_id=${selectedListId.value}`,
      {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      }
    );

    if (!response.ok) throw new Error('Failed to fetch shares');

    const data = await response.json();
    listShares.value = data.shares || [];
  } catch (error) {
    console.error('Error fetching list shares:', error);
  }
}

async function shareList() {
  if (!shareListForm.value.shared_with_user_id) {
    alert('Selecteer een gebruiker');
    return;
  }

  try {
    const response = await fetch(`${apiBase}/share_task_list.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify({
        list_id: selectedListId.value,
        ...shareListForm.value,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.error || 'Fout bij delen lijst');
      return;
    }

    if (data.success) {
      shareListForm.value = { shared_with_user_id: null, permission_level: 'view' };
      await fetchListShares();
      alert('Lijst gedeeld!');
    }
  } catch (error) {
    console.error('Error sharing list:', error);
    alert('Fout bij delen lijst');
  }
}

async function unshareList(sharedWithUserId) {
  if (!confirm('Weet je zeker dat je de toegang wilt intrekken?')) {
    return;
  }

  try {
    const response = await fetch(`${apiBase}/unshare_task_list.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify({
        list_id: selectedListId.value,
        shared_with_user_id: sharedWithUserId,
      }),
    });

    if (!response.ok) throw new Error('Failed to unshare');

    const data = await response.json();
    if (data.success) {
      await fetchListShares();
    }
  } catch (error) {
    console.error('Error unsharing list:', error);
    alert('Fout bij intrekken toegang');
  }
}

// Task functions
async function saveTask() {
  try {
    // First upload image if selected
    if (selectedImageFile.value) {
      const formData = new FormData();
      formData.append('image', selectedImageFile.value);

      const uploadResponse = await fetch(`${apiBase}/upload_task_image.php`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
        body: formData,
      });

      if (uploadResponse.ok) {
        const uploadData = await uploadResponse.json();
        taskForm.value.image_path = uploadData.image_path;
      }
    }

    const url = editingTask.value
      ? `${apiBase}/update_task.php`
      : `${apiBase}/create_task.php`;

    const payload = editingTask.value
      ? { id: editingTask.value.id, ...taskForm.value }
      : taskForm.value;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) throw new Error('Failed to save task');

    const data = await response.json();
    if (data.success) {
      await fetchTasks();
      await fetchLists(); // Update counts
      closeModal();
    }
  } catch (error) {
    console.error('Error saving task:', error);
    alert('Fout bij opslaan taak');
  }
}

async function toggleTask(task) {
  try {
    const response = await fetch(`${apiBase}/update_task.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify({
        id: task.id,
        completed: !task.completed,
      }),
    });

    if (!response.ok) throw new Error('Failed to toggle task');

    const data = await response.json();
    if (data.success) {
      task.completed = !task.completed;
      await fetchLists(); // Update counts
    }
  } catch (error) {
    console.error('Error toggling task:', error);
    alert('Fout bij bijwerken taak');
  }
}

function editTask(task) {
  if (!canEdit(task)) return;

  editingTask.value = task;
  taskForm.value = {
    title: task.title,
    description: task.description || '',
    image_path: task.image_path || null,
    priority: task.priority,
    due_date: task.due_date || '',
    task_list_id: task.task_list_id,
  };
  imagePreview.value = null;
  selectedImageFile.value = null;
  showAddTask.value = true;
}

async function confirmDelete(task) {
  if (!confirm('Weet je zeker dat je deze taak wilt verwijderen?')) {
    return;
  }

  console.log('Deleting task:', task);
  console.log('Task list ID:', task.task_list_id);
  console.log('Task type:', task.task_type);
  console.log('Permission level:', task.permission_level);

  try {
    const response = await fetch(`${apiBase}/delete_task.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify({ id: task.id }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Delete task error response:', errorData);
      throw new Error(errorData.error || 'Failed to delete task');
    }

    const data = await response.json();
    if (data.success) {
      tasks.value = tasks.value.filter((t) => t.id !== task.id);
      await fetchLists(); // Update counts
    }
  } catch (error) {
    console.error('Error deleting task:', error);
    alert(`Fout bij verwijderen taak: ${error.message}`);
  }
}

async function deleteAllCompleted() {
  if (!confirm('Weet je zeker dat je alle voltooide taken wilt verwijderen?')) {
    return;
  }

  const completedTasksToDelete = completedTasks.value;

  for (const task of completedTasksToDelete) {
    if (canEdit(task)) {
      try {
        await fetch(`${apiBase}/delete_task.php`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${getAuthToken()}`,
          },
          body: JSON.stringify({ id: task.id }),
        });
      } catch (error) {
        console.error('Error deleting task:', task.id, error);
      }
    }
  }

  await fetchTasks();
  await fetchLists();
}

// Modal functions
function closeModal() {
  showAddTask.value = false;
  editingTask.value = null;
  taskForm.value = {
    title: '',
    description: '',
    image_path: null,
    priority: 'medium',
    due_date: '',
    task_list_id: selectedListId.value,
  };
  imagePreview.value = null;
  selectedImageFile.value = null;
}

// Image handling functions
function handleImageSelect(event) {
  const file = event.target.files[0];
  if (!file) return;

  // Validate file type
  if (!file.type.startsWith('image/')) {
    alert('Alleen afbeeldingen zijn toegestaan');
    return;
  }

  // Validate file size (5MB)
  if (file.size > 5 * 1024 * 1024) {
    alert('Afbeelding te groot (max 5MB)');
    return;
  }

  selectedImageFile.value = file;

  // Create preview
  const reader = new FileReader();
  reader.onload = (e) => {
    imagePreview.value = e.target.result;
  };
  reader.readAsDataURL(file);
}

function removeImage() {
  taskForm.value.image_path = null;
  imagePreview.value = null;
  selectedImageFile.value = null;
  if (imageInput.value) {
    imageInput.value.value = '';
  }
}

function openImagePopup(imageUrl) {
  popupImageUrl.value = imageUrl;
  showImagePopup.value = true;
}

function closeImagePopup() {
  showImagePopup.value = false;
  popupImageUrl.value = '';
}

function closeNewListModal() {
  showNewListModal.value = false;
  newListForm.value = {
    name: '',
    color: '#fa0101',
  };
}

function closeEditListModal() {
  showEditListModal.value = false;
  editingList.value = null;
}

function closeShareListModal() {
  showShareListModal.value = false;
  shareListForm.value = {
    shared_with_user_id: null,
    permission_level: 'view',
  };
  listShares.value = [];
  allUsers.value = [];
}

// Initialize
onMounted(async () => {
  const token = getAuthToken();
  if (!token) {
    navigateTo('/login');
    return;
  }

  // Load list settings from localStorage
  const savedSettings = localStorage.getItem('taskListSettings');
  if (savedSettings) {
    listSettings.value = JSON.parse(savedSettings);
  }

  await fetchLists();
  await fetchTasks();

  // Set default list for new tasks
  if (taskLists.value.length > 0) {
    taskForm.value.task_list_id = taskLists.value[0].id;
  }
});

// Watch for when modal opens to set default list
watch(showAddTask, (isShown) => {
  if (isShown && !editingTask.value) {
    // Set to current list or first editable list
    if (selectedListId.value) {
      taskForm.value.task_list_id = selectedListId.value;
    } else if (editableLists.value.length > 0) {
      taskForm.value.task_list_id = editableLists.value[0].id;
    }
  }
});
</script>

<style scoped>
.tasks-page {
  display: flex;
  height: calc(100vh - 60px);
  background: #f5f5f5;
}

.tasks-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Responsive */
@media (max-width: 768px) {
  .tasks-page {
    flex-direction: column;
  }
}
</style>
