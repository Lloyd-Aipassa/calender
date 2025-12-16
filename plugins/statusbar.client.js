import { StatusBar, Style } from '@capacitor/status-bar';

export default defineNuxtPlugin(() => {
  StatusBar.setStyle({ style: Style.Dark });
});
