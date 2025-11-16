<template>
  <div class="tasks-container">
    <div class="tasks-header">
      <h2>Taken</h2>
      <div class="header-actions">
        <button @click="showShareModal = true" class="btn-share">👥 Delen</button>
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
          Alle ({{ tasks.length }})
        </button>
        <button @click="filter = 'active'" :class="['filter-btn', { active: filter === 'active' }]">
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
      <div v-if="filteredTasks.length === 0" class="empty-state">
        <p>Geen taken gevonden</p>
      </div>

      <div
        v-for="task in filteredTasks"
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
          <div class="task-title">{{ task.title }}</div>
          <div v-if="task.description" class="task-description">{{ task.description }}</div>
          <div class="task-meta">
            <span v-if="task.due_date" class="task-due-date">
              <img src="/svg/calendar.svg" width="15" alt="" />
              {{ formatDate(task.due_date) }}
            </span>
            <span :class="['task-priority', `priority-${task.priority}`]">
              {{ priorityLabel(task.priority) }}
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

    <!-- Share Modal -->
    <div v-if="showShareModal" class="modal-overlay" @click="closeShareModal">
      <div class="modal modal-large" @click.stop>
        <h3>Taken Delen</h3>

        <!-- Invite form -->
        <div class="share-section">
          <h4>Persoon uitnodigen</h4>
          <form @submit.prevent="sendInvite" class="invite-form">
            <input
              v-model="inviteForm.email"
              type="email"
              placeholder="Email adres"
              required
              class="invite-email" />
            <select v-model="inviteForm.permission_level" class="invite-permission">
              <option value="view">Alleen bekijken</option>
              <option value="edit">Bekijken en bewerken</option>
            </select>
            <button type="submit" class="btn-primary">Uitnodigen</button>
          </form>
        </div>

        <!-- Shared with (people who have access) -->
        <div v-if="sharedByMe.length > 0" class="share-section">
          <h4>Gedeeld met</h4>
          <div class="shared-list">
            <div v-for="share in sharedByMe" :key="share.id" class="shared-item">
              <div class="shared-info">
                <div class="shared-name">{{ share.shared_with_name }}</div>
                <div class="shared-email">{{ share.shared_with_email }}</div>
                <div class="shared-permission">
                  {{
                    share.permission_level === 'edit' ? '✏️ Kan bewerken' : '👁️ Kan alleen bekijken'
                  }}
                </div>
              </div>
              <button @click="revokeAccess(share.shared_with_user_id)" class="btn-revoke">
                Intrekken
              </button>
            </div>
          </div>
        </div>

        <!-- Pending invites -->
        <div
          v-if="sentInvites.filter((i) => i.status === 'pending').length > 0"
          class="share-section">
          <h4>Uitnodigingen verstuurd</h4>
          <div class="shared-list">
            <div
              v-for="invite in sentInvites.filter((i) => i.status === 'pending')"
              :key="invite.id"
              class="shared-item">
              <div class="shared-info">
                <div class="shared-email">{{ invite.invited_email }}</div>
                <div class="shared-permission">
                  {{
                    invite.permission_level === 'edit'
                      ? '✏️ Kan bewerken'
                      : '👁️ Kan alleen bekijken'
                  }}
                </div>
                <div class="shared-status">⏳ Wacht op acceptatie</div>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-actions">
          <button type="button" @click="closeShareModal" class="btn-secondary">Sluiten</button>
        </div>
      </div>
    </div>

    <!-- Add/Edit Modal -->
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
  </div>
</template>

<script setup>
const config = useRuntimeConfig();
const apiBase = config.public.apiBaseUrl;

// State
const tasks = ref([]);
const showAddTask = ref(false);
const editingTask = ref(null);
const filter = ref('all');
const showShareModal = ref(false);
const sharedByMe = ref([]);
const sentInvites = ref([]);

const taskForm = ref({
  title: '',
  description: '',
  priority: 'medium',
  due_date: '',
});

const inviteForm = ref({
  email: '',
  permission_level: 'view',
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
  return date.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: 'numeric' });
}

// Computed
const activeTasks = computed(() => tasks.value.filter((t) => !t.completed));
const completedTasks = computed(() => tasks.value.filter((t) => t.completed));

const filteredTasks = computed(() => {
  if (filter.value === 'completed') return completedTasks.value;
  // Voor 'all' en 'active' tonen we alleen niet-voltooide taken
  return activeTasks.value;
});

// API calls
async function loadTasks() {
  try {
    const response = await $fetch(`${apiBase}/get_tasks.php`, {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });

    if (response.success) {
      tasks.value = response.tasks || [];
    }
  } catch (error) {
    console.error('Error loading tasks:', error);
  }
}

async function saveTask() {
  try {
    const endpoint = editingTask.value ? 'update_task.php' : 'create_task.php';
    const payload = editingTask.value
      ? { ...taskForm.value, id: editingTask.value.id }
      : taskForm.value;

    const response = await $fetch(`${apiBase}/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify(payload),
    });

    if (response.success) {
      await loadTasks(); // Reload tasks
      closeModal();
    }
  } catch (error) {
    console.error('Error saving task:', error);
    alert('Fout bij opslaan taak');
  }
}

async function toggleTask(task) {
  if (!canEdit(task)) return;

  try {
    await $fetch(`${apiBase}/update_task.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify({
        id: task.id,
        title: task.title,
        description: task.description,
        priority: task.priority,
        due_date: task.due_date,
        completed: !task.completed,
      }),
    });

    await loadTasks();
  } catch (error) {
    console.error('Error toggling task:', error);
  }
}

async function confirmDelete(task) {
  if (confirm(`Weet je zeker dat je "${task.title}" wilt verwijderen?`)) {
    try {
      await $fetch(`${apiBase}/delete_task.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify({ id: task.id }),
      });

      await loadTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
      alert('Fout bij verwijderen taak');
    }
  }
}

async function deleteAllCompleted() {
  const count = completedTasks.value.length;
  if (confirm(`Weet je zeker dat je alle ${count} voltooide taken wilt verwijderen?`)) {
    try {
      // Verwijder alle voltooide taken
      const deletePromises = completedTasks.value
        .filter((task) => canEdit(task))
        .map((task) =>
          $fetch(`${apiBase}/delete_task.php`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${getAuthToken()}`,
            },
            body: JSON.stringify({ id: task.id }),
          })
        );

      await Promise.all(deletePromises);
      await loadTasks();
    } catch (error) {
      console.error('Error deleting completed tasks:', error);
      alert('Fout bij verwijderen voltooide taken');
    }
  }
}

function editTask(task) {
  if (!canEdit(task)) return;

  editingTask.value = task;
  taskForm.value = {
    title: task.title,
    description: task.description || '',
    priority: task.priority,
    due_date: task.due_date || '',
  };
  showAddTask.value = true;
}

function closeModal() {
  showAddTask.value = false;
  editingTask.value = null;
  taskForm.value = {
    title: '',
    description: '',
    priority: 'medium',
    due_date: '',
  };
}

async function loadSharingInfo() {
  try {
    const response = await $fetch(`${apiBase}/get_task_invites.php`, {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });

    if (response.success) {
      sharedByMe.value = response.shared_by_me || [];
      sentInvites.value = response.sent_invites || [];
    }
  } catch (error) {
    console.error('Error loading sharing info:', error);
  }
}

async function sendInvite() {
  try {
    const response = await $fetch(`${apiBase}/send_task_invite.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify(inviteForm.value),
    });

    if (response.success) {
      alert('Uitnodiging verstuurd!');
      inviteForm.value.email = '';
      inviteForm.value.permission_level = 'view';
      await loadSharingInfo();
    }
  } catch (error) {
    console.error('Error sending invite:', error);
    alert(error.data?.error || 'Fout bij versturen uitnodiging');
  }
}

async function revokeAccess(userId) {
  if (confirm('Weet je zeker dat je de toegang wilt intrekken?')) {
    try {
      await $fetch(`${apiBase}/revoke_task_access.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify({ shared_with_user_id: userId }),
      });

      await loadSharingInfo();
    } catch (error) {
      console.error('Error revoking access:', error);
      alert('Fout bij intrekken toegang');
    }
  }
}

function closeShareModal() {
  showShareModal.value = false;
}

// Auth check and load on mount
onBeforeMount(() => {
  const token = getAuthToken();
  if (!token) {
    navigateTo('/login');
  }
});

onMounted(() => {
  const token = getAuthToken();
  if (token) {
    loadTasks();
    loadSharingInfo();
  }
});
</script>

<style scoped>
.tasks-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.tasks-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.tasks-header h2 {
  margin: 0;
  color: #333;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.btn-share {
  background-color: #6c757d;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background-color 0.2s;
}

.btn-share:hover {
  background-color: #5a6268;
}

.filter-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  gap: 15px;
  flex-wrap: wrap;
}

.filter-buttons {
  display: flex;
  gap: 10px;
}

.filter-btn {
  padding: 8px 16px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-btn:hover {
  background: #f8f9fa;
}

.filter-btn.active {
  background: #fa0101;
  color: white;
  border-color: #fa0101;
}

.tasks-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.empty-state {
  text-align: center;
  padding: 40px;
  color: #666;
}

.task-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  border-left: 4px solid #666;
  transition: all 0.2s;
}

.task-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.task-item.completed {
  opacity: 0.6;
}

.task-item.priority-high {
  border-left-color: #fa0101;
}

.task-item.priority-medium {
  border-left-color: #ffa500;
}

.task-item.priority-low {
  border-left-color: #28a745;
}

.task-checkbox input[type='checkbox'] {
  width: 20px;
  height: 20px;
  cursor: pointer;
  margin-top: 2px;
}

.task-content {
  flex: 1;
  cursor: pointer;
}

.task-title {
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.task-item.completed .task-title {
  text-decoration: line-through;
  color: #999;
}

.task-description {
  color: #666;
  font-size: 14px;
  margin-bottom: 8px;
}

.task-meta {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  font-size: 12px;
}

.task-due-date {
  color: #666;
}

.task-priority {
  font-weight: 500;
}

.task-shared {
  color: #666;
  font-style: italic;
}

.btn-delete {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  opacity: 1;
  transition: opacity 0.2s;
}

.btn-delete:hover {
  opacity: 0.5;
}

.btn-primary {
  background-color: #fa0101;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-primary:hover {
  background-color: #c80101;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
}

.btn-delete-all {
  background-color: #dc3545;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: background-color 0.2s;
}

.btn-delete-all:hover {
  background-color: #c82333;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal {
  background: white;
  padding: 30px;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  max-height: 90vh;
  overflow-y: auto;
}

.modal-large {
  max-width: 700px;
}

.modal h3 {
  margin-top: 0;
  margin-bottom: 20px;
  color: #333;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
  color: #333;
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.modal-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 20px;
}

.share-section {
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e0e0e0;
}

.share-section:last-of-type {
  border-bottom: none;
}

.share-section h4 {
  margin: 0 0 15px 0;
  color: #333;
  font-size: 16px;
}

.invite-form {
  display: flex;
  gap: 10px;
}

.invite-email {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.invite-permission {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  min-width: 150px;
}

.shared-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.shared-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 4px;
}

.shared-info {
  flex: 1;
}

.shared-name {
  font-weight: 600;
  color: #333;
  margin-bottom: 2px;
}

.shared-email {
  color: #666;
  font-size: 13px;
  margin-bottom: 4px;
}

.shared-permission {
  font-size: 12px;
  color: #666;
}

.shared-status {
  font-size: 12px;
  color: #ffa500;
  margin-top: 4px;
}

.btn-revoke {
  background-color: #dc3545;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  transition: background-color 0.2s;
}

.btn-revoke:hover {
  background-color: #c82333;
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }

  .invite-form {
    flex-direction: column;
  }

  .invite-permission {
    min-width: auto;
  }

  .shared-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .header-actions {
    flex-wrap: wrap;
  }
}
</style>
