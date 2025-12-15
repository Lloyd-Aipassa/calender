<template>
  <div v-show="currentView === 'month'" class="month-view">
    <div class="calendar-grid">
      <div class="calendar-weekdays">
        <div v-for="day in weekdays" :key="day" class="weekday">
          {{ day }}
        </div>
      </div>

      <div class="calendar-days">
        <div
          v-for="day in monthDays"
          :key="day.date"
          class="calendar-day"
          :class="{
            'other-month': !day.isCurrentMonth,
            today: day.isToday,
            weekend: day.isWeekend,
          }"
          @click="$emit('day-click', day)">
          <div class="day-number">{{ day.day }}</div>
          <div class="events-container">
            <div
              v-for="event in day.events.slice(0, 3)"
              :key="event.id"
              class="event"
              :class="{ 'shared-event': event.event_type === 'shared' }"
              @click.stop="$emit('event-click', event)">
              <span class="event-time">{{ event.time ? event.time.substring(0, 5) : '' }}</span>
              <span class="event-title">{{ event.title }}</span>
              <span v-if="event.event_type === 'shared'" class="event-creator">
                ({{ event.creator }})
              </span>
            </div>
            <div v-if="day.events.length > 3" class="more-events">
              +{{ day.events.length - 3 }} meer
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  currentView: {
    type: String,
    required: true
  },
  monthDays: {
    type: Array,
    required: true
  },
  weekdays: {
    type: Array,
    default: () => ['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo']
  }
});

defineEmits(['day-click', 'event-click']);
</script>

<style scoped>
.month-view {
  background: transparent;
  position: relative;
  z-index: 1;
}

.calendar-grid {
  border-radius: var(--radius-md);
  overflow: hidden;
}

.calendar-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  background: transparent;
  margin-bottom: 8px;
}

.weekday {
  padding: 12px 8px;
  text-align: center;
  font-weight: 600;
  font-size: 12px;
  color: var(--color-text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.calendar-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
}

.calendar-day {
  min-height: 110px;
  max-height: 110px;
  padding: 8px;
  cursor: pointer;
  transition: all var(--transition-fast);
  display: flex;
  flex-direction: column;
  background-color: var(--color-bg-secondary);
  border-radius: var(--radius-sm);
  overflow: hidden;
  border: 1px solid transparent;
}

.calendar-day:hover {
  background-color: var(--color-bg-tertiary);
  border-color: var(--border-color);
  transform: translateY(-1px);
}

.calendar-day.other-month {
  background-color: transparent;
  opacity: 0.4;
}

.calendar-day.other-month:hover {
  opacity: 0.6;
  background-color: var(--color-bg-secondary);
}

.calendar-day.other-month .event {
  opacity: 0.7;
}

.calendar-day.today {
  background-color: var(--color-accent-light);
  border-color: var(--color-accent-subtle);
}

.calendar-day.today:hover {
  background-color: var(--color-accent-light);
  border-color: var(--color-accent);
}

.calendar-day.today .day-number {
  color: var(--color-accent);
  background: var(--color-accent);
  color: white;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: -2px auto 4px;
}

.calendar-day.weekend {
  background-color: var(--color-bg-secondary);
}

.day-number {
  font-weight: 600;
  margin-bottom: 6px;
  font-size: 13px;
  display: flex;
  justify-content: center;
  color: var(--color-text-primary);
}

.events-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 3px;
  overflow: hidden;
}

.event {
  background: linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-hover) 100%);
  color: white;
  padding: 3px 6px;
  border-radius: 4px;
  font-size: 10px;
  cursor: pointer;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: flex;
  align-items: center;
  gap: 4px;
  min-height: 20px;
  transition: all var(--transition-fast);
  box-shadow: 0 1px 3px rgba(224, 122, 95, 0.3);
}

.event:hover {
  transform: translateY(-1px) scale(1.02);
  box-shadow: 0 3px 8px rgba(224, 122, 95, 0.4);
}

.event.shared-event {
  background: linear-gradient(135deg, var(--color-secondary) 0%, #6a9175 100%);
  box-shadow: 0 1px 3px rgba(129, 168, 141, 0.3);
}

.event.shared-event:hover {
  box-shadow: 0 3px 8px rgba(129, 168, 141, 0.4);
}

.event-time {
  font-weight: 700;
  font-size: 9px;
  opacity: 0.95;
  min-width: 32px;
}

.event-title {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 500;
}

.event-creator {
  font-size: 8px;
  opacity: 0.85;
  font-style: italic;
}

.more-events {
  font-size: 10px;
  color: var(--color-text-tertiary);
  padding: 3px 6px;
  text-align: center;
  background: var(--color-surface);
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: all var(--transition-fast);
  border: 1px solid var(--border-color);
}

.more-events:hover {
  background: var(--color-accent-light);
  color: var(--color-accent);
  border-color: var(--color-accent-subtle);
}

@media (max-width: 768px) {
  .calendar-days {
    gap: 2px;
  }

  .calendar-day {
    min-height: 70px;
    max-height: 70px;
    padding: 6px 4px;
    border-radius: 6px;
  }

  .weekday {
    padding: 8px 4px;
    font-size: 11px;
  }

  .day-number {
    font-size: 12px;
    margin-bottom: 4px;
  }

  .calendar-day.today .day-number {
    width: 22px;
    height: 22px;
    font-size: 11px;
  }

  .event {
    padding: 2px 4px;
    font-size: 9px;
    min-height: 16px;
    border-radius: 3px;
  }

  .event-time {
    display: none;
  }

  .events-container {
    gap: 2px;
  }

  .more-events {
    font-size: 9px;
    padding: 2px 4px;
  }
}
</style>
