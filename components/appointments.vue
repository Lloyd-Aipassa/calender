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
          <div class="appointment-time">{{ formatTime(event.time) }}</div>
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

function formatTime(timeString) {
  // Remove seconds from time string (HH:MM:SS -> HH:MM)
  if (!timeString) return '';
  const parts = timeString.split(':');
  return `${parts[0]}:${parts[1]}`;
}

onMounted(() => {
  loadUpcomingEvents();
});
</script>

<style scoped>
.appointments-section {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.section-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 16px;
  padding-left: 4px;
}

.no-appointments {
  text-align: center;
  padding: 48px 24px;
  color: var(--color-text-tertiary);
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-sm);
}

.no-appointments p {
  margin: 0;
  font-size: 14px;
}

.appointments-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.appointment-card {
  display: flex;
  gap: 16px;
  padding: 16px 18px;
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-base);
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.appointment-card::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: var(--color-accent);
  opacity: 0;
  transition: opacity var(--transition-fast);
}

.appointment-card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
  border-color: var(--border-color-strong);
}

.appointment-card:hover::before {
  opacity: 1;
}

.appointment-date {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 56px;
  padding: 12px 14px;
  background: linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-hover) 100%);
  border-radius: var(--radius-md);
  color: white;
  box-shadow: 0 2px 8px rgba(224, 122, 95, 0.3);
  transition: transform var(--transition-fast);
}

.appointment-card:hover .appointment-date {
  transform: scale(1.02);
}

.date-day {
  font-size: 22px;
  font-weight: 700;
  line-height: 1;
}

.date-month {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-top: 4px;
  opacity: 0.9;
  font-weight: 500;
}

.appointment-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  justify-content: center;
  min-width: 0;
}

.appointment-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.appointment-time {
  font-size: 13px;
  color: var(--color-text-secondary);
  display: flex;
  align-items: center;
  gap: 6px;
}

.appointment-time::before {
  content: '';
  display: inline-block;
  width: 12px;
  height: 12px;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%238a8582' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='12' cy='12' r='10'%3E%3C/circle%3E%3Cpolyline points='12 6 12 12 16 14'%3E%3C/polyline%3E%3C/svg%3E");
  background-size: contain;
  opacity: 0.7;
}

.appointment-description {
  font-size: 13px;
  color: var(--color-text-tertiary);
  margin-top: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  line-height: 1.4;
}

/* Staggered animation for cards */
.appointment-card:nth-child(1) { animation: slideUp 0.4s ease-out 0.1s both; }
.appointment-card:nth-child(2) { animation: slideUp 0.4s ease-out 0.2s both; }
.appointment-card:nth-child(3) { animation: slideUp 0.4s ease-out 0.3s both; }

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .appointments-section {
    padding: 16px;
    margin: 0;
  }

  .section-title {
    font-size: 12px;
    margin-bottom: 12px;
  }

  .appointment-card {
    padding: 14px;
    gap: 14px;
  }

  .appointment-date {
    min-width: 50px;
    padding: 10px 12px;
  }

  .date-day {
    font-size: 20px;
  }

  .date-month {
    font-size: 10px;
  }

  .appointment-title {
    font-size: 14px;
  }

  .appointment-time {
    font-size: 12px;
  }

  .appointments-list {
    gap: 10px;
  }
}

/* Desktop sidebar styling */
@media (min-width: 1200px) {
  .appointments-section {
    padding: 0;
    background: var(--color-surface);
    border-radius: var(--radius-xl);
    border: 1px solid var(--border-color);
    box-shadow: var(--shadow-sm);
    overflow: hidden;
  }

  .section-title {
    padding: 20px 20px 0;
    margin-bottom: 12px;
  }

  .appointments-list {
    padding: 0 16px 16px;
  }

  .no-appointments {
    margin: 0 16px 16px;
    border-radius: var(--radius-md);
    padding: 32px 16px;
  }

  .appointment-card {
    border: none;
    background: var(--color-bg-secondary);
    box-shadow: none;
  }

  .appointment-card:hover {
    background: var(--color-bg-tertiary);
    box-shadow: none;
    transform: translateX(4px);
  }
}
</style>