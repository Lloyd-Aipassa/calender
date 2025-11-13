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

// Haal gebruikersnaam op
onMounted(async () => {
  const token = localStorage.getItem('authToken');
  if (token) {
    try {
      const response = await $fetch('https://calender.brooklynwebdesign.nl/api/endpoints/get_user_info.php', {
        headers: { Authorization: `Bearer ${token}` }
      });
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
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
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
  background: #4caf50;
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
  .nav-container {
    flex-wrap: wrap;
    height: auto;
    padding: 12px 20px;
  }

  .nav-brand {
    width: 100%;
    margin-bottom: 12px;
  }

  .nav-links {
    flex: 1;
  }

  .nav-link {
    padding: 6px 12px;
    font-size: 14px;
  }

  .nav-icon {
    font-size: 16px;
  }

  .user-name {
    display: none;
  }
}
</style>
