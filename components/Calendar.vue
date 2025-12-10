<template>
  <div class="calendar-container">
    <CalendarHeader
      :user-name="userName"
      @settings="goToSettings"
      @add-event="showAddEvent = true"
      @logout="logout" />

    <CalendarNavigation
      :current-view="currentView"
      :current-period-name="currentPeriodName"
      @previous="previousPeriod"
      @next="nextPeriod"
      @view-change="setView" />

    <!-- Calendar Views -->
    <div class="calendar-content">
      <CalendarMonthView
        :current-view="currentView"
        :month-days="monthDays"
        :weekdays="weekdays"
        @day-click="selectDate"
        @event-click="editEvent" />

      <CalendarWeekView
        :current-view="currentView"
        :week-days="weekDays"
        :events="events"
        :time-slots="timeSlots"
        @time-slot-click="selectTimeSlot"
        @event-click="editEvent" />

      <CalendarDayView
        :current-view="currentView"
        :current-day-name="currentDayName"
        :current-date="getCurrentDateString()"
        :events="events"
        :time-slots="timeSlots"
        @time-slot-click="(hour) => selectTimeSlot(getCurrentDateString(), hour)"
        @event-click="editEvent" />
    </div>

    <CalendarEventModal
      :show="showAddEvent"
      :editing-event="editingEvent"
      :form-data="eventForm"
      :is-saving="isSaving"
      @close="closeModal"
      @save="saveEvent"
      @delete="deleteEvent" />
  </div>
</template>

<script setup>
// Get runtime config for API base URL
const config = useRuntimeConfig();
const apiBase = config.public.apiBaseUrl;

// State - ALL reactive variables defined first
const currentDate = ref(new Date());
const currentView = ref('month');
const showAddEvent = ref(false);
const editingEvent = ref(null);
const events = ref([]);
const userName = ref('');
const notificationsEnabled = ref(false);
const isSaving = ref(false); // Prevent double-click on save button
let pusherInstance = null;

const eventForm = ref({
  title: '',
  date: '',
  time: '',
  endTime: '',
  description: '',
  reminder_minutes: null,
});

// Constants
const weekdays = ['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo'];
const timeSlots = Array.from({ length: 24 }, (_, i) => i); // 0-23 hours

// Helper functions
function getCurrentDateString() {
  return formatDate(currentDate.value);
}

function formatDate(date) {
  // Create a new date in Amsterdam timezone to avoid UTC issues
  const amsterdamDate = new Date(date.toLocaleString('en-US', { timeZone: 'Europe/Amsterdam' }));
  const year = amsterdamDate.getFullYear();
  const month = String(amsterdamDate.getMonth() + 1).padStart(2, '0');
  const day = String(amsterdamDate.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function isSameDay(date1, date2) {
  // Compare dates in Amsterdam timezone
  const amsterdamDate1 = new Date(date1.toLocaleString('en-US', { timeZone: 'Europe/Amsterdam' }));
  const amsterdamDate2 = new Date(date2.toLocaleString('en-US', { timeZone: 'Europe/Amsterdam' }));

  return (
    amsterdamDate1.getFullYear() === amsterdamDate2.getFullYear() &&
    amsterdamDate1.getMonth() === amsterdamDate2.getMonth() &&
    amsterdamDate1.getDate() === amsterdamDate2.getDate()
  );
}

function getAuthToken() {
  return localStorage.getItem('authToken') || '';
}

function getWeekStart(date) {
  const start = new Date(date);
  const dayOfWeek = (start.getDay() + 6) % 7; // Convert Sunday=0 to Monday=0
  start.setDate(start.getDate() - dayOfWeek);
  return start;
}

function getMonthName(monthIndex) {
  const months = [
    'Jan',
    'Feb',
    'Mrt',
    'Apr',
    'Mei',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Okt',
    'Nov',
    'Dec',
  ];
  return months[monthIndex];
}

// Computed properties - NOW safe to use currentView
const currentYear = computed(() => currentDate.value.getFullYear());
const currentMonth = computed(() => currentDate.value.getMonth());

const currentMonthName = computed(() => {
  const months = [
    'Januari',
    'Februari',
    'Maart',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Augustus',
    'September',
    'Oktober',
    'November',
    'December',
  ];
  return months[currentMonth.value];
});

const currentPeriodName = computed(() => {
  if (currentView.value === 'month') {
    return `${currentMonthName.value} ${currentYear.value}`;
  } else if (currentView.value === 'week') {
    const weekStart = getWeekStart(currentDate.value);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    return `Week ${weekStart.getDate()} ${getMonthName(
      weekStart.getMonth()
    )} - ${weekEnd.getDate()} ${getMonthName(weekEnd.getMonth())} ${currentYear.value}`;
  } else {
    return `${currentDate.value.getDate()} ${currentMonthName.value} ${currentYear.value}`;
  }
});

const currentDayName = computed(() => {
  const days = ['Zondag', 'Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag'];
  return `${days[currentDate.value.getDay()]} ${currentDate.value.getDate()} ${
    currentMonthName.value
  }`;
});

const monthDays = computed(() => {
  const year = currentYear.value;
  const month = currentMonth.value;

  const firstDay = new Date(year, month, 1);
  const startDate = new Date(firstDay);
  const dayOfWeek = (firstDay.getDay() + 6) % 7; // Convert Sunday=0 to Monday=0
  startDate.setDate(firstDay.getDate() - dayOfWeek);

  const days = [];
  const today = new Date();

  // Generate 42 days (6 weeks) for complete month view
  for (let i = 0; i < 42; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);

    const dateStr = formatDate(date);

    // Filter events for this day
    const dayEvents = events.value.filter((event) => {
      const eventDate = event.date || event.start?.split('T')[0];
      return eventDate === dateStr;
    });

    days.push({
      date: dateStr,
      day: date.getDate(),
      isCurrentMonth: date.getMonth() === month,
      isToday: isSameDay(date, today),
      events: dayEvents,
      isWeekend: date.getDay() === 0 || date.getDay() === 6,
    });
  }

  return days;
});

const weekDays = computed(() => {
  const start = getWeekStart(currentDate.value);
  const days = [];
  const today = new Date();

  for (let i = 0; i < 7; i++) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    days.push({
      date: formatDate(date),
      day: date.getDate(),
      name: weekdays[i],
      isToday: isSameDay(date, today),
    });
  }
  return days;
});

// Methods
function setView(view) {
  currentView.value = view;
}

function previousPeriod() {
  const newDate = new Date(currentDate.value);
  if (currentView.value === 'month') {
    newDate.setMonth(newDate.getMonth() - 1);
  } else if (currentView.value === 'week') {
    newDate.setDate(newDate.getDate() - 7);
  } else {
    newDate.setDate(newDate.getDate() - 1);
  }
  currentDate.value = newDate;
}

function nextPeriod() {
  const newDate = new Date(currentDate.value);
  if (currentView.value === 'month') {
    newDate.setMonth(newDate.getMonth() + 1);
  } else if (currentView.value === 'week') {
    newDate.setDate(newDate.getDate() + 7);
  } else {
    newDate.setDate(newDate.getDate() + 1);
  }
  currentDate.value = newDate;
}

function selectDate(day) {
  // Parse the date string to set currentDate
  const [year, month, dayNum] = day.date.split('-').map(Number);
  currentDate.value = new Date(year, month - 1, dayNum);

  // Switch to day view
  currentView.value = 'day';
}

function selectTimeSlot(date, hour) {
  const timeString = `${hour.toString().padStart(2, '0')}:00`;
  const endTimeString = `${(hour + 1).toString().padStart(2, '0')}:00`;
  eventForm.value = {
    title: '',
    date: date,
    time: timeString,
    endTime: endTimeString,
    description: '',
  };
  editingEvent.value = null;
  showAddEvent.value = true;
}

function editEvent(event) {
  eventForm.value = { ...event };
  editingEvent.value = event;
  showAddEvent.value = true;
}

function closeModal() {
  showAddEvent.value = false;
  editingEvent.value = null;
  eventForm.value = { title: '', date: '', time: '', endTime: '', description: '', reminder_minutes: null };
}

function goToSettings() {
  navigateTo('/settings');
}

function logout() {
  if (confirm('Weet je zeker dat je wilt uitloggen?')) {
    // Clear token from localStorage
    localStorage.removeItem('authToken');

    // Redirect to login page
    navigateTo('/login');
  }
}

// Event CRUD operations
async function saveEvent() {
  console.log('saveEvent called');
  console.log('editingEvent:', editingEvent.value);
  console.log('eventForm:', eventForm.value);

  // Prevent double-click by disabling save button
  if (isSaving.value) {
    console.log('Already saving, ignoring duplicate click');
    return;
  }

  isSaving.value = true;

  try {
    if (editingEvent.value) {
      // Update existing event
      console.log('Updating existing event...');
      const updatedEvent = { ...eventForm.value, id: editingEvent.value.id };

      await updateEventAPI(updatedEvent);

      const index = events.value.findIndex((e) => e.id === editingEvent.value.id);
      if (index !== -1) {
        events.value[index] = updatedEvent;
      }

      closeModal();
      alert('Afspraak bijgewerkt!');
    } else {
      // Add new event - check if form is filled
      console.log('Adding new event...');
      if (!eventForm.value.title || !eventForm.value.date || !eventForm.value.time || !eventForm.value.endTime) {
        console.log('Validation failed - missing fields');
        alert('Vul alle velden in!');
        isSaving.value = false;
        return;
      }

      const newEvent = {
        title: eventForm.value.title,
        date: eventForm.value.date,
        time: eventForm.value.time,
        endTime: eventForm.value.endTime,
        description: eventForm.value.description,
        reminder_minutes: eventForm.value.reminder_minutes,
      };

      console.log('Calling createEventAPI with:', newEvent);
      const response = await createEventAPI(newEvent);
      console.log('createEventAPI response:', response);

      if (response && response.success && response.event) {
        // Don't add to local array here - Pusher will handle it to avoid duplicates
        console.log('Event created successfully, waiting for Pusher update');

        closeModal();
        alert('Afspraak toegevoegd!');
      } else {
        console.log('Invalid response from API:', response);
        alert('Fout: Event niet correct opgeslagen');
      }
    }
  } catch (error) {
    console.error('Error in saveEvent:', error);
    alert('Fout bij het opslaan van afspraak: ' + (error.message || 'Onbekende fout'));
    // Always close modal on error to prevent hanging
    closeModal();
  } finally {
    isSaving.value = false;
  }
}

async function deleteEvent() {
  if (!editingEvent.value) return;

  if (confirm('Weet je zeker dat je deze afspraak wilt verwijderen?')) {
    try {
      await deleteEventAPI(editingEvent.value.id);
      events.value = events.value.filter((e) => e.id !== editingEvent.value.id);
      closeModal();
      alert('Afspraak verwijderd!');
    } catch (error) {
      alert('Fout bij het verwijderen van afspraak');
    }
  }
}

// API functions
async function loadEventsAPI() {
  try {
    const response = await $fetch(`${apiBase}/get_events.php`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });

    return response.events || [];
  } catch (error) {
    alert('Fout bij het laden van events: ' + (error.data?.error || error.message));
    return [];
  }
}

async function createEventAPI(event) {
  try {
    const response = await $fetch(`${apiBase}/create_event.php`, {
      method: 'POST',
      body: JSON.stringify(event),
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });

    return response;
  } catch (error) {
    throw error;
  }
}

async function updateEventAPI(event) {
  try {
    const response = await $fetch(`${apiBase}/update_event.php`, {
      method: 'POST',
      body: JSON.stringify(event),
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
    return response;
  } catch (error) {
    throw error;
  }
}

async function deleteEventAPI(eventId) {
  try {
    const response = await $fetch(`${apiBase}/delete_event.php`, {
      method: 'POST',
      body: JSON.stringify({ id: eventId }),
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
    return response;
  } catch (error) {
    throw error;
  }
}

// Decode token to get user info
function getUserInfoFromToken() {
  const token = getAuthToken();
  if (!token) return null;

  try {
    // Check if it's a JWT (header.payload.signature)
    const parts = token.split('.');

    if (parts.length === 3) {
      // Standard JWT format
      const base64Url = parts[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join('')
      );
      return JSON.parse(jsonPayload);
    } else {
      // Simple base64 encoded JSON (zoals deze app gebruikt)
      const decoded = atob(token);
      const userInfo = JSON.parse(decoded);
      return userInfo;
    }
  } catch (error) {
    return null;
  }
}

// Service Worker registration reference
let swRegistration = null;

// Register Service Worker voor push notificaties
async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js');
    swRegistration = registration;
    return registration;
  } catch (error) {
    return null;
  }
}

// Vraag notificatie permissies
async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    return false;
  }

  if (Notification.permission === 'granted') {
    notificationsEnabled.value = true;
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    notificationsEnabled.value = permission === 'granted';
    return permission === 'granted';
  }

  return false;
}

// Toon browser notificatie (werkt op zowel desktop als mobiel)
async function showNotification(title, options = {}) {
  if (!notificationsEnabled.value || !('Notification' in window)) {
    return;
  }

  const notificationOptions = {
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [200, 100, 200],
    requireInteraction: true,
    ...options,
  };

  // Gebruik Service Worker voor notificaties (werkt beter op mobiel)
  if (swRegistration && swRegistration.showNotification) {
    try {
      await swRegistration.showNotification(title, notificationOptions);
    } catch (error) {
      // Fallback naar normale notificatie
      new Notification(title, notificationOptions);
    }
  } else {
    // Fallback voor desktop browsers
    new Notification(title, notificationOptions);
  }
}

// Setup Pusher voor real-time updates
async function setupPusher() {
  const userInfo = getUserInfoFromToken();
  if (!userInfo || (!userInfo.user_id && !userInfo.id)) {
    return;
  }

  const userId = userInfo.user_id || userInfo.id;

  try {
    // Dynamically import Pusher
    const Pusher = (await import('pusher-js')).default;

    pusherInstance = new Pusher('eca46c4499768c752eed', {
      cluster: 'eu',
      encrypted: true,
      // Enable different transport fallbacks
      enabledTransports: ['ws', 'wss', 'xhr_polling', 'xhr_streaming'],
      disabledTransports: [],
      // Force TLS
      forceTLS: true,
    });

    // Gebruik public channel (geen auth nodig)
    const channelName = `user-${userId}`;
    const channel = pusherInstance.subscribe(channelName);

    // Event created
    channel.bind('event-created', async (data) => {
      // Voeg toe aan events array (check of niet al bestaat)
      const exists = events.value.some((e) => e.id === data.id);
      if (!exists) {
        events.value.push(data);

        // Toon notificatie
        await showNotification('Nieuwe afspraak', {
          body: `${data.title} op ${data.date} om ${data.time}`,
          tag: `event-${data.id}`,
        });
      }
    });

    // Event updated
    channel.bind('event-updated', async (data) => {
      const index = events.value.findIndex((e) => e.id === data.id);
      if (index !== -1) {
        events.value[index] = { ...events.value[index], ...data };

        // Toon notificatie
        await showNotification('Afspraak bijgewerkt', {
          body: `${data.title} is bijgewerkt`,
          tag: `event-${data.id}`,
        });
      }
    });

    // Event deleted
    channel.bind('event-deleted', async (data) => {
      events.value = events.value.filter((e) => e.id !== data.id);

      // Toon notificatie
      await showNotification('Afspraak verwijderd', {
        body: `${data.title} is verwijderd`,
        tag: `event-${data.id}`,
      });
    });
  } catch (error) {
    // Silently handle pusher errors
  }
}

// Load events on mount
onMounted(async () => {
  // Check if user is authenticated before loading
  const token = getAuthToken();
  if (!token) {
    return;
  }

  // Validate token has user info
  const userInfo = getUserInfoFromToken();
  if (!userInfo || (!userInfo.user_id && !userInfo.id)) {
    return;
  }

  // Get user info from API
  try {
    const response = await $fetch(`${apiBase}/get_user_info.php`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.success && response.user) {
      userName.value = response.user.name || response.user.email || 'Gebruiker';
    }
  } catch (error) {
    // Silently fail - API not available yet
    // Fallback: try to decode token
    if (userInfo) {
      userName.value = userInfo.name || userInfo.email || 'Gebruiker';
    } else {
      // Don't show name if we can't get it
      userName.value = '';
    }
  }

  try {
    const loadedEvents = await loadEventsAPI();
    events.value = loadedEvents;
  } catch (error) {
  }

  // Register Service Worker voor push notificaties
  await registerServiceWorker();

  // Vraag notificatie permissies
  await requestNotificationPermission();

  // Setup Pusher voor real-time updates
  await setupPusher();

  // Auto-refresh events every 30 seconds to detect changes from Google Calendar
  // (dit is nu minder nodig door Pusher, maar houden voor extra zekerheid)
  const refreshInterval = setInterval(async () => {
    // Check if still authenticated before refreshing
    const currentToken = getAuthToken();
    if (!currentToken) {
      clearInterval(refreshInterval);
      return;
    }

    try {
      const loadedEvents = await loadEventsAPI();
      events.value = loadedEvents;
    } catch (error) {
      // If 401 error, stop the interval
      if (error.statusCode === 401) {
        clearInterval(refreshInterval);
      }
    }
  }, 30000); // 30 seconds
});

// Cleanup interval on unmount
onUnmounted(() => {
  if (pusherInstance) {
    pusherInstance.disconnect();
  }
});
</script>

<style scoped>
.calendar-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  padding-top: max(20px, env(safe-area-inset-top));
  padding-bottom: max(20px, env(safe-area-inset-bottom));
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  min-height: 100%;
}

@media (max-width: 768px) {
  .calendar-container {
    padding-top: 0;
  }
}

.calendar-content {
  box-shadow: rgba(0, 0, 0, 0.12) 0px 1px 3px, rgba(0, 0, 0, 0.24) 0px 1px 2px;
  box-shadow: rgba(0, 0, 0, 0.16) 0px 3px 6px, rgba(0, 0, 0, 0.23) 0px 3px 6px;
  border-radius: 15px;
  padding: 15px;
  background-color: #fff;
}
</style>
