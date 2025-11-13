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
</style>
