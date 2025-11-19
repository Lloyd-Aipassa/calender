<template>
  <div class="task-settings-container">
    <div class="task-settings-card">
      <h2>Taken Instellingen</h2>

      <div class="section">
        <h3>Algemeen</h3>
        <p class="description">
          Configureer je taken voorkeuren en instellingen.
        </p>

        <div class="settings-list">
          <!-- Placeholder voor toekomstige instellingen -->
          <div class="setting-item">
            <div class="setting-info">
              <div class="icon">📋</div>
              <div>
                <h4>Standaard Lijst</h4>
                <p class="setting-description">Kies een standaard lijst voor nieuwe taken</p>
              </div>
            </div>
            <select class="setting-select">
              <option>Geen standaard</option>
            </select>
          </div>

          <div class="setting-item">
            <div class="setting-info">
              <div class="icon">🔔</div>
              <div>
                <h4>Notificaties</h4>
                <p class="setting-description">Ontvang herinneringen voor taken</p>
              </div>
            </div>
            <label class="switch">
              <input type="checkbox" v-model="notificationsEnabled">
              <span class="slider"></span>
            </label>
          </div>

          <div class="setting-item">
            <div class="setting-info">
              <div class="icon">✅</div>
              <div>
                <h4>Auto-archiveren</h4>
                <p class="setting-description">Voltooide taken automatisch verbergen</p>
              </div>
            </div>
            <label class="switch">
              <input type="checkbox" v-model="autoArchive">
              <span class="slider"></span>
            </label>
          </div>
        </div>
      </div>

      <div class="section" v-if="taskLists.length > 0">
        <h3>Lijstinstellingen</h3>
        <p class="description">
          Configureer welke velden zichtbaar zijn per takenlijst.
        </p>

        <div class="list-settings">
          <div v-for="list in taskLists" :key="list.id" class="list-setting-card">
            <h4 class="list-name">{{ list.name }}</h4>

            <div class="list-toggles">
              <div class="setting-item-inline">
                <div class="setting-info-inline">
                  <span class="icon-small">🎯</span>
                  <span>Prioriteit tonen</span>
                </div>
                <label class="switch">
                  <input
                    type="checkbox"
                    :checked="listSettings[list.id]?.showPriority"
                    @change="togglePriority(list.id)">
                  <span class="slider"></span>
                </label>
              </div>

              <div class="setting-item-inline">
                <div class="setting-info-inline">
                  <span class="icon-small">📅</span>
                  <span>Vervaldatum tonen</span>
                </div>
                <label class="switch">
                  <input
                    type="checkbox"
                    :checked="listSettings[list.id]?.showDueDate"
                    @change="toggleDueDate(list.id)">
                  <span class="slider"></span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <button @click="goBack" class="btn btn-back">
        Terug naar taken
      </button>
    </div>
  </div>
</template>

<script setup>
// State
const notificationsEnabled = ref(false);
const autoArchive = ref(false);
const taskLists = ref([]);
const listSettings = ref({});

const config = useRuntimeConfig();
const apiBase = config.public.apiBaseUrl;

function getAuthToken() {
  return localStorage.getItem('authToken');
}

// Fetch task lists
async function fetchLists() {
  try {
    const response = await fetch(`${apiBase}/get_task_lists.php`, {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });

    if (!response.ok) throw new Error('Failed to fetch lists');

    const data = await response.json();
    if (data.success) {
      taskLists.value = data.lists || [];
      initializeListSettings();
    }
  } catch (error) {
    console.error('Error fetching lists:', error);
  }
}

// Initialize list settings from localStorage
function initializeListSettings() {
  const savedSettings = localStorage.getItem('taskListSettings');
  if (savedSettings) {
    listSettings.value = JSON.parse(savedSettings);
  }

  // Set defaults for lists that don't have settings yet
  taskLists.value.forEach((list) => {
    if (!listSettings.value[list.id]) {
      listSettings.value[list.id] = {
        showPriority: true,
        showDueDate: true,
      };
    }
  });

  saveListSettings();
}

// Save list settings to localStorage
function saveListSettings() {
  localStorage.setItem('taskListSettings', JSON.stringify(listSettings.value));
}

// Toggle priority setting for a list
function togglePriority(listId) {
  listSettings.value[listId].showPriority = !listSettings.value[listId].showPriority;
  saveListSettings();
}

// Toggle due date setting for a list
function toggleDueDate(listId) {
  listSettings.value[listId].showDueDate = !listSettings.value[listId].showDueDate;
  saveListSettings();
}

// Load settings from localStorage
onMounted(() => {
  notificationsEnabled.value = localStorage.getItem('taskNotificationsEnabled') === 'true';
  autoArchive.value = localStorage.getItem('taskAutoArchive') === 'true';
  fetchLists();
});

// Watch for changes and save to localStorage
watch(notificationsEnabled, (value) => {
  localStorage.setItem('taskNotificationsEnabled', value.toString());
});

watch(autoArchive, (value) => {
  localStorage.setItem('taskAutoArchive', value.toString());
});

function goBack() {
  navigateTo('/tasks');
}
</script>

<style scoped>
.task-settings-container {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.task-settings-card {
  background: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

h2 {
  margin-bottom: 30px;
  color: #333;
}

.section {
  margin-bottom: 40px;
}

.section h3 {
  margin-bottom: 10px;
  color: #333;
}

.description {
  color: #666;
  margin-bottom: 20px;
}

.settings-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: #f9f9f9;
}

.setting-info {
  display: flex;
  align-items: center;
  gap: 15px;
  flex: 1;
}

.icon {
  font-size: 32px;
}

.setting-info h4 {
  margin: 0 0 5px 0;
  color: #333;
}

.setting-description {
  font-size: 14px;
  color: #666;
  margin: 0;
}

.setting-select {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  background: white;
}

/* Toggle Switch */
.switch {
  position: relative;
  display: inline-block;
  width: 60px;
  height: 34px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: .4s;
  border-radius: 34px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 26px;
  width: 26px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: .4s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: #4caf50;
}

input:checked + .slider:before {
  transform: translateX(26px);
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-back {
  margin-top: 20px;
  background-color: #f8f9fa;
  color: #333;
  border: 1px solid #ddd;
}

.btn-back:hover {
  background-color: #e2e6ea;
}

/* List settings */
.list-settings {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.list-setting-card {
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: #f9f9f9;
}

.list-name {
  margin: 0 0 15px 0;
  color: #333;
  font-size: 16px;
  font-weight: 600;
}

.list-toggles {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.setting-item-inline {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background: white;
  border-radius: 6px;
  border: 1px solid #e0e0e0;
}

.setting-info-inline {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: #333;
}

.icon-small {
  font-size: 18px;
}
</style>
