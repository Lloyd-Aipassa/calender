<template>
  <div v-show="currentView === 'week'" class="week-view">
    <div class="week-header">
      <div class="time-column"></div>
      <div v-for="day in weekDays" :key="day.date" class="week-day-header">
        <div class="day-name">{{ day.name }}</div>
        <div class="day-date" :class="{ today: day.isToday }">{{ day.day }}</div>
      </div>
    </div>

    <div class="week-content">
      <div class="time-slots">
        <div v-for="hour in timeSlots" :key="hour" class="time-slot">
          <div class="hour-row">
            <div class="time-label">{{ hour }}:00</div>
            <div
              v-for="day in weekDays"
              :key="`${day.date}-${hour}`"
              class="day-cell"
              @click="$emit('time-slot-click', day.date, hour)">
              <div
                v-for="event in getEventsForDayHour(day.date, hour)"
                :key="event.id"
                class="week-event"
                :class="{ 'shared-event': event.event_type === 'shared' }"
                @click.stop="$emit('event-click', event)"
                :title="`${event.title} - ${event.time || 'No time'} ${
                  event.event_type === 'shared' ? '(gedeeld door ' + event.creator + ')' : ''
                }`">
                {{ event.title }}
              </div>
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
  weekDays: {
    type: Array,
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

function getEventsForDayHour(date, hour) {
  return props.events.filter((event) => {
    if (event.date !== date) return false;
    if (!event.time) return false;
    const eventHour = parseInt(event.time.split(':')[0]);
    return eventHour === hour;
  });
}
</script>

<style scoped>
.week-view {
  border-radius: var(--radius-lg);
  overflow: hidden;
  background: var(--color-surface);
}

.week-header {
  display: grid;
  grid-template-columns: 72px repeat(7, 1fr);
  background: var(--color-bg-secondary);
  border-bottom: 1px solid var(--border-color);
}

.time-column {
  border-right: 1px solid var(--border-color);
}

.week-day-header {
  padding: 16px 8px;
  text-align: center;
  border-right: 1px solid var(--border-color);
  transition: background var(--transition-fast);
}

.week-day-header:last-child {
  border-right: none;
}

.week-day-header:hover {
  background: var(--color-bg-tertiary);
}

.day-name {
  font-weight: 600;
  color: var(--color-text-tertiary);
  font-size: 11px;
  margin-bottom: 6px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.day-date {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.day-date.today {
  color: white;
  background: var(--color-accent);
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  box-shadow: 0 2px 8px rgba(224, 122, 95, 0.3);
}

.week-content {
  max-height: 600px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: var(--color-text-muted) transparent;
}

.week-content::-webkit-scrollbar {
  width: 6px;
}

.week-content::-webkit-scrollbar-track {
  background: transparent;
}

.week-content::-webkit-scrollbar-thumb {
  background: var(--color-text-muted);
  border-radius: 3px;
}

.time-slot {
  border-bottom: 1px solid var(--border-color);
}

.time-slot:last-child {
  border-bottom: none;
}

.hour-row {
  display: grid;
  grid-template-columns: 72px repeat(7, 1fr);
  min-height: 56px;
}

.time-label {
  padding: 8px 10px;
  font-size: 11px;
  font-weight: 500;
  color: var(--color-text-tertiary);
  text-align: right;
  border-right: 1px solid var(--border-color);
  background: var(--color-bg-secondary);
}

.day-cell {
  border-right: 1px solid var(--border-color);
  padding: 4px;
  cursor: pointer;
  position: relative;
  transition: background var(--transition-fast);
}

.day-cell:last-child {
  border-right: none;
}

.day-cell:hover {
  background: var(--color-bg-secondary);
}

.week-event {
  background: linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-hover) 100%);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 500;
  margin-bottom: 3px;
  cursor: pointer;
  transition: all var(--transition-fast);
  box-shadow: 0 1px 3px rgba(224, 122, 95, 0.25);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.week-event:hover {
  transform: translateY(-1px) scale(1.02);
  box-shadow: 0 3px 8px rgba(224, 122, 95, 0.35);
}

.week-event.shared-event {
  background: linear-gradient(135deg, var(--color-secondary) 0%, #6a9175 100%);
  box-shadow: 0 1px 3px rgba(129, 168, 141, 0.25);
}

.week-event.shared-event:hover {
  box-shadow: 0 3px 8px rgba(129, 168, 141, 0.35);
}

@media (max-width: 768px) {
  .week-header,
  .hour-row {
    grid-template-columns: 50px repeat(7, 1fr);
  }

  .week-day-header {
    padding: 12px 4px;
  }

  .day-name {
    font-size: 10px;
  }

  .day-date {
    font-size: 14px;
  }

  .day-date.today {
    width: 28px;
    height: 28px;
    font-size: 13px;
  }

  .time-label {
    font-size: 10px;
    padding: 8px 4px;
  }

  .hour-row {
    min-height: 48px;
  }

  .week-event {
    font-size: 9px;
    padding: 2px 4px;
  }
}
</style>
