import { createApp } from "vue";
import App from "./App.vue";
import vue3GoogleLogin from "vue3-google-login";
import "./assets/main.css";

const app = createApp(App);
app.use(vue3GoogleLogin, {
  clientId: "750379347440-mp8am6q8hg41lvkn8pi4jku3eq7ts2lq.apps.googleusercontent.com",
});
app.mount("#app");
