import { createApp } from "vue";
import App from "./App.vue";
import "./assets/main.css";
import { registerSW } from "virtual:pwa-register";
import { progressError } from "./components/Progress/progressState";

registerSW({
  immediate: true,
  onNeedRefresh() {
    console.log("onNeedRefresh");
    // TODO see https://vite-pwa-org.netlify.app/frameworks/
    progressError("onNeedRefresh does not work yet");
  },
  onOfflineReady() {
    console.log("onOfflineReady");
    progressError("onOfflineReady does not work yet");
  },
  onRegisteredSW() {
    console.log("onRegisteredSW");
  },
  onRegisterError() {
    console.log("onRegisterError");
  },
});

const app = createApp(App);
app.mount("#app");
