
import { useRegisterSW } from "virtual:pwa-register/vue";

const intervalMS = 15 * 1000;

const updateServiceWorker = useRegisterSW({
  onRegistered(r) {
    r &&
      setInterval(() => {
        // TODO or perhaps code should not be in main.ts?
        console.log("check for update #18");
        r.update();
      }, intervalMS);
  },
});

