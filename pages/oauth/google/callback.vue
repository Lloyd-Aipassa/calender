<template>
  <div class="callback-container">
    <div class="callback-card">
      <div v-if="loading">
        <h2>Google Calendar koppelen...</h2>
        <p>Een moment geduld, we verwerken je autorisatie.</p>
        <div class="spinner"></div>
      </div>
      <div v-else-if="error">
        <h2>Er is een fout opgetreden</h2>
        <p class="error">{{ error }}</p>
        <button @click="goToSettings" class="btn">Terug naar instellingen</button>
      </div>
      <div v-else>
        <h2>Succesvol gekoppeld!</h2>
        <p>Je Google Calendar is nu gekoppeld. Je wordt doorgestuurd...</p>
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

onMounted(async () => {
  // Haal code en state uit query parameters
  const code = route.query.code;
  const state = route.query.state;

  if (!code) {
    error.value = 'Geen autorisatiecode ontvangen van Google';
    loading.value = false;
    return;
  }

  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      error.value = 'Je bent niet ingelogd';
      loading.value = false;
      return;
    }

    // Stuur code naar backend om tokens uit te wisselen
    const response = await $fetch(`${apiBase}/callback_google.php`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        code: code,
        state: state
      })
    });

    if (response.success) {
      // Success! Close browser if native app, otherwise redirect
      loading.value = false;

      const { Capacitor } = await import('@capacitor/core');
      if (Capacitor.isNativePlatform()) {
        // Close the browser and navigate to settings
        const { Browser } = await import('@capacitor/browser');
        await Browser.close();
        navigateTo('/settings?google_connected=1');
      } else {
        // Web browser - just redirect
        setTimeout(() => {
          navigateTo('/settings?google_connected=1');
        }, 1000);
      }
    } else {
      error.value = response.error || 'Kon verbinding niet voltooien';
      loading.value = false;
    }
  } catch (err) {
    console.error('Callback error:', err);
    error.value = err.data?.error || 'Er is een fout opgetreden bij het koppelen';
    loading.value = false;
  }
});

function goToSettings() {
  navigateTo('/settings');
}
</script>

<style scoped>
.callback-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 20px;
  background: #f5f5f5;
}

.callback-card {
  background: white;
  padding: 40px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  text-align: center;
  max-width: 500px;
}

h2 {
  margin-bottom: 20px;
  color: #333;
}

p {
  color: #666;
  margin-bottom: 20px;
}

.error {
  color: #dc3545;
}

.spinner {
  margin: 20px auto;
  width: 50px;
  height: 50px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.btn {
  padding: 10px 20px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

.btn:hover {
  background: #0056b3;
}
</style>
