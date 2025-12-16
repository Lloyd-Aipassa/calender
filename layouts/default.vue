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
    };
  }

  // Get current user from auth token
  const token = localStorage.getItem('authToken');

  if (!token) {
    return;
  }

  if (token) {
    try {
      // Fetch user info to get user ID
      const response = await fetch(`${apiBase}/get_user_info.php`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();

        if (data.success && data.user) {
          const result = await initPusher(data.user.id, apiBase);

          // Link user to OneSignal for push notifications
          await linkUserToOneSignal(data.user.id);
        } else {
        }
      } else {
      }
    } catch (error) {}
  }
});

useHead({
  link: [
    { rel: 'manifest', href: '/manifest.json' },
    { rel: 'apple-touch-icon', sizes: '192x192', href: '/icon-192.png' },
    { rel: 'apple-touch-icon', sizes: '512x512', href: '/icon-512.png' },
  ],
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1.0, viewport-fit=cover' },
    { name: 'apple-mobile-web-app-capable', content: 'yes' },
    { name: 'apple-mobile-web-app-status-bar-style', content: 'default' },
    { name: 'apple-mobile-web-app-title', content: 'Calendar' },
    { name: 'theme-color', content: '#4caf50' },
  ],
});
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

:root {
  /* Warm Modern Color Palette */
  --color-bg-primary: #faf9f7;
  --color-bg-secondary: #f5f3f0;
  --color-bg-tertiary: #ebe8e4;
  --color-surface: #ffffff;
  --color-surface-elevated: rgba(255, 255, 255, 0.85);

  /* Text Colors */
  --color-text-primary: #1a1614;
  --color-text-secondary: #5c5552;
  --color-text-tertiary: #8a8582;
  --color-text-muted: #b5b0ab;

  /* Accent Colors - Warm Coral/Terracotta */
  --color-accent: #e07a5f;
  --color-accent-hover: #d4644a;
  --color-accent-light: #fef0ed;
  --color-accent-subtle: rgba(224, 122, 95, 0.12);

  /* Secondary Accent - Sage Green */
  --color-secondary: #81a88d;
  --color-secondary-light: #e8f0ea;

  /* Shadows */
  --shadow-xs: 0 1px 2px rgba(26, 22, 20, 0.04);
  --shadow-sm: 0 2px 8px rgba(26, 22, 20, 0.06), 0 1px 2px rgba(26, 22, 20, 0.04);
  --shadow-md: 0 4px 16px rgba(26, 22, 20, 0.08), 0 2px 4px rgba(26, 22, 20, 0.04);
  --shadow-lg: 0 8px 32px rgba(26, 22, 20, 0.1), 0 4px 8px rgba(26, 22, 20, 0.06);
  --shadow-glow: 0 0 0 3px var(--color-accent-subtle);

  /* Borders */
  --border-color: rgba(26, 22, 20, 0.08);
  --border-color-strong: rgba(26, 22, 20, 0.12);

  /* Spacing */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 24px;

  /* Transitions */
  --transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-base: 250ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-slow: 350ms cubic-bezier(0.4, 0, 0.2, 1);

  padding-top: env(safe-area-inset-top);
}

* {
  box-sizing: border-box;
}

html,
body {
  margin: 0;
  padding: 0;
  font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background: var(--color-bg-primary);
  background-image: radial-gradient(ellipse at 0% 0%, rgba(224, 122, 95, 0.05) 0%, transparent 50%),
    radial-gradient(ellipse at 100% 100%, rgba(129, 168, 141, 0.05) 0%, transparent 50%);
  overflow: hidden;
  position: fixed;
  width: 100%;
  height: 100%;
  color: var(--color-text-primary);
  font-size: 15px;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.app-layout {
  width: 100%;
  height: 100vh;
  height: 100dvh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.content-spacer {
  display: none;
}

.main-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
}

/* Scrollbar Styling */
.main-content::-webkit-scrollbar {
  width: 8px;
}

.main-content::-webkit-scrollbar-track {
  background: transparent;
}

.main-content::-webkit-scrollbar-thumb {
  background: var(--color-text-muted);
  border-radius: 4px;
}

.main-content::-webkit-scrollbar-thumb:hover {
  background: var(--color-text-tertiary);
}

/* Mobile bottom navigation */
@media (max-width: 768px) {
  .app-layout {
    padding-bottom: calc(64px + env(safe-area-inset-bottom, 0px));
    background-color: var(--color-bg-primary);
  }

  .main-content {
    background-color: transparent;
  }
}

/* PWA Standalone Mode Styling */
@media all and (display-mode: standalone) {
  .app-layout {
    padding-top: env(safe-area-inset-top, 0px);
  }

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
    padding-bottom: calc(100px + env(safe-area-inset-bottom));
  }
}

/* Global Selection Styles */
::selection {
  background: var(--color-accent-light);
  color: var(--color-accent);
}

/* Focus Styles */
:focus-visible {
  outline: none;
  box-shadow: var(--shadow-glow);
}
</style>
