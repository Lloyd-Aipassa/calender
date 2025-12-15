<!-- pages/index.vue -->
<template>
  <div v-if="isAuthenticated" class="page-wrapper">
    <div class="content-grid">
      <aside class="sidebar-left">
        <Appointments />
      </aside>
      <main class="main-calendar">
        <Calendar />
      </main>
    </div>
  </div>
</template>

<script setup>
import Calendar from '~/components/Calendar.vue';
import Appointments from '~/components/appointments.vue';

const isAuthenticated = ref(false);

// Check auth BEFORE mounting components
onBeforeMount(() => {
  const token = localStorage.getItem('authToken');
  if (!token) {
    navigateTo('/login');
    return;
  }

  // Token exists, allow components to mount
  isAuthenticated.value = true;
});

// Double-check on mount in case something changed
onMounted(() => {
  const token = localStorage.getItem('authToken');
  if (!token) {
    navigateTo('/login');
  }
});
</script>

<style scoped>
.page-wrapper {
  width: 100%;
  min-height: 100%;
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.content-grid {
  display: grid;
  grid-template-columns: 1fr;
  grid-template-areas:
    "main"
    "sidebar";
  gap: 0;
}

.sidebar-left {
  grid-area: sidebar;
  animation: slideInLeft 0.6s ease-out 0.1s both;
}

.main-calendar {
  grid-area: main;
  animation: slideInRight 0.6s ease-out 0.2s both;
}

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Desktop/Laptop layout */
@media (min-width: 1200px) {
  .content-grid {
    grid-template-columns: 300px 1fr;
    grid-template-areas: "sidebar main";
    max-width: 1400px;
    margin: 0 auto;
    padding: 24px 32px;
    gap: 28px;
    align-items: start;
  }

  .sidebar-left {
    position: sticky;
    top: 100px;
    max-height: calc(100vh - 40px);
    overflow-y: auto;
    scrollbar-width: none;
    -ms-overflow-style: none;
  }

  .sidebar-left::-webkit-scrollbar {
    display: none;
  }
}

/* Tablet layout */
@media (min-width: 768px) and (max-width: 1199px) {
  .content-grid {
    padding: 20px;
    gap: 20px;
  }
}

/* Mobile layout */
@media (max-width: 767px) {
  .content-grid {
    padding: 0;
  }

  .sidebar-left {
    order: 2;
  }

  .main-calendar {
    order: 1;
  }
}
</style>

<style>
/* Global calendar styling for desktop */
@media (min-width: 1200px) {
  .calendar-container {
    max-width: 100%;
    padding: 0;
  }
}
</style>
