import { appState } from "./appState";
import { createApp, watch } from "vue";
import App from "./App.vue";
import "./assets/main.css";
import { registerSW } from "virtual:pwa-register";
import { progressError, progressToast } from "./components/Notify/notifyState";
import { cloneExtend } from "./lib/utils";

function updateNow() {
  progressToast("updateNow try");
  if (!appState.value.updateApproved) return;
  progressToast("updateNow ok");
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
    console.log("update available");
    progressToast("update available");
    appState.value.updateAvailable = true;
  },
  onOfflineReady() {
    console.log("onOfflineReady");
    progressToast("onOfflineReady");
  },
  onRegisteredSW(swScriptUrl: string, registration: ServiceWorkerRegistration | undefined) {
    registration &&
      setInterval(() => {
        appState.value.checkCount++;
        registration.update();
      }, 15000);
    console.log("onRegisteredSW", swScriptUrl, registration);
    progressToast("onRegisteredSW " + JSON.stringify({ swScriptUrl, registration }));
  },
  onRegisterError(error: any) {
    console.error("onRegisterError", error);
    progressError("onRegisterError " + JSON.stringify(error));
  },
});

const app = createApp(App);
app.mount("#app");
