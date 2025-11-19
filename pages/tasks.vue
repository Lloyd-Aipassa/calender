<template>
  <div class="tasks-page">
    <!-- Sidebar with lists -->
    <div class="tasks-sidebar">
      <div class="sidebar-header">
        <h3>Mijn Lijsten</h3>
        <button @click="showNewListModal = true" class="btn-icon" title="Nieuwe lijst">+</button>
      </div>

      <div class="lists-container">
        <!-- All tasks option -->
        <div
          @click="selectList(null)"
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
          @click="selectList(list.id)"
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
              @click="openListMenu(list)"
              class="btn-icon-small">
              ⋮
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Main content -->
    <div class="tasks-main">
      <div class="tasks-header">
        <h2>{{ currentListName }}</h2>

        <!-- Mobile list selector -->
        <select
          v-model="selectedListId"
          @change="selectList(selectedListId)"
          class="mobile-list-selector">
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
            @click="openShareListModal"
            class="btn-share">
            👥 Delen
          </button>
          <button @click="showAddTask = true" class="btn-primary">
            <span>+</span>
            Nieuwe Taak
          </button>
        </div>
      </div>

      <!-- Filter knoppen -->
      <div class="filter-section">
        <div class="filter-buttons">
          <button @click="filter = 'all'" :class="['filter-btn', { active: filter === 'all' }]">
            Alle ({{ filteredTasks.length }})
          </button>
          <button
            @click="filter = 'active'"
            :class="['filter-btn', { active: filter === 'active' }]">
            Actief ({{ activeTasks.length }})
          </button>
          <button
            @click="filter = 'completed'"
            :class="['filter-btn', { active: filter === 'completed' }]">
            Voltooid ({{ completedTasks.length }})
          </button>
        </div>

        <button
          v-if="filter === 'completed' && completedTasks.length > 0"
          @click="deleteAllCompleted"
          class="btn-delete-all"
          title="Verwijder alle voltooide taken">
          🗑️ Alles Verwijderen
        </button>
      </div>

      <!-- Taken lijst -->
      <div class="tasks-list">
        <div v-if="displayedTasks.length === 0" class="empty-state">
          <p>Geen taken gevonden</p>
        </div>

        <div
          v-for="task in displayedTasks"
          :key="task.id"
          :class="['task-item', { completed: task.completed }, `priority-${task.priority}`]">
          <div class="task-checkbox">
            <input
              type="checkbox"
              :checked="task.completed"
              @change="toggleTask(task)"
              :disabled="!canEdit(task)" />
          </div>

          <div class="task-content" @click="editTask(task)">
            <div class="task-header-row">
              <div class="task-title">{{ task.title }}</div>
              <img
                v-if="task.image_path"
                :src="`${apiBase.replace('/endpoints', '')}/${task.image_path}`"
                alt="Task image"
                class="task-thumbnail"
                @click.stop="openImagePopup(`${apiBase.replace('/endpoints', '')}/${task.image_path}`)" />
            </div>
            <div v-if="task.description" class="task-description">{{ task.description }}</div>
            <div class="task-meta">
              <span v-if="task.due_date" class="task-due-date">
                <img src="/svg/calendar.svg" width="15" alt="" />
                {{ formatDate(task.due_date) }}
              </span>
              <span :class="['task-priority', `priority-${task.priority}`]">
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
            v-if="canEdit(task)"
            @click="confirmDelete(task)"
            class="btn-delete"
            title="Verwijderen">
            <img src="/svg/trash.svg" width="15" alt="" />
          </button>
        </div>
      </div>
    </div>

    <!-- New List Modal -->
    <div v-if="showNewListModal" class="modal-overlay" @click="closeNewListModal">
      <div class="modal" @click.stop>
        <h3>Nieuwe Takenlijst</h3>
        <form @submit.prevent="createList">
          <div class="form-group">
            <label>Naam:</label>
            <input
              v-model="newListForm.name"
              type="text"
              required
              placeholder="Bijv. Boodschappen, Werk, Privé" />
          </div>

          <div class="form-group">
            <label>Kleur:</label>
            <div class="color-picker">
              <div
                v-for="color in colorOptions"
                :key="color"
                @click="newListForm.color = color"
                :class="['color-option', { selected: newListForm.color === color }]"
                :style="{ backgroundColor: color }"></div>
            </div>
          </div>

          <div class="modal-actions">
            <button type="button" @click="closeNewListModal" class="btn-secondary">
              Annuleren
            </button>
            <button type="submit" class="btn-primary">Aanmaken</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Share List Modal -->
    <div v-if="showShareListModal" class="modal-overlay" @click="closeShareListModal">
      <div class="modal modal-large" @click.stop>
        <h3>Lijst Delen: {{ currentList?.name }}</h3>

        <!-- Invite form -->
        <div class="share-section">
          <h4>Deel met gebruiker</h4>
          <form @submit.prevent="shareList" class="invite-form">
            <select v-model="shareListForm.shared_with_user_id" required class="invite-user">
              <option :value="null" disabled>Selecteer een gebruiker</option>
              <option
                v-for="user in availableUsers"
                :key="user.id"
                :value="user.id">
                {{ user.name }} ({{ user.email }})
              </option>
            </select>
            <select v-model="shareListForm.permission_level" class="invite-permission">
              <option value="view">Alleen bekijken</option>
              <option value="edit">Bekijken en bewerken</option>
            </select>
            <button type="submit" class="btn-primary">Delen</button>
          </form>
        </div>

        <!-- Shared with -->
        <div v-if="listShares.length > 0" class="share-section">
          <h4>Gedeeld met</h4>
          <div class="shared-list">
            <div v-for="share in listShares" :key="share.id" class="shared-item">
              <div class="shared-info">
                <div class="shared-name">{{ share.user_name }}</div>
                <div class="shared-email">{{ share.user_email }}</div>
                <div class="shared-permission">
                  {{
                    share.permission_level === 'edit' ? '✏️ Kan bewerken' : '👁️ Kan alleen bekijken'
                  }}
                </div>
              </div>
              <button @click="unshareList(share.shared_with_user_id)" class="btn-revoke">
                Intrekken
              </button>
            </div>
          </div>
        </div>

        <div class="modal-actions">
          <button type="button" @click="closeShareListModal" class="btn-secondary">
            Sluiten
          </button>
        </div>
      </div>
    </div>

    <!-- Add/Edit Task Modal -->
    <div v-if="showAddTask" class="modal-overlay" @click="closeModal">
      <div class="modal" @click.stop>
        <h3>{{ editingTask ? 'Taak Bewerken' : 'Nieuwe Taak' }}</h3>
        <form @submit.prevent="saveTask">
          <div class="form-group">
            <label>Titel:</label>
            <input
              v-model="taskForm.title"
              type="text"
              required
              placeholder="Bijv. Boodschappen doen" />
          </div>

          <div class="form-group">
            <label>Beschrijving:</label>
            <textarea
              v-model="taskForm.description"
              rows="3"
              placeholder="Optionele beschrijving"></textarea>
          </div>

          <div class="form-group">
            <label>Afbeelding:</label>
            <div class="image-upload-container">
              <input
                ref="imageInput"
                type="file"
                accept="image/*"
                @change="handleImageSelect"
                class="image-input" />
              <button
                type="button"
                @click="$refs.imageInput.click()"
                class="btn-upload">
                📷 Afbeelding kiezen
              </button>
              <div v-if="taskForm.image_path || imagePreview" class="image-preview">
                <img
                  :src="imagePreview || `${apiBase.replace('/endpoints', '')}/${taskForm.image_path}`"
                  alt="Task image"
                  @click="openImagePopup(imagePreview || `${apiBase.replace('/endpoints', '')}/${taskForm.image_path}`)" />
                <button
                  type="button"
                  @click="removeImage"
                  class="btn-remove-image">
                  ✕
                </button>
              </div>
            </div>
          </div>

          <div class="form-group">
            <label>Takenlijst:</label>
            <select v-model="taskForm.task_list_id" required>
              <option :value="null" disabled>Selecteer een lijst</option>
              <option v-for="list in editableLists" :key="list.id" :value="list.id">
                {{ list.name }}
              </option>
            </select>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Prioriteit:</label>
              <select v-model="taskForm.priority">
                <option value="low">Laag</option>
                <option value="medium">Gemiddeld</option>
                <option value="high">Hoog</option>
              </select>
            </div>

            <div class="form-group">
              <label>Vervaldatum:</label>
              <input v-model="taskForm.due_date" type="date" />
            </div>
          </div>

          <div class="modal-actions">
            <button type="button" @click="closeModal" class="btn-secondary">Annuleren</button>
            <button type="submit" class="btn-primary">
              {{ editingTask ? 'Bijwerken' : 'Toevoegen' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Image Popup Modal -->
    <div v-if="showImagePopup" class="image-popup-overlay" @click="closeImagePopup">
      <div class="image-popup">
        <button @click="closeImagePopup" class="close-popup">✕</button>
        <img :src="popupImageUrl" alt="Full size image" />
      </div>
    </div>

    <!-- Edit List Modal -->
    <div v-if="showEditListModal" class="modal-overlay" @click="closeEditListModal">
      <div class="modal" @click.stop>
        <h3>Lijst Bewerken</h3>
        <form @submit.prevent="updateList">
          <div class="form-group">
            <label>Naam:</label>
            <input v-model="editListForm.name" type="text" required />
          </div>

          <div class="form-group">
            <label>Kleur:</label>
            <div class="color-picker">
              <div
                v-for="color in colorOptions"
                :key="color"
                @click="editListForm.color = color"
                :class="['color-option', { selected: editListForm.color === color }]"
                :style="{ backgroundColor: color }"></div>
            </div>
          </div>

          <div class="modal-actions">
            <button type="button" @click="deleteList" class="btn-danger">Verwijderen</button>
            <div style="flex: 1"></div>
            <button type="button" @click="closeEditListModal" class="btn-secondary">
              Annuleren
            </button>
            <button type="submit" class="btn-primary">Opslaan</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
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

// Helper functions
function getAuthToken() {
  return localStorage.getItem('authToken') || '';
}

function canEdit(task) {
  return task.task_type === 'own' || task.permission_level === 'edit';
}

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

/* Main content */
.tasks-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

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

/* Color picker */
.color-picker {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.color-option {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  cursor: pointer;
  border: 3px solid transparent;
  transition: all 0.2s;
}

.color-option:hover {
  transform: scale(1.1);
}

.color-option.selected {
  border-color: #333;
  transform: scale(1.15);
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

.btn-secondary {
  background: #f5f5f5;
  color: #333;
  border: 1px solid #ddd;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
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

.btn-delete-all {
  background: #ff6b6b;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 13px;
}

.btn-danger {
  background: #ff6b6b;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
}

.btn-revoke {
  background: #ff6b6b;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
}

/* Modals */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  border-radius: 12px;
  padding: 24px;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-large {
  max-width: 600px;
}

.modal h3 {
  margin: 0 0 20px 0;
  color: #333;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
  color: #333;
  font-size: 14px;
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
}

.form-row {
  display: flex;
  gap: 16px;
}

.form-row .form-group {
  flex: 1;
}

.modal-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 20px;
}

/* Image upload styles */
.image-upload-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.image-input {
  display: none;
}

.btn-upload {
  padding: 10px 15px;
  background: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  align-self: flex-start;
}

.btn-upload:hover {
  background: #45a049;
}

.image-preview {
  position: relative;
  width: fit-content;
}

.image-preview img {
  max-width: 200px;
  max-height: 150px;
  border-radius: 4px;
  border: 2px solid #ddd;
  cursor: pointer;
  transition: transform 0.2s;
}

.image-preview img:hover {
  transform: scale(1.05);
}

.btn-remove-image {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #f44336;
  color: white;
  border: none;
  cursor: pointer;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.btn-remove-image:hover {
  background: #d32f2f;
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

/* Image popup modal */
.image-popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  cursor: pointer;
}

.image-popup {
  max-width: 90%;
  max-height: 90%;
  position: relative;
}

.image-popup img {
  max-width: 100%;
  max-height: 90vh;
  object-fit: contain;
  border-radius: 8px;
}

.close-popup {
  position: absolute;
  top: -40px;
  right: 0;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  color: #333;
  border: none;
  cursor: pointer;
  font-size: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.close-popup:hover {
  background: white;
}

/* Share section */
.share-section {
  margin-bottom: 24px;
  padding-bottom: 24px;
  border-bottom: 1px solid #e0e0e0;
}

.share-section:last-of-type {
  border-bottom: none;
}

.share-section h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.invite-form {
  display: flex;
  gap: 10px;
  align-items: center;
}

.invite-user {
  flex: 1;
  min-width: 200px;
}

.invite-permission {
  width: 180px;
}

.shared-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.shared-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
}

.shared-info {
  flex: 1;
}

.shared-name {
  font-weight: 500;
  color: #333;
  margin-bottom: 2px;
}

.shared-email {
  font-size: 13px;
  color: #666;
  margin-bottom: 4px;
}

.shared-permission {
  font-size: 12px;
  color: #999;
}

/* Responsive */
@media (max-width: 768px) {
  .tasks-page {
    flex-direction: column;
  }

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

  .tasks-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .mobile-list-selector {
    display: block;
  }

  .filter-section {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .form-row {
    flex-direction: column;
  }

  .invite-form {
    flex-direction: column;
  }

  .invite-user,
  .invite-permission {
    width: 100%;
  }
}
</style>
