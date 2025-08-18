<template>
  <div class="calendar-container">
    <div class="calendar-header">
      <h2>Gedeelde Agenda</h2>
      <div class="header-actions">
        <button @click="openShareModal" class="btn-secondary">Delen</button>
        <button @click="showAddEvent = true" class="btn-primary">Nieuwe Afspraak</button>
        <button @click="logout" class="btn-logout">Uitloggen</button>
      </div>
    </div>

    <!-- Pending Invitations Banner -->
    <div v-if="pendingInvitations.length > 0" class="invitations-banner">
      <div class="invitation-header">
        <h4>📨 Nieuwe uitnodigingen ({{ pendingInvitations.length }})</h4>
      </div>
      <div class="invitations-list">
        <div
          v-for="invitation in pendingInvitations"
          :key="invitation.share_id"
          class="invitation-item">
          <div class="invitation-info">
            <strong>{{ invitation.owner_name }}</strong>
            wil hun agenda met je delen
            <span class="invitation-permission">
              ({{ invitation.permission === 'view' ? 'Bekijken' : 'Bekijken en bewerken' }})
            </span>
          </div>
          <div class="invitation-actions">
            <button
              @click="respondToInvitation(invitation.share_id, 'accepted')"
              class="btn-accept">
              Accepteren
            </button>
            <button
              @click="respondToInvitation(invitation.share_id, 'declined')"
              class="btn-decline">
              Weigeren
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Calendar Navigation -->
    <div class="calendar-nav">
      <div class="nav-controls">
        <button @click="previousPeriod" class="nav-btn">‹</button>
        <h3>{{ currentPeriodName }}</h3>
        <button @click="nextPeriod" class="nav-btn">›</button>
      </div>

      <div class="view-controls">
        <button
          @click="setView('month')"
          :class="['view-btn', { active: currentView === 'month' }]">
          Maand
        </button>
        <button @click="setView('week')" :class="['view-btn', { active: currentView === 'week' }]">
          Week
        </button>
        <button @click="setView('day')" :class="['view-btn', { active: currentView === 'day' }]">
          Dag
        </button>
      </div>
    </div>

    <!-- Calendar Views -->
    <div class="calendar-content">
      <!-- Month View -->
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
              @click="selectDate(day)">
              <div class="day-number">{{ day.day }}</div>
              <div class="events-container">
                <div
                  v-for="event in day.events.slice(0, 3)"
                  :key="event.id"
                  class="event"
                  :class="{ 'shared-event': event.event_type === 'shared' }"
                  @click.stop="editEvent(event)">
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

      <!-- Week View -->
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
                  @click="selectTimeSlot(day.date, hour)">
                  <div
                    v-for="event in getEventsForDayHour(day.date, hour)"
                    :key="event.id"
                    class="week-event"
                    :class="{ 'shared-event': event.event_type === 'shared' }"
                    @click.stop="editEvent(event)"
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

      <!-- Day View -->
      <div v-show="currentView === 'day'" class="day-view">
        <div class="day-header">
          <h4>{{ currentDayName }}</h4>
        </div>

        <div class="day-content">
          <div v-for="hour in timeSlots" :key="hour" class="day-hour">
            <div class="hour-label">{{ hour }}:00</div>
            <div class="hour-content" @click="selectTimeSlot(getCurrentDateString(), hour)">
              <div
                v-for="event in getEventsForDayHour(getCurrentDateString(), hour)"
                :key="event.id"
                class="day-event"
                :class="{ 'shared-event': event.event_type === 'shared' }"
                @click.stop="editEvent(event)">
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
    </div>

    <!-- Add/Edit Event Modal -->
    <div v-if="showAddEvent" class="modal-overlay" @click="closeModal">
      <div class="modal" @click.stop>
        <h3>{{ editingEvent ? 'Afspraak Bewerken' : 'Nieuwe Afspraak' }}</h3>
        <form @submit.prevent="saveEvent">
          <div class="form-group">
            <label>Titel:</label>
            <input v-model="eventForm.title" type="text" required />
          </div>
          <div class="form-group">
            <label>Datum:</label>
            <input v-model="eventForm.date" type="date" required />
          </div>
          <div class="form-group">
            <label>Tijd:</label>
            <input v-model="eventForm.time" type="time" required />
          </div>
          <div class="form-group">
            <label>Beschrijving:</label>
            <textarea v-model="eventForm.description" rows="3"></textarea>
          </div>
          <div class="modal-actions">
            <button v-if="editingEvent" type="button" @click="deleteEvent" class="btn-danger">
              Verwijderen
            </button>
            <button type="button" @click="closeModal" class="btn-secondary">Annuleren</button>
            <button type="submit" class="btn-primary">
              {{ editingEvent ? 'Bijwerken' : 'Toevoegen' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Share Calendar Modal -->
    <div v-if="showShareModal" class="modal-overlay" @click="closeShareModal">
      <div class="modal" @click.stop>
        <h3>Agenda Delen</h3>

        <!-- Invite new user -->
        <div class="share-section">
          <h4>Iemand uitnodigen</h4>
          <form @submit.prevent="inviteUser">
            <div class="form-group">
              <label>Email adres:</label>
              <input v-model="shareForm.email" type="email" required placeholder="naam@email.com" />
            </div>
            <div class="form-group">
              <label>Toegang:</label>
              <select v-model="shareForm.permission">
                <option value="view">Alleen bekijken</option>
                <option value="edit">Bekijken en bewerken</option>
              </select>
            </div>
            <button type="submit" class="btn-primary">Uitnodigen</button>
          </form>
        </div>

        <!-- Current shares -->
        <div class="share-section">
          <h4>Gedeeld met</h4>
          <div v-if="myShares.length === 0" class="no-shares">Nog niet gedeeld met iemand</div>
          <div v-for="share in myShares" :key="share.share_id" class="share-item">
            <div class="share-info">
              <strong>{{ share.shared_with_name }}</strong>
              <span class="share-email">{{ share.shared_with_email }}</span>
              <span class="share-permission">
                {{ share.permission === 'view' ? 'Bekijken' : 'Bewerken' }}
              </span>
              <span class="share-status" :class="share.status">
                {{ share.status === 'pending' ? 'Uitnodiging verzonden' : 'Geaccepteerd' }}
              </span>
            </div>
            <button @click="removeShare(share.share_id)" class="btn-danger-small">
              Verwijderen
            </button>
          </div>
        </div>

        <!-- Shared calendars (calendars shared with me) -->
        <div class="share-section">
          <h4>Agenda's gedeeld met mij</h4>
          <div v-if="sharedCalendars.length === 0" class="no-shares">Geen gedeelde agenda's</div>
          <div v-for="calendar in sharedCalendars" :key="calendar.share_id" class="share-item">
            <div class="share-info">
              <strong>{{ calendar.owner_name }}</strong>
              <span class="share-email">{{ calendar.owner_email }}</span>
              <span class="share-permission">
                {{ calendar.permission === 'view' ? 'Bekijken' : 'Bewerken' }}
              </span>
            </div>
          </div>
        </div>

        <div class="modal-actions">
          <button type="button" @click="closeShareModal" class="btn-secondary">Sluiten</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// State - ALL reactive variables defined first
const currentDate = ref(new Date());
const currentView = ref('month');
const showAddEvent = ref(false);
const showShareModal = ref(false);
const editingEvent = ref(null);
const events = ref([]);
const sharedCalendars = ref([]);
const myShares = ref([]);
const pendingInvitations = ref([]);

const eventForm = ref({
  title: '',
  date: '',
  time: '',
  description: '',
});

const shareForm = ref({
  email: '',
  permission: 'view',
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

  console.log('Building month days, total events:', events.value.length); // Debug

  // Generate 42 days (6 weeks) for complete month view
  for (let i = 0; i < 42; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);

    const dateStr = formatDate(date);

    // Filter events for this day - FIRST define, THEN debug
    const dayEvents = events.value.filter((event) => {
      const eventDate = event.date || event.start?.split('T')[0];
      return eventDate === dateStr;
    });

    // Debug log for specific date AFTER dayEvents is defined
    if (dateStr === '2025-08-14') {
      console.log('Checking events for 2025-08-14:');
      console.log(
        '- Available events:',
        events.value.map((e) => ({ title: e.title, date: e.date, start: e.start }))
      );
      console.log('- Matching events:', dayEvents);
    }

    days.push({
      date: dateStr,
      day: date.getDate(),
      isCurrentMonth: date.getMonth() === month,
      isToday: isSameDay(date, today),
      events: dayEvents,
      isWeekend: date.getDay() === 0 || date.getDay() === 6,
    });
  }

  console.log(
    'Month days built, total days with events:',
    days.filter((d) => d.events.length > 0).length
  ); // Debug

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
  // Use the day.date directly instead of parsing it again
  eventForm.value = {
    title: '',
    date: day.date, // This is already in YYYY-MM-DD format
    time: '09:00',
    description: '',
  };
  editingEvent.value = null;
  showAddEvent.value = true;
}

function selectTimeSlot(date, hour) {
  const timeString = `${hour.toString().padStart(2, '0')}:00`;
  eventForm.value = {
    title: '',
    date: date,
    time: timeString,
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

function getEventsForDayHour(date, hour) {
  const matchingEvents = events.value.filter((event) => {
    // Get event date - check both 'date' field and 'start' field
    const eventDate = event.date || event.start?.split('T')[0];

    if (eventDate !== date) return false;

    // Get event hour from either 'time' field or 'start' field
    let eventTime = event.time;
    if (!eventTime && event.start) {
      eventTime = event.start.split('T')[1]; // Get time part from "2025-08-14T09:00"
    }

    if (!eventTime) return false;

    const eventHour = parseInt(eventTime.split(':')[0]);
    const matches = eventHour === hour;

    // Debug log for today's date
    if (date === getCurrentDateString() && matches) {
      console.log(`Found event for ${date} at hour ${hour}:`, event);
    }

    return matches;
  });

  return matchingEvents;
}

function closeModal() {
  showAddEvent.value = false;
  editingEvent.value = null;
  eventForm.value = { title: '', date: '', time: '', description: '' };
}

function closeShareModal() {
  showShareModal.value = false;
  shareForm.value = { email: '', permission: 'view' };
}

function openShareModal() {
  showShareModal.value = true;
  loadShares(); // Load current shares when opening modal
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
  try {
    console.log('saveEvent called, editingEvent:', editingEvent.value);
    console.log('eventForm values:', eventForm.value);

    if (editingEvent.value) {
      // Update existing event
      const updatedEvent = { ...eventForm.value, id: editingEvent.value.id };
      console.log('Updating event:', updatedEvent);

      await updateEventAPI(updatedEvent);

      const index = events.value.findIndex((e) => e.id === editingEvent.value.id);
      if (index !== -1) {
        events.value[index] = updatedEvent;
      }

      closeModal();
      alert('Afspraak bijgewerkt!');
    } else {
      // Add new event - check if form is filled
      if (!eventForm.value.title || !eventForm.value.date || !eventForm.value.time) {
        alert('Vul alle velden in!');
        return;
      }

      const newEvent = {
        title: eventForm.value.title,
        date: eventForm.value.date,
        time: eventForm.value.time,
        description: eventForm.value.description,
      };

      console.log('Creating new event:', newEvent);

      const response = await createEventAPI(newEvent);
      console.log('Create API response:', response);

      if (response && response.success && response.event) {
        // Add to local events array with proper format
        const newEventFormatted = {
          id: response.event.id,
          title: newEvent.title,
          date: newEvent.date,
          time: newEvent.time,
          description: newEvent.description,
          creator: 'Jij',
        };

        events.value.push(newEventFormatted);
        console.log('Event added to local array:', newEventFormatted);

        closeModal();
        alert('Afspraak toegevoegd!');
      } else {
        console.error('Invalid API response:', response);
        alert('Fout: Event niet correct opgeslagen');
      }
    }
  } catch (error) {
    console.error('Error in saveEvent:', error);
    alert('Fout bij het opslaan van afspraak: ' + (error.message || 'Onbekende fout'));
    // Always close modal on error to prevent hanging
    closeModal();
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
      console.error('Error deleting event:', error);
      alert('Fout bij het verwijderen van afspraak');
    }
  }
}

// API functions
async function loadEventsAPI() {
  try {
    console.log('Loading events from API...'); // Debug log

    const response = await $fetch('http://localhost/sharedcalender/api/events.php', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });

    console.log('API Response:', response); // Debug log
    console.log('Events found:', response.events?.length || 0); // Debug log

    return response.events || [];
  } catch (error) {
    console.error('Error loading events:', error);
    alert('Fout bij het laden van events: ' + (error.data?.error || error.message));
    return [];
  }
}

async function createEventAPI(event) {
  try {
    console.log('Making API call to create event:', event);

    const response = await $fetch('http://localhost/sharedcalender/api/events.php', {
      method: 'POST',
      body: JSON.stringify(event),
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });

    console.log('Raw API response:', response);
    return response;
  } catch (error) {
    console.error('Error in createEventAPI:', error);
    console.error('Error details:', error.data);
    throw error;
  }
}

async function updateEventAPI(event) {
  try {
    const response = await $fetch(`http://localhost/sharedcalender/api/events.php?id=${event.id}`, {
      method: 'PUT',
      body: JSON.stringify(event),
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
    return response;
  } catch (error) {
    console.error('Error updating event:', error);
    throw error;
  }
}

async function deleteEventAPI(eventId) {
  try {
    const response = await $fetch(`http://localhost/sharedcalender/api/events.php?id=${eventId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
    return response;
  } catch (error) {
    console.error('Error deleting event:', error);
    throw error;
  }
}

// Sharing API functions
async function inviteUser() {
  try {
    const response = await $fetch('http://localhost/sharedcalender/api/participants.php', {
      method: 'POST',
      body: JSON.stringify({
        action: 'invite_user',
        email: shareForm.value.email,
        permission: shareForm.value.permission,
      }),
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });

    if (response.success) {
      alert('Uitnodiging verzonden!');
      shareForm.value = { email: '', permission: 'view' };
      loadShares();
    }
  } catch (error) {
    console.error('Error inviting user:', error);
    alert(error.data?.error || 'Fout bij het versturen van uitnodiging');
  }
}

async function loadShares() {
  try {
    // Load my shares
    const mySharesResponse = await $fetch(
      'http://localhost/sharedcalender/api/participants.php?action=my_shares',
      {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      }
    );
    myShares.value = mySharesResponse.my_shares || [];

    // Load shared calendars
    const sharedResponse = await $fetch(
      'http://localhost/sharedcalender/api/participants.php?action=shared_calendars',
      {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      }
    );
    sharedCalendars.value = sharedResponse.shared_calendars || [];
  } catch (error) {
    console.error('Error loading shares:', error);
  }
}

async function loadPendingInvitations() {
  try {
    const response = await $fetch(
      'http://localhost/sharedcalender/api/participants.php?action=pending_invitations',
      {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      }
    );
    pendingInvitations.value = response.pending_invitations || [];
  } catch (error) {
    console.error('Error loading pending invitations:', error);
  }
}

async function removeShare(shareId) {
  if (!confirm('Weet je zeker dat je deze deling wilt verwijderen?')) return;

  try {
    await $fetch(`http://localhost/sharedcalender/api/participants.php?id=${shareId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });

    alert('Deling verwijderd!');
    loadShares();
  } catch (error) {
    console.error('Error removing share:', error);
    alert('Fout bij het verwijderen van deling');
  }
}

async function respondToInvitation(invitationId, response) {
  try {
    const result = await $fetch('http://localhost/sharedcalender/api/participants.php', {
      method: 'POST',
      body: JSON.stringify({
        action: 'respond_invitation',
        invitation_id: invitationId,
        response: response,
      }),
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });

    if (result.success) {
      alert(response === 'accepted' ? 'Uitnodiging geaccepteerd!' : 'Uitnodiging geweigerd!');
      // Reload data
      await loadPendingInvitations();
      await loadShares();
      await loadEventsAPI(); // Reload events to include shared calendars
    }
  } catch (error) {
    console.error('Error responding to invitation:', error);
    alert('Fout bij het verwerken van uitnodiging');
  }
}

// Load events on mount
onMounted(async () => {
  try {
    const loadedEvents = await loadEventsAPI();
    events.value = loadedEvents;
    // Load sharing information
    await loadShares();
    // Load pending invitations
    await loadPendingInvitations();
  } catch (error) {
    console.error('Failed to load events:', error);
  }
});
</script>

<style scoped>
.calendar-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.calendar-header h2 {
  margin: 0;
  color: #333;
}

.header-actions {
  display: flex;
  gap: 10px;
}

/* Invitations Banner */
.invitations-banner {
  background: linear-gradient(135deg, #e3f2fd, #bbdefb);
  border: 1px solid #2196f3;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(33, 150, 243, 0.1);
}

.invitation-header h4 {
  margin: 0 0 10px 0;
  color: #1976d2;
  font-size: 16px;
}

.invitations-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.invitation-item {
  background: white;
  padding: 12px;
  border-radius: 6px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.invitation-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.invitation-permission {
  font-size: 12px;
  color: #666;
  font-style: italic;
}

.invitation-actions {
  display: flex;
  gap: 8px;
}

.btn-accept {
  background-color: #28a745;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.btn-accept:hover {
  background-color: #218838;
}

.btn-decline {
  background-color: #dc3545;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.btn-decline:hover {
  background-color: #c82333;
}

/* Share Modal Styles */
.share-section {
  margin-bottom: 25px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
}

.share-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.share-section h4 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #333;
  font-size: 16px;
}

.share-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 6px;
  margin-bottom: 8px;
}

.share-info {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.share-email {
  font-size: 12px;
  color: #666;
}

.share-permission {
  font-size: 12px;
  padding: 2px 6px;
  background: #e3f2fd;
  color: #1976d2;
  border-radius: 12px;
  display: inline-block;
  width: fit-content;
}

.share-status {
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 12px;
  display: inline-block;
  width: fit-content;
}

.share-status.pending {
  background: #fff3cd;
  color: #856404;
}

.share-status.accepted {
  background: #d4edda;
  color: #155724;
}

.no-shares {
  color: #666;
  font-style: italic;
  text-align: center;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 6px;
}

.btn-danger-small {
  background-color: #dc3545;
  color: white;
  border: none;
  padding: 4px 8px;
  border-radius: 3px;
  cursor: pointer;
  font-size: 12px;
}

.btn-danger-small:hover {
  background-color: #c82333;
}

select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  background: white;
}

/* Calendar Navigation */
.calendar-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 15px;
}

.nav-controls {
  display: flex;
  align-items: center;
  gap: 15px;
}

.view-controls {
  display: flex;
  gap: 5px;
}

.view-btn {
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  color: #495057;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.view-btn:hover {
  background: #e9ecef;
}

.view-btn.active {
  background: #007bff;
  color: white;
  border-color: #007bff;
}

.nav-btn {
  background: #007bff;
  color: white;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-btn:hover {
  background: #0056b3;
}

.calendar-nav h3 {
  margin: 0;
  font-size: 20px;
  color: #333;
  min-width: 200px;
  text-align: center;
}

/* Month View */
.calendar-grid {
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
}

.calendar-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  background: #f8f9fa;
}

.weekday {
  padding: 15px 10px;
  text-align: center;
  font-weight: 600;
  color: #666;
  border-right: 1px solid #ddd;
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
  border-right: 1px solid #eee;
  border-bottom: 1px solid #eee;
  padding: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  flex-direction: column;
}

.calendar-day:hover {
  background-color: #f8f9fa;
}

.calendar-day:last-child {
  border-right: none;
}

.calendar-day.other-month {
  background-color: #f9f9f9;
  color: #ccc;
}

.calendar-day.other-month .event {
  opacity: 0.5;
}

.calendar-day.today {
  background-color: #e3f2fd;
}

.calendar-day.weekend {
  background-color: #fafafa;
}

.day-number {
  font-weight: 600;
  margin-bottom: 6px;
  font-size: 14px;
}

.events-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.event {
  background: linear-gradient(135deg, #007bff, #0056b3);
  color: white;
  padding: 2px 6px;
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
  background: linear-gradient(135deg, #0056b3, #004085);
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.event.shared-event {
  background: linear-gradient(135deg, #28a745, #1e7e34);
}

.event.shared-event:hover {
  background: linear-gradient(135deg, #1e7e34, #155724);
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

/* Week View */
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
  color: #007bff;
  background: #e3f2fd;
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
  background: #007bff;
  color: white;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 11px;
  margin-bottom: 2px;
  cursor: pointer;
}

.week-event:hover {
  background: #0056b3;
}

.week-event.shared-event {
  background: #28a745;
}

.week-event.shared-event:hover {
  background: #1e7e34;
}

/* Day View */
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
  background: linear-gradient(135deg, #007bff, #0056b3);
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

/* Button styles */
.btn-primary {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
}

.btn-primary:hover {
  background-color: #0056b3;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
}

.btn-secondary:hover {
  background-color: #545b62;
}

.btn-logout {
  background-color: #dc3545;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}

.btn-logout:hover {
  background-color: #c82333;
}

.btn-danger {
  background-color: #dc3545;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
}

/* Modal styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal {
  background: white;
  padding: 30px;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.modal h3 {
  margin-top: 0;
  margin-bottom: 20px;
  color: #333;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
  color: #333;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #007bff;
}

.modal-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 20px;
}

/* Responsive */
@media (max-width: 768px) {
  .calendar-nav {
    flex-direction: column;
    gap: 10px;
  }

  .nav-controls {
    order: 2;
  }

  .view-controls {
    order: 1;
    width: 100%;
    justify-content: center;
  }

  .view-btn {
    flex: 1;
    text-align: center;
  }

  .week-header,
  .hour-row {
    grid-template-columns: 60px repeat(7, 1fr);
  }

  .day-hour {
    grid-template-columns: 60px 1fr;
  }

  .calendar-day {
    min-height: 80px;
    font-size: 12px;
  }

  .modal {
    margin: 20px;
    width: calc(100% - 40px);
  }
}
</style>
