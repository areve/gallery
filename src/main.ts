import { appState } from "./appState";
import { createApp, watch } from "vue";
import App from "./App.vue";
import "./assets/main.css";
import { registerSW } from "virtual:pwa-register";
import { notifyError, notifyToast } from "./components/Notify/notifyState";
import { cloneExtend } from "./lib/utils";

function updateNow() {
  notifyToast("updateNow try");
  if (!appState.value.updateApproved) return;
  notifyToast("updateNow ok");
  appState.value = cloneExtend(appState.value, {
    updateApproved: false,
    updateAvailable: false,
  });
  updateSW();
}

watch(() => appState.value.updateApproved, updateNow);

const updateSW = registerSW({
  immediate: true,
  onNeedRefresh() {
    notifyToast("update available");
    appState.value.updateAvailable = true;
  },
  onOfflineReady() {
    notifyToast("onOfflineReady");
  },
  onRegisteredSW(swScriptUrl: string, registration: ServiceWorkerRegistration | undefined) {
    registration &&
      setInterval(() => {
        appState.value.checkCount++;
        registration.update();
      }, 15000);
  },
  onRegisterError(error: any) {
    notifyError("onRegisterError " + JSON.stringify(error));
  },
});

const app = createApp(App);
app.mount("#app");
