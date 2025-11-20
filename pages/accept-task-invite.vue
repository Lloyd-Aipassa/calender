<template>
  <div class="accept-invite-page">
    <div class="invite-card">
      <div v-if="loading" class="loading">
        <div class="spinner"></div>
        <p>Uitnodiging laden...</p>
      </div>

      <div v-else-if="error" class="error-state">
        <div class="error-icon">❌</div>
        <h2>Fout</h2>
        <p>{{ error }}</p>
        <button @click="navigateTo('/tasks')" class="btn-primary">Naar Taken</button>
      </div>

      <div v-else-if="accepted" class="success-state">
        <div class="success-icon">✅</div>
        <h2>Uitnodiging Geaccepteerd!</h2>
        <p>Je hebt nu toegang tot de taken van <strong>{{ ownerName }}</strong></p>
        <p class="permission-info">
          {{ permissionLevel === 'edit' ? '✏️ Je kunt taken bekijken en bewerken' : '👁️ Je kunt taken alleen bekijken' }}
        </p>
        <button @click="navigateTo('/tasks')" class="btn-primary">Ga naar Taken</button>
      </div>

      <div v-else class="invite-details">
        <div class="invite-icon">📋</div>
        <h2>Takenlijst Uitnodiging</h2>
        <p><strong>{{ ownerName }}</strong> heeft je uitgenodigd om zijn/haar taken te delen.</p>

        <div class="permission-box">
          <h3>Toegangsniveau:</h3>
          <p class="permission-text">
            {{ permissionLevel === 'edit' ? '✏️ Bekijken en bewerken' : '👁️ Alleen bekijken' }}
          </p>
        </div>

        <div class="action-buttons">
          <button @click="acceptInvite" class="btn-accept" :disabled="accepting">
            {{ accepting ? 'Accepteren...' : 'Accepteren' }}
          </button>
          <button @click="navigateTo('/tasks')" class="btn-cancel">
            Annuleren
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const config = useRuntimeConfig();
const apiBase = config.public.apiBaseUrl;
const route = useRoute();

const loading = ref(true);
const error = ref(null);
const accepted = ref(false);
const accepting = ref(false);
const ownerName = ref('');
const permissionLevel = ref('');
const token = route.query.token;

function getAuthToken() {
  return localStorage.getItem('authToken') || '';
}

// Check if user is logged in
onBeforeMount(() => {
  const authToken = getAuthToken();
  if (!authToken) {
    navigateTo('/login');
  }
});

// Load invite details on mount
onMounted(async () => {
  if (!token) {
    error.value = 'Geen uitnodigingstoken gevonden';
    loading.value = false;
    return;
  }

  // Just set loading to false, we'll get details when accepting
  loading.value = false;
});

async function acceptInvite() {
  accepting.value = true;
  error.value = null;

  try {
    const response = await $fetch(`${apiBase}/accept_task_invite.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify({ token }),
    });

    if (response.success) {
      accepted.value = true;
      ownerName.value = response.owner_name;
      permissionLevel.value = response.permission_level;
    } else {
      error.value = response.error || 'Fout bij accepteren uitnodiging';
    }
  } catch (err) {
    error.value = err.data?.error || 'Fout bij accepteren uitnodiging. Mogelijk is de uitnodiging verlopen of al geaccepteerd.';
  } finally {
    accepting.value = false;
  }
}
</script>

<style scoped>
.accept-invite-page {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.invite-card {
  background: white;
  border-radius: 16px;
  padding: 40px;
  max-width: 500px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  text-align: center;
}

.loading {
  padding: 40px 20px;
}

.spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #fa0101;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-state,
.success-state {
  padding: 20px 0;
}

.error-icon,
.success-icon,
.invite-icon {
  font-size: 64px;
  margin-bottom: 20px;
}

.invite-details h2,
.success-state h2,
.error-state h2 {
  margin: 0 0 16px 0;
  color: #333;
  font-size: 28px;
}

.invite-details p,
.success-state p,
.error-state p {
  color: #666;
  font-size: 16px;
  line-height: 1.6;
  margin: 0 0 12px 0;
}

.permission-box {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  margin: 30px 0;
}

.permission-box h3 {
  margin: 0 0 10px 0;
  color: #333;
  font-size: 16px;
}

.permission-text {
  font-size: 18px;
  font-weight: 600;
  color: #fa0101;
  margin: 0;
}

.permission-info {
  font-size: 18px;
  font-weight: 600;
  color: #fa0101;
}

.action-buttons {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 30px;
}

.btn-accept {
  background-color: #fa0101;
  color: white;
  border: none;
  padding: 14px 32px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.2s;
}

.btn-accept:hover:not(:disabled) {
  background-color: #c80101;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(250, 1, 1, 0.3);
}

.btn-accept:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-cancel {
  background-color: #6c757d;
  color: white;
  border: none;
  padding: 14px 32px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.2s;
}

.btn-cancel:hover {
  background-color: #5a6268;
}

.btn-primary {
  background-color: #fa0101;
  color: white;
  border: none;
  padding: 14px 32px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.2s;
  margin-top: 20px;
}

.btn-primary:hover {
  background-color: #c80101;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(250, 1, 1, 0.3);
}

@media (max-width: 600px) {
  .invite-card {
    padding: 30px 20px;
  }

  .action-buttons {
    flex-direction: column;
  }

  .btn-accept,
  .btn-cancel {
    width: 100%;
  }
}
</style>
