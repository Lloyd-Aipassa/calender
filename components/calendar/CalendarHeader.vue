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
    default: '',
  },
});

defineEmits(['settings', 'add-event', 'logout']);
</script>

<style scoped>
.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-top: 8px;
  position: relative;
  z-index: 1;
}

.header-left {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.calendar-header h2 {
  margin: 0;
  color: #1a1614;
}

.calendar-header button {
  padding: 10px;
  background: transparent;
  border: none;
  cursor: pointer;
  border-radius: 12px;
  transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-name {
  margin: 0;
  color: #1a1614;
  font-size: 16px;
  font-weight: 600;
}

.header-actions {
  display: flex;
  gap: 8px;
}

/* Button styles */
.btn-primary {
  background: linear-gradient(135deg, #e07a5f 0%, #d4644a 100%) !important;
  color: white;
  border: none !important;
  padding: 12px 14px;
  border-radius: 12px;
  cursor: pointer;
  font-size: 14px;
  box-shadow: 0 2px 8px rgba(224, 122, 95, 0.35);
  transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(224, 122, 95, 0.45);
}

.btn-primary:active {
  transform: translateY(0);
}

.btn-primary img {
  filter: brightness(0) invert(1);
}

.btn-secondary {
  background-color: #f5f3f0 !important;
  color: #5c5552;
  border: 1px solid rgba(26, 22, 20, 0.1) !important;
  padding: 12px 14px;
  border-radius: 12px;
  cursor: pointer;
  font-size: 14px;
  transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-secondary:hover {
  background-color: #ebe8e4 !important;
  border-color: rgba(26, 22, 20, 0.15) !important;
}

.btn-secondary img {
  opacity: 0.6;
  transition: opacity 150ms cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-secondary:hover img {
  opacity: 0.85;
}

.btn-logout {
  background-color: transparent !important;
  color: #8a8582;
  border: 1px solid transparent !important;
  padding: 12px 14px;
  border-radius: 12px;
  cursor: pointer;
  font-size: 14px;
  transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-logout:hover {
  background-color: #fef2f2 !important;
  border-color: #fecaca !important;
}

.btn-logout img {
  opacity: 0.5;
  transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-logout:hover img {
  opacity: 1;
  filter: brightness(0) saturate(100%) invert(27%) sepia(51%) saturate(2878%) hue-rotate(346deg) brightness(97%) contrast(97%);
}

@media (max-width: 720px) {
  .user-name {
    color: #1a1614;
    font-size: 15px;
  }

  .header-actions {
    gap: 6px;
  }

  .btn-primary,
  .btn-secondary,
  .btn-logout {
    padding: 10px 12px;
  }
}
</style>
