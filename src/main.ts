import { createApp } from "vue";
import App from "./App.vue";
import "./assets/main.css";
import { registerSW } from "virtual:pwa-register";

registerSW({
  immediate: true,
  onNeedRefresh() {
    console.log("onNeedRefresh");
  },
  onOfflineReady() {
    console.log("onOfflineReady");
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
