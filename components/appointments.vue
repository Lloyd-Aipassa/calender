<template>
  <div class="appointments-section">
    <h2 class="section-title">Aankomende afspraken</h2>

    <div v-if="upcomingEvents.length === 0" class="no-appointments">
      <p>Geen aankomende afspraken</p>
    </div>

    <div v-else class="appointments-list">
      <div
        v-for="event in upcomingEvents"
        :key="event.id"
        class="appointment-card"
      >
        <div class="appointment-date">
          <div class="date-day">{{ formatDay(event.date) }}</div>
          <div class="date-month">{{ formatMonth(event.date) }}</div>
        </div>
        <div class="appointment-details">
          <div class="appointment-title">{{ event.title }}</div>
          <div class="appointment-time">{{ event.time }}</div>
          <div v-if="event.description" class="appointment-description">
            {{ event.description }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const config = useRuntimeConfig();
const apiBase = config.public.apiBaseUrl;

const upcomingEvents = ref([]);

function getAuthToken() {
  return localStorage.getItem('authToken') || '';
}

async function loadUpcomingEvents() {
  try {
    const response = await $fetch(`${apiBase}/get_events.php`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });

    const allEvents = response.events || [];

    // Filter events that are in the future
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const futureEvents = allEvents.filter(event => {
      const eventDateTime = new Date(`${event.date}T${event.time}`);
      return eventDateTime >= now;
    });

    // Sort by date and time (earliest first)
    futureEvents.sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time}`);
      const dateB = new Date(`${b.date}T${b.time}`);
      return dateA - dateB;
    });

    // Take only the first 3
    upcomingEvents.value = futureEvents.slice(0, 3);
  } catch (error) {
    console.error('Failed to load upcoming events:', error);
  }
}

function formatDay(dateString) {
  const date = new Date(dateString);
  return date.getDate();
}

function formatMonth(dateString) {
  const date = new Date(dateString);
  const months = ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'];
  return months[date.getMonth()];
}

onMounted(() => {
  loadUpcomingEvents();
});
</script>

<style scoped>
.appointments-section {
  max-width: 1200px;
  margin: 20px auto;
  padding: 0 20px;
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
}

.no-appointments {
  text-align: center;
  padding: 40px 20px;
  color: #999;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.appointments-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.appointment-card {
  display: flex;
  gap: 16px;
  padding: 16px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: box-shadow 0.2s;
}

.appointment-card:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.appointment-date {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 60px;
  padding: 12px;
  background: #fa0101;
  border-radius: 8px;
  color: white;
}

.date-day {
  font-size: 24px;
  font-weight: 700;
  line-height: 1;
}

.date-month {
  font-size: 12px;
  text-transform: uppercase;
  margin-top: 4px;
  opacity: 0.9;
}

.appointment-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.appointment-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.appointment-time {
  font-size: 14px;
  color: #666;
}

.appointment-description {
  font-size: 13px;
  color: #999;
  margin-top: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
}

@media (max-width: 768px) {
  .appointments-section {
    padding: 0 16px;
    margin: 16px auto;
  }

  .section-title {
    font-size: 18px;
  }

  .appointment-date {
    min-width: 50px;
    padding: 8px;
  }

  .date-day {
    font-size: 20px;
  }

  .date-month {
    font-size: 11px;
  }

  .appointment-title {
    font-size: 15px;
  }

  .appointment-time {
    font-size: 13px;
  }
}
</style>