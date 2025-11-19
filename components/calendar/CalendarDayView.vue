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
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
}

.day-header {
  background: #f8f9fa;
  padding: 20px;
  text-align: center;
  border-bottom: 1px solid #ddd;
}

.day-header h4 {
  margin: 0;
  font-size: 20px;
  color: #333;
}

.day-content {
  max-height: 600px;
  overflow-y: auto;
}

.day-hour {
  display: grid;
  grid-template-columns: 80px 1fr;
  border-bottom: 1px solid #eee;
  min-height: 80px;
}

.hour-label {
  padding: 15px 10px;
  font-size: 12px;
  color: #666;
  text-align: center;
  border-right: 1px solid #ddd;
  background: #fafafa;
}

.hour-content {
  padding: 8px;
  cursor: pointer;
}

.hour-content:hover {
  background: #f8f9fa;
}

.day-event {
  background: linear-gradient(135deg, #fa0101, #c80101);
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  margin-bottom: 4px;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.day-event:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.day-event.shared-event {
  background: linear-gradient(135deg, #28a745, #1e7e34);
}

.day-event.shared-event:hover {
  background: linear-gradient(135deg, #1e7e34, #155724);
}

.day-event .event-time {
  font-weight: 600;
  font-size: 12px;
  opacity: 0.9;
}

.day-event .event-title {
  font-size: 14px;
  font-weight: 600;
  margin: 2px 0;
}

.day-event .event-description {
  font-size: 12px;
  opacity: 0.8;
}

.day-event .event-creator {
  font-size: 11px;
  opacity: 0.7;
  font-style: italic;
  margin-top: 4px;
}

@media (max-width: 768px) {
  .day-hour {
    grid-template-columns: 60px 1fr;
  }
}
</style>
