<script setup lang="ts">
import { appState } from "./appState";
import { watch } from "vue";
import { registerSW } from "virtual:pwa-register";
import { notifyError, notifyToast } from "./components/Notify/notifyState";
import { cloneExtend } from "./lib/utils";
import ArtApp from "@/components/ArtApp/ArtApp.vue";

const updateNow = () => {
  notifyToast("update now");
  if (!appState.value.updateApproved) return;
  notifyToast("update now and approved");
  appState.value = cloneExtend(appState.value, {
    updateApproved: false,
    updateAvailable: false,
  });
  updateSW(true);
};

watch(() => appState.value.updateApproved, updateNow);

const updateSW = registerSW({
  immediate: false,
  onNeedRefresh() {
    notifyToast("update available");
    appState.value.updateAvailable = true;
  },
  onOfflineReady() {
    notifyToast("on offline ready");
  },
  onRegisteredSW(swScriptUrl: string, registration: ServiceWorkerRegistration | undefined) {
    notifyToast(swScriptUrl);
    registration &&
      setInterval(() => {
        appState.value.checkCount++;
        notifyToast("check for update #31");
        registration.update();
      }, 15000);
  },
  onRegisterError(error: any) {
    notifyError("onRegisterError " + JSON.stringify(error));
  },
});
</script>

<template>
  <div class="app-wrapper">
    <ArtApp />
  </div>
  <ReloadPrompt />
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
