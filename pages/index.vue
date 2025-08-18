<!-- pages/index.vue -->
<template>
  <div>
    <Calendar />
  </div>
</template>

<script setup>
onMounted(() => {
  const token = localStorage.getItem('authToken');
  if (!token) {
    navigateTo('/login');
  }
});
</script>
