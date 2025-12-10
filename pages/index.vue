<!-- pages/index.vue -->
<template>
  <div v-if="isAuthenticated">
    <Calendar />
    <!-- Desktop: sidebar is positioned inside calendar-container via CSS -->
    <div class="appointments-wrapper">
      <Appointments />
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
.appointments-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px 20px 20px;
}

/* Desktop/Laptop layout - sidebar links naast calendar-content */
@media (min-width: 1200px) {
  .appointments-wrapper {
    position: fixed;
    left: calc((100vw - 1200px) / 2); /* Align with calendar-container */
    top: 280px; /* Below header and navigation */
    width: 280px;
    padding: 0;
    max-height: calc(100vh - 200px);
    overflow-y: auto;
  }
}
</style>

<style>
/* Global style to adjust calendar layout on desktop - make room for sidebar on left */
@media (min-width: 1200px) {
  .calendar-container .calendar-header,
  .calendar-container .calendar-nav,
  .calendar-container .calendar-content {
    margin-left: 300px; /* Make room for sidebar */
  }
}
</style>
