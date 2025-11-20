<template>
  <div class="accept-invite-container">
    <div class="accept-invite-card">
      <h2>Kalender Uitnodiging</h2>

      <div v-if="loading" class="loading">
        <p>Laden...</p>
      </div>

      <div v-else-if="error" class="error-message">
        {{ error }}
        <button @click="goToLogin" class="btn btn-primary">
          Naar login
        </button>
      </div>

      <div v-else-if="success" class="success-message">
        <p>{{ successMessage }}</p>
        <button @click="goToCalendar" class="btn btn-primary">
          Naar kalender
        </button>
      </div>

      <div v-else class="invite-details">
        <p class="invite-text">
          Je bent uitgenodigd om de kalender van <strong>{{ ownerName }}</strong> te bekijken.
        </p>
        <p class="permission-info">
          Je krijgt <strong>{{ permissionText }}</strong> rechten.
        </p>

        <div class="actions">
          <button @click="acceptInvite" class="btn btn-primary" :disabled="accepting">
            {{ accepting ? 'Accepteren...' : 'Accepteren' }}
          </button>
          <button @click="goToLogin" class="btn btn-secondary">
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
const error = ref('');
const success = ref(false);
const successMessage = ref('');
const ownerName = ref('');
const permissionText = ref('');
const accepting = ref(false);
const token = ref('');

onMounted(async () => {
  token.value = route.query.token;

  if (!token.value) {
    error.value = 'Geen geldige uitnodigingslink';
    loading.value = false;
    return;
  }

  // Check of gebruiker ingelogd is
  const authToken = localStorage.getItem('authToken');
  if (!authToken) {
    error.value = 'Je moet ingelogd zijn om deze uitnodiging te accepteren';
    loading.value = false;
    return;
  }

  // Haal invite info op (via get_invites endpoint)
  try {
    const response = await $fetch(`${apiBase}/get_invites.php`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    // Zoek de uitnodiging in received_invites
    const invite = response.received_invites?.find(i => i.invite_token === token.value);

    if (invite) {
      ownerName.value = invite.owner_name || invite.owner_email;
      permissionText.value = invite.permission_level === 'edit' ? 'bekijken en bewerken' : 'alleen bekijken';
      loading.value = false;
    } else {
      error.value = 'Uitnodiging niet gevonden of al verwerkt';
      loading.value = false;
    }
  } catch (err) {
    error.value = 'Kon uitnodiging niet laden';
    loading.value = false;
  }
});

async function acceptInvite() {
  accepting.value = true;
  error.value = '';

  try {
    const authToken = localStorage.getItem('authToken');
    const response = await $fetch(`${apiBase}/accept_invite.php`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token: token.value,
      }),
    });

    if (response.success) {
      success.value = true;
      successMessage.value = `Je hebt nu toegang tot de kalender van ${response.owner_name}!`;
    }
  } catch (err) {
    error.value = err.data?.error || 'Er is een fout opgetreden bij het accepteren';
  } finally {
    accepting.value = false;
  }
}

function goToCalendar() {
  navigateTo('/');
}

function goToLogin() {
  navigateTo('/login');
}
</script>

<style scoped>
.accept-invite-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.accept-invite-card {
  background: white;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  max-width: 500px;
  width: 100%;
}

h2 {
  margin-bottom: 30px;
  color: #333;
  text-align: center;
}

.loading {
  text-align: center;
  padding: 20px;
  color: #666;
}

.invite-details {
  text-align: center;
}

.invite-text {
  font-size: 16px;
  color: #333;
  margin-bottom: 15px;
}

.permission-info {
  font-size: 14px;
  color: #666;
  margin-bottom: 30px;
}

.actions {
  display: flex;
  gap: 10px;
  justify-content: center;
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
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

.btn-secondary:hover {
  background-color: #545b62;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.success-message {
  padding: 20px;
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
  border-radius: 8px;
  margin-bottom: 20px;
  text-align: center;
}

.error-message {
  padding: 20px;
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
  border-radius: 8px;
  margin-bottom: 20px;
  text-align: center;
}
</style>
