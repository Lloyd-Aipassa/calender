// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  ssr: false,
  css: [
    '~/assets/css/main.css'
  ],
  app: {
    head: {
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1.0, viewport-fit=cover, user-scalable=no' },
        { name: 'theme-color', content: '#fa0101' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' }
      ],
      link: [
        { rel: 'manifest', href: '/manifest.json' }
      ],
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
      apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL,
      oneSignalAppId: '6cb000af-0fa3-4599-bae3-ab376c12bb36'
    }
  },
});
