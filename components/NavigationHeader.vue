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
    <div class="nav-spacer"></div>
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
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border-color);
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 68px;
}

.nav-brand h1 {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: var(--color-text-primary);
  letter-spacing: -0.02em;
}

.nav-links {
  display: flex;
  gap: 6px;
  align-items: center;
  background: var(--color-bg-secondary);
  padding: 4px;
  border-radius: var(--radius-lg);
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: var(--radius-md);
  text-decoration: none;
  color: var(--color-text-secondary);
  font-weight: 500;
  font-size: 14px;
  transition: all var(--transition-fast);
}

.nav-link:hover {
  background: var(--color-surface);
  color: var(--color-text-primary);
}

.nav-link.active {
  background: var(--color-surface);
  color: var(--color-accent);
  box-shadow: var(--shadow-sm);
  font-weight: 600;
}

.nav-link.active:hover {
  background: var(--color-surface);
}

.nav-icon {
  font-size: 18px;
}

.nav-user {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-name {
  color: var(--color-text-secondary);
  font-size: 14px;
  font-weight: 500;
}

.logout-btn {
  padding: 10px 18px;
  background: var(--color-bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  font-weight: 500;
  font-size: 13px;
  font-family: inherit;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.logout-btn:hover {
  background: #fef2f2;
  border-color: #fecaca;
  color: #dc2626;
}

.nav-spacer {
  display: none;
}

/* Mobile Bottom Navigation */
@media (max-width: 768px) {
  .nav-header {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    top: auto;
    border-bottom: none;
    border-top: 1px solid var(--border-color);
    box-shadow: 0 -4px 20px rgba(26, 22, 20, 0.08);
    z-index: 100;
    padding-bottom: env(safe-area-inset-bottom, 0px);
    background: rgba(255, 255, 255, 0.95);
  }

  .nav-container {
    height: 64px;
    padding: 0 8px;
    flex-wrap: nowrap;
  }

  .nav-brand {
    display: none;
  }

  .nav-links {
    flex: 1;
    justify-content: space-around;
    gap: 0;
    background: transparent;
    padding: 0;
  }

  .nav-link {
    flex-direction: column;
    padding: 10px 16px;
    font-size: 11px;
    gap: 4px;
    flex: 1;
    text-align: center;
    border-radius: var(--radius-md);
  }

  .nav-link:hover {
    background: transparent;
  }

  .nav-icon {
    font-size: 22px;
  }

  .nav-user {
    display: none;
  }

  .user-name {
    display: none;
  }

  .nav-link.active {
    background: var(--color-accent-light);
    color: var(--color-accent);
    font-weight: 600;
    font-size: 11px;
    box-shadow: none;
  }

  .nav-link.active:hover {
    background: var(--color-accent-light);
  }
}
</style>
