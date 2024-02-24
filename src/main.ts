import { pwaState } from "./pwaState";
import { createApp, watch } from "vue";
import App from "./App.vue";
import "./assets/main.css";
import { registerSW } from "virtual:pwa-register";
import { progressError, progressToast } from "./components/Progress/progressState";
import { cloneExtend } from "./lib/utils";

function updateNow() {
  if (!pwaState.value.updateApproved) return;
  pwaState.value = cloneExtend(pwaState.value, {
    updateApproved: false,
    updateAvailable: false,
  });
  updateSW();
}

watch(pwaState, updateNow);

const updateSW = registerSW({
  immediate: true,
  onNeedRefresh() {
    console.log("update available");
    progressToast("update available");
    pwaState.value.updateAvailable = true;
  },
  onOfflineReady() {
    console.log("onOfflineReady");
    progressToast("onOfflineReady");
  },
  onRegisteredSW(swScriptUrl: string, registration: ServiceWorkerRegistration | undefined) {
    registration &&
      setInterval(() => {
        pwaState.value.checkCount++;
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
