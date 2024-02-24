import { ref } from "vue";

export const appState = ref({
  updateAvailable: false,
  updateApproved: false,
  checkCount: 0,
  appVersion: __APP_VERSION__,
});
