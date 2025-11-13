<template>
  <div class="tasks-page">
    <div class="tasks-container">
      <div class="tasks-header">
        <h1>Taken</h1>
        <button class="btn-primary">+ Nieuwe taak</button>
      </div>

      <div class="empty-state">
        <div class="empty-icon">✓</div>
        <h2>Nog geen taken</h2>
        <p>Begin met het toevoegen van taken om georganiseerd te blijven</p>
      </div>
    </div>
  </div>
</template>

<script setup>
// Check auth
onMounted(() => {
  const token = localStorage.getItem('authToken');
  if (!token) {
    navigateTo('/login');
  }
});
</script>

<style scoped>
.tasks-page {
  min-height: calc(100vh - 64px);
  padding: 20px;
  background: #f5f5f5;
}

.tasks-container {
  max-width: 1200px;
  margin: 0 auto;
  background: white;
  border-radius: 8px;
  padding: 30px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.tasks-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.tasks-header h1 {
  margin: 0;
  font-size: 28px;
  color: #333;
}

.btn-primary {
  padding: 12px 24px;
  background: #4caf50;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-primary:hover {
  background: #45a049;
}

.empty-state {
  text-align: center;
  padding: 80px 20px;
}

.empty-icon {
  font-size: 80px;
  margin-bottom: 20px;
  opacity: 0.3;
}

.empty-state h2 {
  margin: 0 0 10px 0;
  color: #333;
  font-size: 24px;
}

.empty-state p {
  color: #666;
  font-size: 16px;
  margin: 0;
}
</style>
