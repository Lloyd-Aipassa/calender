# Pusher & OneSignal Implementatie Guide

Deze documentatie beschrijft hoe Pusher (realtime messaging) en OneSignal (push notifications) zijn geïmplementeerd in dit Nuxt 3 project.

---

## 📋 Inhoudsopgave

1. [Overzicht](#overzicht)
2. [Pusher Setup](#pusher-setup)
3. [OneSignal Setup](#onesignal-setup)
4. [Backend Implementatie](#backend-implementatie)
5. [Frontend Implementatie](#frontend-implementatie)
6. [Testing & Debugging](#testing--debugging)

---

## Overzicht

### Wat doet Pusher?
- **Realtime updates** van berichten in de chat
- **Live synchronisatie** tussen verschillende devices/browsers
- **Websocket verbindingen** voor instant updates

### Wat doet OneSignal?
- **Push notifications** wanneer app niet open is
- **Web push** op desktop browsers (Chrome, Firefox, Safari)
- **Mobile push** op iOS/Android via PWA

### Architectuur
```
Backend (PHP) → Pusher API → Pusher Websocket → Frontend (Nuxt)
Backend (PHP) → OneSignal API → Browser/Device → User
```

---

## Pusher Setup

### 1. Pusher Account & Credentials

**Registratie:**
1. Ga naar [pusher.com](https://pusher.com)
2. Maak een gratis account aan (100 connecties + 200k berichten/dag)
3. Maak een nieuwe "Channels" app aan

**Credentials ophalen:**
```
App ID:      1907746
Key:         2fef04f83be2d8dd488a
Secret:      [GEHEIM - bewaar veilig]
Cluster:     eu
```

### 2. Backend PHP Setup (Zonder Composer)

**Maak bestand: `api/config/pusher.php`**

```php
<?php
class PusherHelper {
    private $app_id;
    private $key;
    private $secret;
    private $cluster;

    public function __construct($app_id, $key, $secret, $cluster = 'eu') {
        $this->app_id = $app_id;
        $this->key = $key;
        $this->secret = $secret;
        $this->cluster = $cluster;
    }

    public function trigger($channel, $event, $data) {
        $data_string = json_encode($data);
        $timestamp = time();
        $path = "/apps/{$this->app_id}/events";

        // Build auth signature
        $auth_params = [
            'auth_key' => $this->key,
            'auth_timestamp' => $timestamp,
            'auth_version' => '1.0',
            'body_md5' => md5($data_string)
        ];

        // Sort params
        ksort($auth_params);

        // Build auth string
        $auth_string = "POST\n{$path}\n" . http_build_query($auth_params);
        $auth_signature = hash_hmac('sha256', $auth_string, $this->secret);

        // Build final URL
        $url = "https://api-{$this->cluster}.pusher.com{$path}";
        $query_params = array_merge($auth_params, ['auth_signature' => $auth_signature]);
        $url .= '?' . http_build_query($query_params);

        // Prepare request body
        $body = json_encode([
            'name' => $event,
            'channel' => $channel,
            'data' => $data_string
        ]);

        // Send request
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json'
        ]);

        $response = curl_exec($ch);
        $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($http_code !== 200) {
            error_log("Pusher error: " . $response);
            return false;
        }

        return json_decode($response, true);
    }
}

// Helper functie
function getPusher() {
    static $pusher = null;

    if ($pusher === null) {
        $pusher = new PusherHelper(
            '1907746',                      // app_id
            '2fef04f83be2d8dd488a',        // key
            'YOUR_SECRET_HERE',             // secret (bewaar veilig!)
            'eu'                            // cluster
        );
    }

    return $pusher;
}
```

### 3. Frontend Nuxt Setup

**Installeer Pusher JS:**
```bash
npm install pusher-js
```

**Maak composable (`composables/usePusher.js`):**
```javascript
import Pusher from 'pusher-js';

// Singleton Pusher instance
let pusherInstance = null;
let activeSubscriptions = new Map();

export const usePusher = () => {
  // Initialiseer Pusher (eenmalig)
  const initPusher = () => {
    if (!pusherInstance) {
      pusherInstance = new Pusher('2fef04f83be2d8dd488a', {
        cluster: 'eu',
        encrypted: true
      });

      // Debug logging (optioneel)
      Pusher.logToConsole = true;
    }
    return pusherInstance;
  };

  // Subscribe naar conversation channel
  const subscribeToConversation = (conversationId, callback) => {
    const pusher = initPusher();
    const channelName = `conversation-${conversationId}`;

    // Unsubscribe van oude channel als deze bestaat
    if (activeSubscriptions.has(channelName)) {
      const oldChannel = activeSubscriptions.get(channelName);
      oldChannel.unbind_all();
      pusher.unsubscribe(channelName);
    }

    // Subscribe naar nieuwe channel
    const channel = pusher.subscribe(channelName);

    // Bind event listener
    channel.bind('new-message', (data) => {
      console.log('📩 Nieuw bericht ontvangen:', data);
      callback(data);
    });

    // Sla subscription op
    activeSubscriptions.set(channelName, channel);

    return channel;
  };

  // Unsubscribe van conversation channel
  const unsubscribeFromConversation = (conversationId) => {
    const pusher = initPusher();
    const channelName = `conversation-${conversationId}`;

    if (activeSubscriptions.has(channelName)) {
      const channel = activeSubscriptions.get(channelName);
      channel.unbind_all();
      pusher.unsubscribe(channelName);
      activeSubscriptions.delete(channelName);
      console.log(`🔌 Unsubscribed van ${channelName}`);
    }
  };

  return {
    subscribeToConversation,
    unsubscribeFromConversation
  };
};
```

**Gebruik in Vue component:**
```vue
<script setup>
import { usePusher } from '~/composables/usePusher';

const { subscribeToConversation, unsubscribeFromConversation } = usePusher();
const messages = ref([]);

// Subscribe wanneer conversation geselecteerd wordt
watch(selectedConv, async (newConvId, oldConvId) => {
  // Unsubscribe van oude conversation
  if (oldConvId) {
    unsubscribeFromConversation(oldConvId);
  }

  // Subscribe naar nieuwe conversation
  if (newConvId) {
    subscribeToConversation(newConvId, (data) => {
      // Voeg nieuw bericht toe aan messages array
      messages.value.push(data);

      // Scroll naar beneden
      scrollToBottom();
    });
  }
});

// Cleanup bij unmount
onUnmounted(() => {
  if (selectedConv.value) {
    unsubscribeFromConversation(selectedConv.value);
  }
});
</script>
```

---

## OneSignal Setup

### 1. OneSignal Account & App Setup

**Registratie:**
1. Ga naar [onesignal.com](https://onesignal.com)
2. Maak een gratis account aan
3. Maak een nieuwe "Web Push" app aan

**App ID:**
```
App ID: 6cb000af-0fa3-4599-bae3-ab376c12bb36
```

**Web Configuration:**
1. Ga naar Settings → Web Push
2. Vul in:
   - **Site Name**: "Jouw App Naam"
   - **Site URL**: `https://jouwdomein.nl`
   - **Auto Resubscribe**: ON
   - **Default Notification Icon**: Upload een 256x256 PNG

### 2. Backend PHP Setup (OneSignal REST API)

**Maak OneSignal Helper bestand (`api/helpers/onesignal_helper.php`):**
```php
<?php
// OneSignal API helper
// https://documentation.onesignal.com/reference/create-notification

function sendOneSignalNotification($userId, $title, $message, $data = []) {
    $appId = '6cb000af-0fa3-4599-bae3-ab376c12bb36';
    $apiKey = 'YOUR_ONESIGNAL_REST_API_KEY_HERE'; // Vind deze in OneSignal Settings → Keys & IDs

    $url = 'https://onesignal.com/api/v1/notifications';

    $payload = [
        'app_id' => $appId,
        'headings' => ['en' => $title],
        'contents' => ['en' => $message],
        'include_external_user_ids' => [(string)$userId], // Modern: gebruik external user IDs
        'data' => $data,
        'web_url' => 'https://jouwdomein.nl/chat', // URL bij klikken
    ];

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json; charset=utf-8',
        'Authorization: Basic ' . $apiKey
    ]);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HEADER, false);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    error_log("OneSignal notification sent. HTTP Code: $httpCode, Response: $response");

    return $httpCode === 200;
}
```

**Gebruik in je send_message.php:**
```php
<?php
require_once __DIR__ . '/../../helpers/onesignal_helper.php';

// ... na het opslaan van het bericht in de database ...

// OneSignal voor push notification (werkt ook als app gesloten is!)
$notificationTitle = "Nieuw bericht van {$sender['name']}";
$notificationMessage = $message;
$notificationData = [
    'conversation_id' => $conversationId,
    'sender_id' => $userId,
    'message_id' => $messageId
];

error_log("Sending OneSignal notification to user: {$recipientId}");
sendOneSignalNotification($recipientId, $notificationTitle, $notificationMessage, $notificationData);
```

**Belangrijke notities:**
- **`include_external_user_ids`** is de moderne manier (aanbevolen). Dit werkt met `OneSignal.login(userId)` in de frontend.
- De oude methode gebruikte `filters` met tags, maar dat is minder betrouwbaar.
- Zorg dat je `OneSignal.login(userId.toString())` aanroept in de frontend om gebruikers te linken!

### 3. Frontend Nuxt Setup

**Installeer OneSignal SDK:**
```bash
npm install react-onesignal
```

**Nuxt Plugin (`plugins/onesignal.client.js`):**
```javascript
import OneSignal from 'react-onesignal';

export default defineNuxtPlugin(async () => {
  try {
    await OneSignal.init({
      appId: '6cb000af-0fa3-4599-bae3-ab376c12bb36',
      allowLocalhostAsSecureOrigin: true, // Voor local development
      notifyButton: {
        enable: false // Gebruik custom UI
      },
      promptOptions: {
        slidedown: {
          enabled: true,
          actionMessage: "We willen je graag op de hoogte houden van nieuwe berichten!",
          acceptButtonText: "Sta toe",
          cancelButtonText: "Niet nu"
        }
      }
    });

    console.log('✅ OneSignal initialized');

    // Controleer huidige permission status
    const isPushSupported = await OneSignal.isPushNotificationsSupported();
    const permission = await OneSignal.getNotificationPermission();

    console.log('Push supported:', isPushSupported);
    console.log('Permission:', permission);

  } catch (error) {
    console.error('❌ OneSignal initialization failed:', error);
  }
});
```

**Configuratie in `nuxt.config.ts`:**
```typescript
export default defineNuxtConfig({
  app: {
    head: {
      script: [
        {
          src: 'https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js',
          defer: true
        }
      ]
    }
  },
  runtimeConfig: {
    public: {
      oneSignalAppId: '6cb000af-0fa3-4599-bae3-ab376c12bb36'
    }
  }
});
```

**User tagging na login:**
```javascript
// In je login functie of onMounted
import OneSignal from 'react-onesignal';

async function setUserTag(userId) {
  try {
    await OneSignal.login(userId.toString());
    await OneSignal.User.addTag('user_id', userId.toString());
    console.log('✅ User tagged in OneSignal:', userId);
  } catch (error) {
    console.error('❌ Failed to tag user:', error);
  }
}

// Na succesvolle login
onMounted(() => {
  const userId = getCurrentUserId(); // Jouw functie om user ID op te halen
  if (userId) {
    setUserTag(userId);
  }
});
```

**Permission vragen:**
```vue
<template>
  <button @click="requestNotificationPermission">
    Sta notificaties toe
  </button>
</template>

<script setup>
import OneSignal from 'react-onesignal';

async function requestNotificationPermission() {
  try {
    const permission = await OneSignal.Notifications.requestPermission();

    if (permission) {
      console.log('✅ Notification permission granted');

      // Tag user
      const userId = getCurrentUserId();
      await OneSignal.login(userId.toString());
      await OneSignal.User.addTag('user_id', userId.toString());
    } else {
      console.log('❌ Notification permission denied');
    }
  } catch (error) {
    console.error('Error requesting permission:', error);
  }
}
</script>
```

---

## Backend Implementatie

### Complete send_message.php voorbeeld

```php
<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../../helpers/cors.php';
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../helpers/auth_helper.php';
require_once __DIR__ . '/../../helpers/pusher_helper.php';
require_once __DIR__ . '/../../helpers/onesignal_helper.php';

$user = requireAuth();
$pdo = getDbConnection();
$userId = $user['user_id'] ?? $user['id'];

$input = json_decode(file_get_contents('php://input'), true);

$conversationId = $input['conversation_id'] ?? null;
$message = $input['message'] ?? null;

if (!$conversationId || !$message) {
    http_response_code(400);
    echo json_encode(['error' => 'conversation_id en message zijn verplicht']);
    exit;
}

try {
    // Check toegang: controleer of gebruiker lid is van deze conversation
    $stmt = $pdo->prepare("
        SELECT * FROM conversation_participants
        WHERE conversation_id = ? AND user_id = ?
    ");
    $stmt->execute([$conversationId, $userId]);

    if (!$stmt->fetch()) {
        http_response_code(403);
        echo json_encode(['error' => 'Geen toegang tot deze conversatie']);
        exit;
    }

    // Voeg bericht toe aan database
    $stmt = $pdo->prepare("
        INSERT INTO chat_messages (conversation_id, sender_id, message)
        VALUES (?, ?, ?)
    ");
    $stmt->execute([$conversationId, $userId, $message]);

    $messageId = $pdo->lastInsertId();

    // Haal sender info op
    $stmt = $pdo->prepare("SELECT name, email FROM users WHERE id = ?");
    $stmt->execute([$userId]);
    $sender = $stmt->fetch();

    // Verstuur real-time update via Pusher
    $pusher = getPusher();

    $pusherData = [
        'id' => $messageId,
        'conversation_id' => $conversationId,
        'sender_id' => $userId,
        'sender_name' => $sender['name'],
        'sender_email' => $sender['email'],
        'message' => $message,
        'created_at' => date('Y-m-d H:i:s')
    ];

    error_log("Triggering Pusher event: private-conversation-{$conversationId}");

    // Trigger op conversation channel (voor real-time UI updates)
    $pusherResult = $pusher->trigger(
        'private-conversation-' . $conversationId,
        'new-message',
        $pusherData
    );

    error_log("Pusher trigger result: " . ($pusherResult ? 'success' : 'failed'));

    // Trigger ook op user-level channels voor notifications
    // Haal alle deelnemers op behalve de verzender
    $stmt = $pdo->prepare("
        SELECT user_id FROM conversation_participants
        WHERE conversation_id = ? AND user_id != ?
    ");
    $stmt->execute([$conversationId, $userId]);
    $recipients = $stmt->fetchAll(PDO::FETCH_COLUMN);

    // Trigger notification event voor elke ontvanger op hun persoonlijke channel
    foreach ($recipients as $recipientId) {
        // Pusher voor real-time in-app notification
        $userChannelName = "user-{$recipientId}";
        error_log("Triggering notification on channel: {$userChannelName}");
        $pusher->trigger(
            $userChannelName,
            'chat-message',
            $pusherData
        );

        // OneSignal voor push notification (werkt ook als app gesloten is!)
        $notificationTitle = "Nieuw bericht van {$sender['name']}";
        $notificationMessage = $message;
        $notificationData = [
            'conversation_id' => $conversationId,
            'sender_id' => $userId,
            'message_id' => $messageId
        ];

        error_log("Sending OneSignal notification to user: {$recipientId}");
        sendOneSignalNotification($recipientId, $notificationTitle, $notificationMessage, $notificationData);
    }

    echo json_encode([
        'success' => true,
        'message_id' => $messageId,
        'pusher_triggered' => $pusherResult
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
```

---

## Frontend Implementatie

### Complete Chat Component

```vue
<template>
  <div class="chat-page">
    <div class="chat-container">
      <!-- Sidebar -->
      <ChatSidebar
        :conversations="conversations"
        :selected-conv="selectedConv"
        :show-sidebar="showSidebar"
        @select-conversation="selectConversation"
        @show-new-chat-modal="showNewChatModal = true"
      />

      <!-- Main chat -->
      <div class="main-chat">
        <template v-if="selectedConv">
          <ChatHeader
            :conversation-name="getCurrentConversationName()"
            @toggle-sidebar="toggleSidebar"
          />

          <MessagesList
            ref="messagesListRef"
            :messages="messages"
            :current-user-id="currentUserId"
          />

          <ChatInput
            v-model="newMessage"
            :sending="sending"
            @send="sendMessage"
          />
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { usePusher } from '~/composables/usePusher';
import OneSignal from 'react-onesignal';

const config = useRuntimeConfig();
const apiBase = config.public.apiBaseUrl;

// State
const conversations = ref([]);
const messages = ref([]);
const selectedConv = ref(null);
const newMessage = ref('');
const currentUserId = ref(null);
const sending = ref(false);

// Pusher
const { subscribeToConversation, unsubscribeFromConversation } = usePusher();

// Functies
async function selectConversation(convId) {
  // Unsubscribe van oude conversation
  if (selectedConv.value) {
    unsubscribeFromConversation(selectedConv.value);
  }

  selectedConv.value = convId;

  // Laad messages
  await fetchMessages(convId);

  // Subscribe naar nieuwe conversation
  subscribeToConversation(convId, (data) => {
    // Check of bericht van andere gebruiker is
    if (data.sender_id !== currentUserId.value) {
      messages.value.push(data);
      scrollToBottom();

      // Update conversation last_message
      const conv = conversations.value.find(c => c.id === convId);
      if (conv) {
        conv.last_message = data.message;
        conv.last_message_time = data.created_at;
      }
    }
  });
}

async function sendMessage() {
  if (!newMessage.value.trim() || sending.value) return;

  sending.value = true;

  try {
    const response = await $fetch(`${apiBase}/send_message.php`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify({
        conversation_id: selectedConv.value,
        message: newMessage.value
      })
    });

    // Voeg bericht lokaal toe (optimistic update)
    messages.value.push({
      id: response.message_id,
      conversation_id: selectedConv.value,
      sender_id: currentUserId.value,
      message: newMessage.value,
      created_at: new Date().toISOString()
    });

    newMessage.value = '';
    scrollToBottom();

  } catch (error) {
    console.error('Failed to send message:', error);
    alert('Kon bericht niet versturen');
  } finally {
    sending.value = false;
  }
}

// OneSignal setup
onMounted(async () => {
  // Haal current user ID op
  currentUserId.value = await getCurrentUserId();

  // Tag user in OneSignal
  try {
    await OneSignal.login(currentUserId.value.toString());
    await OneSignal.User.addTag('user_id', currentUserId.value.toString());
    console.log('✅ OneSignal user tagged');
  } catch (error) {
    console.error('OneSignal tagging failed:', error);
  }

  // Vraag notification permission
  const permission = await OneSignal.Notifications.getPermission();
  if (permission === 'default') {
    // Toon custom prompt
    showNotificationPrompt.value = true;
  }
});

// Cleanup
onUnmounted(() => {
  if (selectedConv.value) {
    unsubscribeFromConversation(selectedConv.value);
  }
});
</script>
```

---

## Testing & Debugging

### Pusher Testing

**1. Pusher Debug Console:**
- Ga naar [dashboard.pusher.com](https://dashboard.pusher.com)
- Selecteer je app
- Ga naar "Debug Console"
- Zie realtime events binnenkomen

**2. Browser Console:**
```javascript
// Enable Pusher logging
Pusher.logToConsole = true;

// Check active channels
pusher.allChannels(); // Array van active channels

// Manually trigger event (voor testing)
pusher.trigger('conversation-1', 'new-message', {
  message: 'Test message'
});
```

**3. Test Events:**
```bash
# Via Pusher Debug Console of curl
curl -X POST "https://api-eu.pusher.com/apps/1907746/events" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "new-message",
    "channel": "conversation-1",
    "data": "{\"message\":\"Test\"}"
  }'
```

### OneSignal Testing

**1. OneSignal Dashboard:**
- Ga naar [dashboard.onesignal.com](https://dashboard.onesignal.com)
- Selecteer je app
- Ga naar "Audience" → "All Users"
- Check of gebruiker getagd is met `user_id`

**2. Test Notification versturen:**
- Ga naar "Messages" → "New Push"
- Selecteer "Send to Particular Segment"
- Kies je test gebruiker
- Verstuur test notification

**3. Browser Console:**
```javascript
// Check OneSignal status
OneSignal.isPushNotificationsEnabled(); // true/false

// Check permission
OneSignal.getNotificationPermission(); // 'granted', 'denied', 'default'

// Check user ID
OneSignal.getUserId(); // OneSignal player ID

// Check tags
OneSignal.getTags((tags) => {
  console.log('Tags:', tags);
});

// Manually send test notification
OneSignal.showSlidedownPrompt();
```

**4. Verify Web Push Setup:**
```javascript
// Check if service worker registered
navigator.serviceWorker.getRegistrations().then(registrations => {
  console.log('Service Workers:', registrations);
});

// Check notification permission
console.log('Notification permission:', Notification.permission);
```

### Common Issues & Fixes

**Pusher niet verbinden:**
```javascript
// Check cluster correct is
const pusher = new Pusher('KEY', {
  cluster: 'eu',  // ✅ Correct
  encrypted: true
});

// Not:
cluster: 'us'     // ❌ Verkeerd cluster
```

**OneSignal notifications niet werken:**
1. Check HTTPS (required voor production)
2. Check if app is focused - notifications komen alleen als app in background is
3. Check tags in OneSignal dashboard
4. Check browser console voor errors

**Service Worker conflicts:**
```javascript
// OneSignal gebruikt eigen service worker
// Zorg dat je geen conflicterende SW hebt
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    // Should see OneSignalSDKWorker.js
    console.log(registrations);
  });
}
```

---

## Productie Checklist

### Voor deployment:

**Pusher:**
- [ ] Pusher credentials in environment variables gezet
- [ ] Cluster correct ingesteld (`eu`)
- [ ] SSL/TLS enabled (`useTLS: true`)
- [ ] Debug logging uit in productie (`Pusher.logToConsole = false`)

**OneSignal:**
- [ ] OneSignal App ID in environment variables
- [ ] Site URL correct ingesteld in OneSignal dashboard
- [ ] HTTPS enabled (required!)
- [ ] Notification icon geüpload (256x256 PNG)
- [ ] Safari Web Push ID ingesteld (voor Safari support)
- [ ] Auto-resubscribe enabled in OneSignal settings

**Testing:**
- [ ] Test realtime messaging tussen 2 browsers
- [ ] Test push notifications wanneer app gesloten is
- [ ] Test op mobile devices (iOS Safari, Android Chrome)
- [ ] Test notification delivery met user tags

---

## Kosten Overzicht

### Pusher Free Tier:
- **100 connecties** tegelijk
- **200,000 berichten** per dag
- Unlimited channels
- SSL inbegrepen

**Wanneer upgraden?**
- Meer dan 100 gelijktijdige gebruikers
- Meer dan 200k berichten/dag

### OneSignal Free Tier:
- **Unlimited push notifications**
- Unlimited subscribers
- Alle features inbegrepen

**Upgraden:**
- Niet nodig voor meeste apps!

---

## Nuttige Links

**Pusher:**
- Dashboard: https://dashboard.pusher.com
- Documentatie: https://pusher.com/docs/channels
- PHP SDK: https://github.com/pusher/pusher-http-php
- JS SDK: https://github.com/pusher/pusher-js

**OneSignal:**
- Dashboard: https://dashboard.onesignal.com
- Documentatie: https://documentation.onesignal.com
- Web Push Setup: https://documentation.onesignal.com/docs/web-push-quickstart
- REST API: https://documentation.onesignal.com/reference/create-notification

---

## Auteur

Documentatie gemaakt voor toekomstige projecten.
Laatste update: 2025
