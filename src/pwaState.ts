import { ref } from "vue";

export const pwaState = ref({
  updateAvailable: false,
  updateApproved: false,
  checkCount: 0,
  appVersion: __APP_VERSION__,
});
