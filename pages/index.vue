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
}

.main-calendar {
  grid-area: main;
}

/* Desktop/Laptop layout - sidebar links, calendar rechts */
@media (min-width: 1200px) {
  .content-grid {
    grid-template-columns: 280px 1fr;
    grid-template-areas: "sidebar main";
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
    gap: 20px;
    align-items: start;
  }

  .sidebar-left {
    position: sticky;
    top: 105px;
    max-height: calc(100vh - 40px);
    overflow-y: auto;
  }
}

/* Tablet layout */
@media (min-width: 768px) and (max-width: 1199px) {
  .content-grid {
    padding: 15px;
  }
}
</style>

<style>
/* Remove the old margin-left from calendar components on desktop */
@media (min-width: 1200px) {
  .calendar-container {
    max-width: 100%;
    padding: 0;
  }
}
</style>
