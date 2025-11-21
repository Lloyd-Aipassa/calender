<template>
  <div class="settings-container">
    <div class="settings-card">
      <h2>Instellingen</h2>

      <div v-if="successMessage" class="success-message">
        {{ successMessage }}
      </div>

      <div class="section">
        <h3>Kalender koppelingen</h3>
        <p class="description">
          Koppel je persoonlijke kalender om afspraken automatisch te synchroniseren.
        </p>

        <div class="calendar-connections">
          <!-- Google Calendar -->
          <div class="connection-item">
            <div class="connection-info">
              <div class="icon">📅</div>
              <div>
                <h4>Google Calendar</h4>
                <p v-if="googleConnected" class="status connected">Gekoppeld</p>
                <p v-else class="status disconnected">Niet gekoppeld</p>
              </div>
            </div>
            <button
              v-if="!googleConnected"
              @click="connectGoogle"
              class="btn btn-primary"
              :disabled="isLoading">
              {{ isLoading ? 'Bezig...' : 'Koppelen' }}
            </button>
            <button
              v-else
              @click="disconnectGoogle"
              class="btn btn-secondary"
              :disabled="isLoading">
              Ontkoppelen
            </button>
          </div>

          <!-- Outlook Calendar -->
          <div class="connection-item">
            <div class="connection-info">
              <div class="icon">📧</div>
              <div>
                <h4>Outlook Calendar</h4>
                <p class="status disconnected">Binnenkort beschikbaar</p>
              </div>
            </div>
            <button class="btn btn-secondary" disabled>
              Binnenkort
            </button>
          </div>
        </div>
      </div>

      <!-- Kalender delen sectie -->
      <div class="section">
        <h3>Kalender delen</h3>
        <p class="description">
          Nodig anderen uit om je kalender te bekijken of te bewerken.
        </p>

        <!-- Uitnodigings formulier -->
        <div class="invite-form">
          <input
            v-model="inviteEmail"
            type="email"
            placeholder="Email adres"
            class="invite-input"
            :disabled="isInviting"
          />
          <select v-model="invitePermission" class="invite-select" :disabled="isInviting">
            <option value="view">Alleen bekijken</option>
            <option value="edit">Bekijken & bewerken</option>
          </select>
          <button
            @click="sendInvite"
            class="btn btn-primary"
            :disabled="isInviting || !inviteEmail">
            {{ isInviting ? 'Versturen...' : 'Uitnodigen' }}
          </button>
        </div>

        <!-- Uitnodigings link -->
        <div v-if="inviteLink" class="invite-link-container">
          <p class="invite-link-label">Deel deze link:</p>
          <div class="invite-link-box">
            <input
              type="text"
              :value="inviteLink"
              readonly
              class="invite-link-input"
              ref="inviteLinkInput"
            />
            <button @click="copyInviteLink" class="btn btn-secondary">
              {{ linkCopied ? 'Gekopieerd!' : 'Kopieer' }}
            </button>
          </div>
        </div>

        <!-- Gedeeld met (mensen die toegang hebben) -->
        <div v-if="sharedByMe.length > 0" class="shared-list">
          <h4>Gedeeld met:</h4>
          <div v-for="share in sharedByMe" :key="share.id" class="shared-item">
            <div class="shared-info">
              <strong>{{ share.username || share.email }}</strong>
              <span class="permission-badge">{{ share.permission_level === 'edit' ? 'Bewerken' : 'Bekijken' }}</span>
            </div>
            <button
              @click="revokeAccess(share.shared_with_user_id)"
              class="btn btn-danger btn-small">
              Verwijderen
            </button>
          </div>
        </div>

        <!-- Openstaande uitnodigingen -->
        <div v-if="sentInvites.length > 0" class="invites-list">
          <h4>Openstaande uitnodigingen:</h4>
          <div v-for="invite in sentInvites" :key="invite.id" class="invite-item">
            <div class="invite-info">
              <strong>{{ invite.invited_email }}</strong>
              <span class="status-badge" :class="invite.status">{{ getStatusText(invite.status) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Notificaties sectie -->
      <div class="section">
        <h3>Notificaties</h3>
        <p class="description">
          Zorg ervoor dat je altijd notificaties ontvangt, zelfs als de app afgesloten is.
        </p>

        <div class="notification-help">
          <h4>📱 Android: Battery Optimization uitzetten</h4>
          <p>Om notificaties te ontvangen wanneer de app afgesloten is:</p>
          <ol>
            <li>Ga naar <strong>Instellingen</strong> → <strong>Apps</strong></li>
            <li>Zoek <strong>Chrome</strong> (of de browser waarin je de app gebruikt)</li>
            <li>Tik op <strong>Batterij</strong> of <strong>Battery optimization</strong></li>
            <li>Selecteer <strong>Unrestricted</strong> of <strong>Don't optimize</strong></li>
          </ol>
          <p class="note">💡 Dit zorgt ervoor dat de app notificaties kan ontvangen, zelfs als hij helemaal afgesloten is.</p>
        </div>
      </div>

      <!-- Developer Tools sectie -->
      <div class="section">
        <h3>Developer Tools</h3>
        <p class="description">
          Handige tools voor debugging en app beheer.
        </p>

        <div class="tools-list">
          <!-- Debug Console Toggle -->
          <div class="tool-item">
            <div class="tool-info">
              <div class="icon">🐛</div>
              <div>
                <h4>Debug Console</h4>
                <p class="tool-description">Toon debug console voor mobiele debugging</p>
              </div>
            </div>
            <label class="switch">
              <input type="checkbox" v-model="debugEnabled" @change="toggleDebug">
              <span class="slider"></span>
            </label>
          </div>

          <!-- Refresh Button -->
          <div class="tool-item">
            <div class="tool-info">
              <div class="icon">🔄</div>
              <div>
                <h4>App Verversen</h4>
                <p class="tool-description">Herlaad de hele applicatie (handig voor iOS)</p>
              </div>
            </div>
            <button @click="refreshApp" class="btn btn-secondary">
              Verversen
            </button>
          </div>
        </div>
      </div>

      <div v-if="error" class="error-message">
        {{ error }}
      </div>

      <button @click="goBack" class="btn btn-back">
        Terug naar kalender
      </button>
    </div>
  </div>
</template>

<script setup>
// Get runtime config for API base URL
const config = useRuntimeConfig();
const apiBase = config.public.apiBaseUrl;

const googleConnected = ref(false);
const isLoading = ref(false);
const error = ref('');
const successMessage = ref('');

// Kalender delen
const inviteEmail = ref('');
const invitePermission = ref('view');
const isInviting = ref(false);
const inviteLink = ref('');
const linkCopied = ref(false);
const inviteLinkInput = ref(null);
const sharedByMe = ref([]);
const sentInvites = ref([]);

// Developer Tools
const debugEnabled = ref(false);

// Check for success message from callback
onMounted(() => {
  // Load debug state from localStorage
  debugEnabled.value = localStorage.getItem('debugEnabled') === 'true';

  const route = useRoute();
  if (route.query.google_connected === '1') {
    successMessage.value = 'Google Calendar succesvol gekoppeld!';
    googleConnected.value = true;
    // Remove query param
    window.history.replaceState({}, '', '/settings');
  }

  // Check huidige status
  checkConnections();
  loadInvites();
});

async function checkConnections() {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) return;

    const response = await $fetch(`${apiBase}/get_connections.php`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.success) {
      googleConnected.value = response.connections.google || false;
    }
  } catch (err) {
  }
}

async function connectGoogle() {
  isLoading.value = true;
  error.value = '';

  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      error.value = 'Je bent niet ingelogd';
      return;
    }

    const response = await $fetch(`${apiBase}/connect_google.php`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.success && response.auth_url) {
      // Redirect naar Google OAuth
      window.location.href = response.auth_url;
    } else {
      error.value = 'Kon koppeling niet starten';
    }
  } catch (err) {
    error.value = err.data?.error || 'Er is een fout opgetreden';
  } finally {
    isLoading.value = false;
  }
}

async function disconnectGoogle() {
  if (!confirm('Weet je zeker dat je Google Calendar wilt ontkoppelen?')) {
    return;
  }

  isLoading.value = true;
  error.value = '';

  try {
    const token = localStorage.getItem('authToken');
    const response = await $fetch(`${apiBase}/disconnect_calendar.php`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ calendar_type: 'google' }),
    });

    if (response.success) {
      googleConnected.value = false;
      successMessage.value = 'Google Calendar ontkoppeld';
    }
  } catch (err) {
    error.value = err.data?.error || 'Er is een fout opgetreden';
  } finally {
    isLoading.value = false;
  }
}

function goBack() {
  navigateTo('/');
}

// Kalender delen functies
async function loadInvites() {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) return;

    const response = await $fetch(`${apiBase}/get_invites.php`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.success) {
      sharedByMe.value = response.shared_by_me || [];
      sentInvites.value = response.sent_invites.filter(i => i.status === 'pending') || [];
    }
  } catch (err) {
  }
}

async function sendInvite() {
  if (!inviteEmail.value) return;

  isInviting.value = true;
  error.value = '';
  inviteLink.value = '';
  linkCopied.value = false;

  try {
    const token = localStorage.getItem('authToken');
    const response = await $fetch(`${apiBase}/send_invite.php`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: inviteEmail.value,
        permission: invitePermission.value,
      }),
    });

    if (response.success) {
      successMessage.value = 'Uitnodiging verstuurd!';
      inviteLink.value = response.invite_link;
      inviteEmail.value = '';
      loadInvites();
    }
  } catch (err) {
    error.value = err.data?.error || 'Er is een fout opgetreden bij het versturen';
  } finally {
    isInviting.value = false;
  }
}

async function copyInviteLink() {
  try {
    await navigator.clipboard.writeText(inviteLink.value);
    linkCopied.value = true;
    setTimeout(() => {
      linkCopied.value = false;
    }, 2000);
  } catch (err) {
  }
}

async function revokeAccess(userId) {
  if (!confirm('Weet je zeker dat je de toegang wilt verwijderen?')) {
    return;
  }

  try {
    const token = localStorage.getItem('authToken');
    const response = await $fetch(`${apiBase}/revoke_access.php`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        shared_user_id: userId,
      }),
    });

    if (response.success) {
      successMessage.value = 'Toegang verwijderd';
      loadInvites();
    }
  } catch (err) {
    error.value = err.data?.error || 'Er is een fout opgetreden';
  }
}

function getStatusText(status) {
  const statusMap = {
    pending: 'In afwachting',
    accepted: 'Geaccepteerd',
    declined: 'Geweigerd',
    cancelled: 'Geannuleerd'
  };
  return statusMap[status] || status;
}

// Developer Tools functions
function toggleDebug() {
  // Save to localStorage
  localStorage.setItem('debugEnabled', debugEnabled.value.toString());

  if (debugEnabled.value) {
    // Enable Eruda
    if (!window.eruda) {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/eruda';
      document.body.appendChild(script);
      script.onload = () => {
        window.eruda.init();
      };
    } else {
      window.eruda.show();
    }
  } else {
    // Disable Eruda
    if (window.eruda) {
      window.eruda.hide();
    }
  }
}

function refreshApp() {
  // Full page reload (clears cache and reloads everything)
  window.location.reload(true);
}
</script>

<style scoped>
.settings-container {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.settings-card {
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

.calendar-connections {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.connection-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: #f9f9f9;
}

.connection-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.icon {
  font-size: 32px;
}

.connection-info h4 {
  margin: 0 0 5px 0;
  color: #333;
}

.status {
  font-size: 14px;
  margin: 0;
}

.status.connected {
  color: #28a745;
  font-weight: 500;
}

.status.disconnected {
  color: #6c757d;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #0056b3;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background-color: #545b62;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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

.success-message {
  padding: 15px;
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
  border-radius: 4px;
  margin-bottom: 20px;
}

.error-message {
  padding: 15px;
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
  border-radius: 4px;
  margin-top: 20px;
}

/* Kalender delen styles */
.invite-form {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.invite-input {
  flex: 1;
  min-width: 200px;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.invite-select {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  background: white;
}

.invite-link-container {
  margin: 20px 0;
  padding: 15px;
  background: #f0f8ff;
  border: 1px solid #b3d9ff;
  border-radius: 4px;
}

.invite-link-label {
  margin: 0 0 10px 0;
  font-weight: 500;
  color: #333;
}

.invite-link-box {
  display: flex;
  gap: 10px;
}

.invite-link-input {
  flex: 1;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  background: white;
}

.shared-list,
.invites-list {
  margin-top: 20px;
}

.shared-list h4,
.invites-list h4 {
  margin-bottom: 10px;
  color: #333;
}

.shared-item,
.invite-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-bottom: 8px;
  background: white;
}

.shared-info,
.invite-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.permission-badge,
.status-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.permission-badge {
  background: #e3f2fd;
  color: #1976d2;
}

.status-badge.pending {
  background: #fff3cd;
  color: #856404;
}

.status-badge.accepted {
  background: #d4edda;
  color: #155724;
}

.status-badge.declined {
  background: #f8d7da;
  color: #721c24;
}

.btn-danger {
  background-color: #dc3545;
  color: white;
}

.btn-danger:hover {
  background-color: #c82333;
}

.btn-small {
  padding: 6px 12px;
  font-size: 14px;
}

/* Developer Tools styles */
.tools-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.tool-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: #f9f9f9;
}

.tool-info {
  display: flex;
  align-items: center;
  gap: 15px;
  flex: 1;
}

.tool-info h4 {
  margin: 0 0 5px 0;
  color: #333;
}

.tool-description {
  font-size: 14px;
  color: #666;
  margin: 0;
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

/* Notification help styles */
.notification-help {
  background: #fff3cd;
  border: 1px solid #ffc107;
  border-radius: 8px;
  padding: 20px;
}

.notification-help h4 {
  margin: 0 0 15px 0;
  color: #333;
}

.notification-help ol {
  margin: 15px 0;
  padding-left: 20px;
}

.notification-help li {
  margin-bottom: 8px;
  color: #666;
}

.notification-help .note {
  margin: 15px 0 0 0;
  padding: 10px;
  background: #fff;
  border-left: 4px solid #ffc107;
  font-size: 14px;
  color: #666;
}
</style>
