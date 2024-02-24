import { createApp } from "vue";
import App from "./App.vue";
import "./assets/main.css";
import { registerSW } from "virtual:pwa-register";
import { progressError, progressMessage, progressToast } from "./components/Progress/progressState";

const intervalMS = 10 * 1000;

const updateSW = registerSW({
  immediate: true,

  onNeedRefresh() {
    console.log("onNeedRefresh");
    progressToast("onNeedRefresh");
    if (confirm("update now?")) {
      updateSW();
    }
  },
  onOfflineReady() {
    console.log("onOfflineReady");
    progressToast("onOfflineReady");
  },
  onRegisteredSW(swScriptUrl: string, registration: ServiceWorkerRegistration | undefined) {
    registration &&
      setInterval(() => {
        console.log("checking for update");
        progressToast("checking for update");
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
