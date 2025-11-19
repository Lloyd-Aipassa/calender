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
  background: white;
}

.calendar-grid {
  /* border: 1px solid #ddd; */
  border-radius: 8px;
  overflow: hidden;
}

.calendar-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  background: white;
}

.weekday {
  padding: 15px 10px;
  text-align: center;
  font-weight: 600;
  color: #666;
  /* border-right: 1px solid #ddd; */
}

.weekday:last-child {
  border-right: none;
}

.calendar-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
}

.calendar-day {
  min-height: 120px;
  max-height: 120px;
  /* border-right: 1px solid #eee;
  border-bottom: 1px solid #eee; */
  padding: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  flex-direction: column;
  background-color: white;
  overflow: hidden;
}

.calendar-day:hover {
  background-color: #f8f9fa;
}

.calendar-day:last-child {
  border-right: none;
}

.calendar-day.other-month {
  background-color: white;
  color: #ccc;
}

.calendar-day.other-month .event {
  opacity: 0.5;
}

.calendar-day.today {
  background-color: white;
}

.calendar-day.today .day-number {
  color: #fa0101;
}

.calendar-day.weekend {
  background-color: white;
}

.day-number {
  font-weight: 600;
  margin-bottom: 6px;
  font-size: 14px;
  display: flex;
  justify-content: center;
}

.events-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.event {
  background: linear-gradient(135deg, #fa0101, #c80101);
  color: white;
  padding: 2px 2px;
  border-radius: 3px;
  font-size: 11px;
  cursor: pointer;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: flex;
  align-items: center;
  gap: 4px;
  min-height: 18px;
}

.event:hover {
  background: linear-gradient(135deg, #c80101, #a00101);
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.event.shared-event {
  background: linear-gradient(135deg, #fa0101, #c80101);
}

.event.shared-event:hover {
  background: linear-gradient(135deg, #c80101, #a00101);
}

.event-time {
  font-weight: 600;
  opacity: 0.9;
  font-size: 10px;
  min-width: 35px;
}

.event-title {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
}

.event-creator {
  font-size: 9px;
  opacity: 0.8;
  font-style: italic;
}

.more-events {
  font-size: 10px;
  color: #666;
  padding: 2px 6px;
  text-align: center;
  background: #f0f0f0;
  border-radius: 3px;
  cursor: pointer;
}

.more-events:hover {
  background: #e0e0e0;
}

@media (max-width: 768px) {
  .calendar-day {
    min-height: 80px;
    font-size: 12px;
  }
}
</style>
