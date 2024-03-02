import { appState } from "./appState";
import { createApp, watch } from "vue";
import App from "./App.vue";
import "./assets/main.css";
import { registerSW } from "virtual:pwa-register";
import { notifyError, notifyToast } from "./components/Notify/notifyState";
import { cloneExtend } from "./lib/utils";

// const updateNow = () => {
//   notifyToast("update now");
//   if (!appState.value.updateApproved) return;
//   notifyToast("update now and approved");
//   appState.value = cloneExtend(appState.value, {
//     updateApproved: false,
//     updateAvailable: false,
//   });
//   updateSW(true);
// };

// watch(() => appState.value.updateApproved, updateNow);

// const updateSW = registerSW({
//   immediate: false,
//   onNeedRefresh() {
//     notifyToast("update available");
//     appState.value.updateAvailable = true;
//   },
//   onOfflineReady() {
//     notifyToast("on offline ready");
//   },
//   onRegisteredSW(swScriptUrl: string, registration: ServiceWorkerRegistration | undefined) {
//     notifyToast(swScriptUrl);
//     registration &&
//       setInterval(() => {
//         appState.value.checkCount++;
//         notifyToast("check for update #11");
//         registration.update();
//       }, 15000);
//   },
//   onRegisterError(error: any) {
//     notifyError("onRegisterError " + JSON.stringify(error));
//   },
// });

import { useRegisterSW } from "virtual:pwa-register/vue";

const intervalMS = 15 * 1000;

const updateServiceWorker = useRegisterSW({
  onRegistered(r) {
    r &&
      setInterval(() => {
        notifyToast("check for update #13");
        r.update();
      }, intervalMS);
  },
});
const app = createApp(App);
app.mount("#app");
