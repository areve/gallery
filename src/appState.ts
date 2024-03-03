import { ref } from "vue";

export const appState = ref({
  updateAvailable: false,
  updateApproved: false,
  appVersion: __APP_VERSION__,
});
