import { appState } from "./appState";
import { createApp, watch } from "vue";
import App from "./App.vue";
import "./assets/main.css";
import { registerSW } from "virtual:pwa-register";
import { notifyError, notifyToast } from "./components/Notify/notifyState";
import { cloneExtend } from "./lib/utils";

const updateNow = () => {
  notifyToast("update now #1");
  if (!appState.value.updateApproved) return;
  notifyToast("update now and approved");
  appState.value = cloneExtend(appState.value, {
    updateApproved: false,
    updateAvailable: false,
  });
  updateSW();
  document.location = document.location.href;
};

watch(() => appState.value.updateApproved, updateNow);

const updateSW = registerSW({
  immediate: false,
  onNeedRefresh() {
    notifyToast("update available");
    appState.value.updateAvailable = true;
  },
  onOfflineReady() {
    notifyToast("on offline ready");
  },
  onRegisteredSW(swScriptUrl: string, registration: ServiceWorkerRegistration | undefined) {
    notifyToast(swScriptUrl);
    registration &&
      setInterval(() => {
        appState.value.checkCount++;
        registration.update();
        notifyToast("check for update");
      }, 15000);
  },
  onRegisterError(error: any) {
    notifyError("onRegisterError " + JSON.stringify(error));
  },
});

const app = createApp(App);
app.mount("#app");
