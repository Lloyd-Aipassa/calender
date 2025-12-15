<template>
  <div v-show="currentView === 'day'" class="day-view">
    <div class="day-header">
      <h4>{{ currentDayName }}</h4>
    </div>

    <div class="day-content">
      <div v-for="hour in timeSlots" :key="hour" class="day-hour">
        <div class="hour-label">{{ hour }}:00</div>
        <div class="hour-content" @click="$emit('time-slot-click', hour)">
          <div
            v-for="event in getEventsForHour(hour)"
            :key="event.id"
            class="day-event"
            :class="{ 'shared-event': event.event_type === 'shared' }"
            @click.stop="$emit('event-click', event)">
            <div class="event-time">
              {{ event.time || event.start?.split('T')[1]?.substring(0, 5) || 'No time' }}
            </div>
            <div class="event-title">{{ event.title }}</div>
            <div class="event-description">{{ event.description }}</div>
            <div v-if="event.event_type === 'shared'" class="event-creator">
              Gedeeld door: {{ event.creator }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  currentView: {
    type: String,
    required: true
  },
  currentDayName: {
    type: String,
    required: true
  },
  currentDate: {
    type: String,
    required: true
  },
  events: {
    type: Array,
    default: () => []
  },
  timeSlots: {
    type: Array,
    default: () => Array.from({ length: 24 }, (_, i) => i)
  }
});

defineEmits(['time-slot-click', 'event-click']);

function getEventsForHour(hour) {
  return props.events.filter((event) => {
    if (event.date !== props.currentDate) return false;
    if (!event.time) return false;
    const eventHour = parseInt(event.time.split(':')[0]);
    return eventHour === hour;
  });
}
</script>

<style scoped>
.day-view {
  border-radius: var(--radius-lg);
  overflow: hidden;
  background: var(--color-surface);
}

.day-header {
  background: var(--color-bg-secondary);
  padding: 24px 20px;
  text-align: center;
  border-bottom: 1px solid var(--border-color);
  position: relative;
}

.day-header::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
  height: 3px;
  background: var(--color-accent);
  border-radius: 3px 3px 0 0;
}

.day-header h4 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text-primary);
  letter-spacing: -0.01em;
}

.day-content {
  max-height: 600px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: var(--color-text-muted) transparent;
}

.day-content::-webkit-scrollbar {
  width: 6px;
}

.day-content::-webkit-scrollbar-track {
  background: transparent;
}

.day-content::-webkit-scrollbar-thumb {
  background: var(--color-text-muted);
  border-radius: 3px;
}

.day-hour {
  display: grid;
  grid-template-columns: 72px 1fr;
  border-bottom: 1px solid var(--border-color);
  min-height: 72px;
  transition: background var(--transition-fast);
}

.day-hour:last-child {
  border-bottom: none;
}

.day-hour:hover {
  background: var(--color-bg-secondary);
}

.hour-label {
  padding: 12px 10px;
  font-size: 11px;
  font-weight: 500;
  color: var(--color-text-tertiary);
  text-align: right;
  border-right: 1px solid var(--border-color);
  background: var(--color-bg-secondary);
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
}

.hour-content {
  padding: 8px 12px;
  cursor: pointer;
  min-height: 72px;
}

.day-event {
  background: linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-hover) 100%);
  color: white;
  padding: 12px 16px;
  border-radius: var(--radius-md);
  margin-bottom: 8px;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(224, 122, 95, 0.25);
  transition: all var(--transition-fast);
  position: relative;
  overflow: hidden;
}

.day-event::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: rgba(255, 255, 255, 0.3);
}

.day-event:hover {
  transform: translateY(-2px) scale(1.01);
  box-shadow: 0 6px 16px rgba(224, 122, 95, 0.35);
}

.day-event.shared-event {
  background: linear-gradient(135deg, var(--color-secondary) 0%, #6a9175 100%);
  box-shadow: 0 2px 8px rgba(129, 168, 141, 0.25);
}

.day-event.shared-event:hover {
  box-shadow: 0 6px 16px rgba(129, 168, 141, 0.35);
}

.day-event .event-time {
  font-weight: 700;
  font-size: 11px;
  opacity: 0.9;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.day-event .event-title {
  font-size: 15px;
  font-weight: 600;
  margin: 4px 0;
}

.day-event .event-description {
  font-size: 13px;
  opacity: 0.85;
  line-height: 1.4;
  margin-top: 4px;
}

.day-event .event-creator {
  font-size: 11px;
  opacity: 0.75;
  font-style: italic;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
}

@media (max-width: 768px) {
  .day-hour {
    grid-template-columns: 56px 1fr;
    min-height: 64px;
  }

  .hour-label {
    font-size: 10px;
    padding: 10px 8px;
  }

  .hour-content {
    padding: 6px 10px;
  }

  .day-header {
    padding: 18px 16px;
  }

  .day-header h4 {
    font-size: 16px;
  }

  .day-event {
    padding: 10px 12px;
  }

  .day-event .event-title {
    font-size: 14px;
  }

  .day-event .event-description {
    font-size: 12px;
  }
}
</style>
