<script setup lang="ts">
import { appState } from "./appState";
import { watch } from "vue";
import { registerSW } from "virtual:pwa-register";
import { notifyError, notifyToast } from "./components/Notify/notifyState";
import ArtApp from "@/components/ArtApp/ArtApp.vue";

watch(
  () => appState.value.updateApproved,
  () => {
    if (!appState.value.updateApproved) return;
    updateSW(true);
  },
);

const updateSW = registerSW({
  onNeedRefresh() {
    notifyToast("update available");
    appState.value.updateAvailable = true;
  },
  onOfflineReady() {
    notifyToast("offline ready");
  },
  onRegisteredSW(swScriptUrl: string, registration: ServiceWorkerRegistration | undefined) {
    console.log("register service worker", swScriptUrl);
    registration &&
      setInterval(() => {
        console.log("check for update");
        registration.update();
      }, 15000);
  },
  onRegisterError(error: any) {
    notifyError("error " + JSON.stringify(error));
  },
});
</script>

<template>
  <div class="app-wrapper">
    <ArtApp />
  </div>
</template>

<style>
*[hidden] {
  display: none !important;
}

.app-wrapper {
  height: 100%;
  display: flex;
  flex-direction: row;
  touch-action: none;
}
</style>
