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
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
}

.week-header {
  display: grid;
  grid-template-columns: 80px repeat(7, 1fr);
  background: #f8f9fa;
  border-bottom: 1px solid #ddd;
}

.time-column {
  border-right: 1px solid #ddd;
}

.week-day-header {
  padding: 15px 10px;
  text-align: center;
  border-right: 1px solid #eee;
}

.week-day-header:last-child {
  border-right: none;
}

.day-name {
  font-weight: 600;
  color: #666;
  font-size: 12px;
  margin-bottom: 4px;
}

.day-date {
  font-size: 18px;
  font-weight: 600;
}

.day-date.today {
  color: #fa0101;
  background: white;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
}

.week-content {
  max-height: 600px;
  overflow-y: auto;
}

.time-slot {
  border-bottom: 1px solid #eee;
}

.hour-row {
  display: grid;
  grid-template-columns: 80px repeat(7, 1fr);
  min-height: 60px;
}

.time-label {
  padding: 10px;
  font-size: 12px;
  color: #666;
  text-align: center;
  border-right: 1px solid #ddd;
  background: #fafafa;
}

.day-cell {
  border-right: 1px solid #eee;
  padding: 4px;
  cursor: pointer;
  position: relative;
}

.day-cell:hover {
  background: #f8f9fa;
}

.week-event {
  background: #fa0101;
  color: white;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 11px;
  margin-bottom: 2px;
  cursor: pointer;
}

.week-event:hover {
  background: #c80101;
}

.week-event.shared-event {
  background: #28a745;
}

.week-event.shared-event:hover {
  background: #1e7e34;
}

@media (max-width: 768px) {
  .week-header,
  .hour-row {
    grid-template-columns: 60px repeat(7, 1fr);
  }
}
</style>
