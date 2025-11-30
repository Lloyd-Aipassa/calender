<template>
  <div class="calendar-header">
    <div class="header-left">
      <p v-if="userName" class="user-name">{{ userName }}</p>
    </div>
    <div class="header-actions">
      <button @click="$emit('settings')" class="btn-secondary">
        <img src="/svg/gear.svg" width="24" alt="instelingen" />
      </button>
      <button @click="$emit('add-event')" class="btn-primary">
        <img src="/svg/calendar.svg" width="24" alt="instelingen" />
      </button>
      <button @click="$emit('logout')" class="btn-logout">
        <img src="/svg/logout.svg" width="24" alt="instelingen" />
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  userName: {
    type: String,
    default: ''
  }
});

defineEmits(['settings', 'add-event', 'logout']);
</script>

<style scoped>
.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-top: 10px;
}

.header-left {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.calendar-header h2 {
  margin: 0;
  color: #333;
}

.calendar-header button {
  padding: 5px;
  background: #15572400;
}

.user-name {
  margin: 0;
  color: #1d1d1d;
  font-size: 16px;
  font-weight: 600;
}

.header-actions {
  display: flex;
  gap: 10px;
}

/* Button styles */
.btn-primary {
  background-color: #fa0101a0;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
}

.btn-primary:hover {
  background-color: #c80101;
}

.btn-secondary {
  background-color: #6c757d47;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
}

.btn-secondary:hover {
  background-color: #545b62;
}

.btn-logout {
  background-color: #dc354600;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}

.btn-logout:hover {
  background-color: #c82333;
}
</style>
