<template>
  <div class="app-layout">
    <NavigationHeader />
    <div class="content-spacer"></div>
    <main class="main-content">
      <slot />
    </main>
  </div>
</template>

<script setup>
import { usePusher } from '~/composables/usePusher';
import { useOneSignal } from '~/composables/useOneSignal';

const config = useRuntimeConfig();
const apiBase = config.public.apiBaseUrl;

// Initialize global Pusher service
const { initPusher } = usePusher();
const { linkUserToOneSignal } = useOneSignal();

onMounted(async () => {
  // Auto-enable Eruda if it was enabled in settings
  if (localStorage.getItem('debugEnabled') === 'true') {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/eruda';
    document.body.appendChild(script);
    script.onload = () => {
      window.eruda.init();
      console.log('✅ Eruda debug console auto-enabled from localStorage!');
    };
  }
  console.log('🚀 default.vue mounted - starting initialization');

  // Get current user from auth token
  const token = localStorage.getItem('authToken');
  console.log('🔑 Auth token found:', !!token);

  if (!token) {
    console.error('❌ No auth token - cannot initialize Pusher');
    return;
  }

  if (token) {
    try {
      console.log('📡 Fetching user info from:', `${apiBase}/get_user_info.php`);

      // Fetch user info to get user ID
      const response = await fetch(`${apiBase}/get_user_info.php`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('📡 User info response status:', response.status, response.ok);

      if (response.ok) {
        const data = await response.json();
        console.log('📡 User info data:', data);

        if (data.success && data.user) {
          console.log('🌍 Initializing global Pusher service for user:', data.user.id);
          const result = await initPusher(data.user.id, apiBase);
          console.log('🌍 Pusher init result:', result);

          // Link user to OneSignal for push notifications
          console.log('🔔 Linking user to OneSignal...');
          await linkUserToOneSignal(data.user.id);
        } else {
          console.error('❌ User info response invalid:', data);
        }
      } else {
        console.error('❌ User info fetch failed:', response.status);
      }
    } catch (error) {
      console.error('❌ Failed to initialize global Pusher:', error);
      console.error('Error stack:', error.stack);
    }
  }
});

useHead({
  link: [
    { rel: 'manifest', href: '/manifest.json' },
    { rel: 'apple-touch-icon', sizes: '192x192', href: '/icon-192.png' },
    { rel: 'apple-touch-icon', sizes: '512x512', href: '/icon-512.png' }
  ],
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1.0, viewport-fit=cover' },
    { name: 'apple-mobile-web-app-capable', content: 'yes' },
    { name: 'apple-mobile-web-app-status-bar-style', content: 'default' },
    { name: 'apple-mobile-web-app-title', content: 'Calendar' },
    { name: 'theme-color', content: '#4caf50' }
  ]
});
</script>

<style>
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background: #f5f5f5;
}

.app-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.content-spacer {
  display: none;
}

.main-content {
  flex: 1;
}

/* Mobile bottom navigation */
@media (max-width: 768px) {
  .main-content {
    padding-bottom: 80px;
  }
}

/* PWA Standalone Mode Styling */
@media all and (display-mode: standalone) {
  .nav-header {
    position: fixed !important;
    top: 0;
    left: 0;
    right: 0;
    padding-top: env(safe-area-inset-top);
    z-index: 1000;
  }

  .content-spacer {
    display: block;
    height: calc(64px + env(safe-area-inset-top));
  }

  .main-content {
    padding-bottom: env(safe-area-inset-bottom);
  }
}

@media all and (display-mode: standalone) and (max-width: 768px) {
  .main-content {
    padding-bottom: calc(80px + env(safe-area-inset-bottom));
  }
}
</style>
