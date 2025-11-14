<!-- pages/index.vue -->
<template>
  <div v-if="isAuthenticated">
    <Calendar />
  </div>
</template>

<script setup>
const isAuthenticated = ref(false);

// Check auth BEFORE mounting Calendar component
onBeforeMount(() => {
  const token = localStorage.getItem('authToken');
  if (!token) {
    console.log('No auth token, redirecting to login');
    navigateTo('/login');
    return;
  }

  // Token exists, allow Calendar to mount
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
