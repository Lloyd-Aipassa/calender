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
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
  position: relative;
  z-index: 1;
}

.nav-controls {
  display: flex;
  align-items: center;
  gap: 16px;
}

.view-controls {
  display: flex;
  gap: 4px;
  background: var(--color-bg-secondary);
  padding: 4px;
  border-radius: var(--radius-md);
}

.view-btn {
  background: transparent;
  border: none;
  color: var(--color-text-secondary);
  padding: 10px 18px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  font-family: inherit;
  transition: all var(--transition-fast);
}

.view-btn:hover {
  color: var(--color-text-primary);
  background: var(--color-surface);
}

.view-btn.active {
  background: var(--color-surface);
  color: var(--color-accent);
  box-shadow: var(--shadow-sm);
  font-weight: 600;
}

.nav-btn {
  background: var(--color-surface);
  color: var(--color-text-secondary);
  border: 1px solid var(--border-color);
  width: 42px;
  height: 42px;
  border-radius: var(--radius-md);
  cursor: pointer;
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
  font-weight: 300;
}

.nav-btn:hover {
  background: var(--color-accent);
  color: white;
  border-color: var(--color-accent);
  transform: scale(1.05);
}

.nav-btn:active {
  transform: scale(0.98);
}

.calendar-nav h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text-primary);
  min-width: 220px;
  text-align: center;
  letter-spacing: -0.01em;
}

@media (max-width: 768px) {
  .calendar-nav {
    flex-direction: column;
    gap: 12px;
    padding: 0 4px;
  }

  .nav-controls {
    order: 2;
    width: 100%;
    justify-content: space-between;
  }

  .view-controls {
    order: 1;
    width: 100%;
    justify-content: center;
  }

  .view-btn {
    flex: 1;
    text-align: center;
    padding: 12px 10px;
  }

  .calendar-nav h3 {
    font-size: 16px;
    min-width: 0;
    flex: 1;
  }

  .nav-btn {
    width: 38px;
    height: 38px;
  }
}
</style>
