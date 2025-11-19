<template>
  <div class="calendar-nav">
    <div class="nav-controls">
      <button @click="$emit('previous')" class="nav-btn">‹</button>
      <h3>{{ currentPeriodName }}</h3>
      <button @click="$emit('next')" class="nav-btn">›</button>
    </div>

    <div class="view-controls">
      <button
        @click="$emit('view-change', 'month')"
        :class="['view-btn', { active: currentView === 'month' }]">
        Maand
      </button>
      <button
        @click="$emit('view-change', 'week')"
        :class="['view-btn', { active: currentView === 'week' }]">
        Week
      </button>
      <button
        @click="$emit('view-change', 'day')"
        :class="['view-btn', { active: currentView === 'day' }]">
        Dag
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  currentView: {
    type: String,
    required: true
  },
  currentPeriodName: {
    type: String,
    required: true
  }
});

defineEmits(['previous', 'next', 'view-change']);
</script>

<style scoped>
.calendar-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 15px;
}

.nav-controls {
  display: flex;
  align-items: center;
  gap: 15px;
}

.view-controls {
  display: flex;
  gap: 5px;
}

.view-btn {
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  color: #495057;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.view-btn:hover {
  background: #e9ecef;
}

.view-btn.active {
  background: #fa0101;
  color: white;
  border-color: #fa0101;
}

.nav-btn {
  background: #fa0101;
  color: white;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-btn:hover {
  background: #c80101;
}

.calendar-nav h3 {
  margin: 0;
  font-size: 20px;
  color: #333;
  min-width: 200px;
  text-align: center;
}

@media (max-width: 768px) {
  .calendar-nav {
    flex-direction: column;
    gap: 10px;
  }

  .nav-controls {
    order: 2;
  }

  .view-controls {
    order: 1;
    width: 100%;
    justify-content: center;
  }

  .view-btn {
    flex: 1;
    text-align: center;
  }
}
</style>
