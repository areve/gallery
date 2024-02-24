import { pwaState } from "./pwaState";
import { createApp } from "vue";
import App from "./App.vue";
import "./assets/main.css";
import { registerSW } from "virtual:pwa-register";
import { progressError, progressToast } from "./components/Progress/progressState";
import { cloneExtend } from "./lib/utils";

const intervalMS = 5 * 1000;

function updateNow() {
  if (!pwaState.value.updateApproved) return;
  pwaState.value = cloneExtend(pwaState.value, {
    updateApproved: false,
    updateAvailable: false,
  });
  updateSW();
}

const updateSW = registerSW({
  immediate: true,

  onNeedRefresh() {
    console.log("onNeedRefresh");
    progressToast("onNeedRefresh");
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

        console.log("checking for update v" + pwaState.value.appVersion);
        progressToast("checking for update v" + pwaState.value.appVersion);
        updateNow();
        registration.update();
      }, intervalMS);
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
