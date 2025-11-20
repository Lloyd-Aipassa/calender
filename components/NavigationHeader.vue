<template>
  <header class="nav-header">
    <div class="nav-container">
      <div class="nav-brand">
        <h1>Calendar App</h1>
      </div>

      <nav class="nav-links">
        <NuxtLink to="/" class="nav-link" :class="{ active: $route.path === '/' }">
          <span class="nav-icon"></span>
          Agenda
        </NuxtLink>

        <NuxtLink to="/chat" class="nav-link" :class="{ active: $route.path === '/chat' }">
          <span class="nav-icon"></span>
          Chat
        </NuxtLink>

        <NuxtLink to="/tasks" class="nav-link" :class="{ active: $route.path === '/tasks' }">
          <span class="nav-icon"></span>
          Taken
        </NuxtLink>
      </nav>

      <div class="nav-user">
        <span class="user-name">{{ userName }}</span>
        <button @click="logout" class="logout-btn">Uitloggen</button>
      </div>
    </div>
  </header>
</template>

<script setup>
const userName = ref('Gebruiker');
const router = useRouter();
const config = useRuntimeConfig();

// Haal gebruikersnaam op
onMounted(async () => {
  const token = localStorage.getItem('authToken');
  if (token) {
    try {
      const response = await $fetch(
        `${config.public.apiBaseUrl}/get_user_info.php`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      userName.value = response.user.name;
    } catch (error) {
      console.error('Failed to get user info:', error);
    }
  }
});

function logout() {
  localStorage.removeItem('authToken');
  router.push('/login');
}
</script>

<style scoped>
.nav-header {
  background: white;
  border-bottom: 1px solid #e0e0e0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
}

.nav-brand h1 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #333;
}

.nav-links {
  display: flex;
  gap: 8px;
  align-items: center;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 8px;
  text-decoration: none;
  color: #666;
  font-weight: 500;
  transition: all 0.2s;
}

.nav-link:hover {
  background: #f5f5f5;
  color: #333;
}

.nav-link.active {
  background: #fa0101;
  color: white;
}

.nav-link.active:hover {
  background: #45a049;
}

.nav-icon {
  font-size: 18px;
}

.nav-user {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-name {
  color: #666;
  font-size: 14px;
}

.logout-btn {
  padding: 8px 16px;
  background: #f5f5f5;
  border: none;
  border-radius: 6px;
  color: #666;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.logout-btn:hover {
  background: #e0e0e0;
  color: #333;
}

@media (max-width: 768px) {
  .nav-header {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    top: auto;
    border-bottom: none;
    border-top: 1px solid #e0e0e0;
    box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
    z-index: 1001;
  }

  .nav-container {
    height: 64px;
    padding: 0 10px;
    flex-wrap: nowrap;
  }

  .nav-brand {
    display: none;
  }

  .nav-links {
    flex: 1;
    justify-content: space-around;
    gap: 0;
  }

  .nav-link {
    flex-direction: column;
    padding: 8px 12px;
    font-size: 12px;
    gap: 4px;
    flex: 1;
    text-align: center;
  }

  .nav-icon {
    font-size: 20px;
  }

  .nav-user {
    display: none;
  }

  .user-name {
    display: none;
  }

  .nav-link.active {
    background: #fa010100;
    color: #fa0101;
    font-size: 14px;
  }

  .nav-link.active:hover {
    background: #fa010100;
  }
}
</style>
