<template>
  <div class="login-container">
    <div class="login-card">
      <h2>{{ isRegister ? 'Registreren' : 'Inloggen' }}</h2>

      <form @submit.prevent="handleSubmit">
        <div v-if="isRegister" class="form-group">
          <label for="name">Naam:</label>
          <input id="name" v-model="credentials.name" type="text" required placeholder="Je naam" />
        </div>

        <div class="form-group">
          <label for="email">Email:</label>
          <input
            id="email"
            v-model="credentials.email"
            type="email"
            required
            placeholder="je@email.com" />
        </div>

        <div class="form-group">
          <label for="password">Wachtwoord:</label>
          <input
            id="password"
            v-model="credentials.password"
            type="password"
            required
            placeholder="Je wachtwoord" />
        </div>

        <button type="submit" class="login-btn" :disabled="isLoading">
          {{ isLoading ? 'Bezig...' : isRegister ? 'Registreren' : 'Inloggen' }}
        </button>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <div class="switch-mode">
          <button type="button" @click="toggleMode" class="link-btn">
            {{ isRegister ? 'Al een account? Inloggen' : 'Nog geen account? Registreren' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
// Reactive data
const isRegister = ref(false);
const credentials = ref({
  name: '',
  email: '',
  password: '',
});

const isLoading = ref(false);
const error = ref('');

function toggleMode() {
  isRegister.value = !isRegister.value;
  error.value = '';
  credentials.value = { name: '', email: '', password: '' };
}

// Handle form submission
async function handleSubmit() {
  isLoading.value = true;
  error.value = '';

  try {
    const action = isRegister.value ? 'register' : 'login';
    const payload = {
      action: action,
      email: credentials.value.email,
      password: credentials.value.password,
    };

    if (isRegister.value) {
      payload.name = credentials.value.name;
    }

    console.log('Sending:', payload);

    const config = useRuntimeConfig()
    const apiBase = config.public.apiBaseUrl || 'https://calender.brooklynwebdesign.nl'

    const response = await $fetch(
      `${apiBase}/auth.php`,
      {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('Response:', response);

    if (response.success) {
      // Store the token
      localStorage.setItem('authToken', response.token);
      console.log('Token saved:', response.token);

      // Check if there's a redirect URL in query params
      const route = useRoute();
      const redirectUrl = route.query.redirect;

      if (redirectUrl) {
        // Redirect to the specified URL (e.g., accept-invite page)
        window.location.href = redirectUrl;
      } else {
        // Redirect to calendar
        await navigateTo('/');
      }
    } else {
      error.value =
        response.error || (isRegister.value ? 'Registratie mislukt' : 'Inloggen mislukt');
    }
  } catch (err) {
    console.error('Auth error:', err);
    error.value = err.data?.error || 'Er is een fout opgetreden';
  } finally {
    isLoading.value = false;
  }
}

// Check if user is already logged in
onMounted(() => {
  const token = localStorage.getItem('authToken');
  if (token) {
    navigateTo('/');
  }
});
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 20px;
}

.login-card {
  background: white;
  padding: 40px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

.login-card h2 {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
  font-size: 28px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
  color: #333;
}

.form-group input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  transition: border-color 0.3s;
}

.form-group input:focus {
  outline: none;
  border-color: #007bff;
}

.login-btn {
  width: 100%;
  background-color: #007bff;
  color: white;
  border: none;
  padding: 12px;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.login-btn:hover:not(:disabled) {
  background-color: #0056b3;
}

.login-btn:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}

.error-message {
  margin-top: 15px;
  padding: 10px;
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
  border-radius: 4px;
  text-align: center;
}

.switch-mode {
  margin-top: 20px;
  text-align: center;
}

.link-btn {
  background: none;
  border: none;
  color: #007bff;
  cursor: pointer;
  text-decoration: underline;
  font-size: 14px;
}

.link-btn:hover {
  color: #0056b3;
}
</style>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 20px;
}

.login-card {
  background: white;
  padding: 40px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

.login-card h2 {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
  font-size: 28px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
  color: #333;
}

.form-group input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  transition: border-color 0.3s;
}

.form-group input:focus {
  outline: none;
  border-color: #007bff;
}

.login-btn {
  width: 100%;
  background-color: #007bff;
  color: white;
  border: none;
  padding: 12px;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.login-btn:hover:not(:disabled) {
  background-color: #0056b3;
}

.login-btn:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}

.error-message {
  margin-top: 15px;
  padding: 10px;
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
  border-radius: 4px;
  text-align: center;
}
</style>
