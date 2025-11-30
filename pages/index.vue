<!-- pages/index.vue -->
<template>
  <div v-if="isAuthenticated">
    <Calendar />
    <Appointments />
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
