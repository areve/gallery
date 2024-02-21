<template>
  <div class="menu">
    <div :hidden="googleAuthState.state == 'signedIn'">
      <button type="button" @click="signIn">Sign In</button>
    </div>
    <div :hidden="googleAuthState.state == 'signedOut'">
      <GalleryPanel />
      <ArtboardResetPanel />
      <ArtAppDebugButtonsPanel />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { signIn } from "@/lib/Google/GoogleAuth";
import { googleAuthState } from "@/lib/Google/googleAuthState";
import GalleryPanel from "@/components/Gallery/GalleryPanel.vue";
import ArtboardResetPanel from "@/components/Artboard/ArtboardResetPanel.vue";
import ArtAppDebugButtonsPanel from "./ArtAppDebugButtonsPanel.vue";
</script>

<style scoped>
.menu {
  height: 100%;
  overflow-y: auto;
}

/* width */
::-webkit-scrollbar {
  width: 0.3em;
}

/* Track */
::-webkit-scrollbar-track {
  background: #000;
}

/* Handle */
::-webkit-scrollbar-thumb {
  background: #999;
  border-radius: 0.3em;
}

/* Handle on hover */
::-webkit-scrollbar-thumb:hover {
  background: #ccc;
}
</style>
