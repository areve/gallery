<template>
  <aside class="right-menu">
    <div class="menu">
      <div :hidden="googleAuthState.state == 'signedIn'">
        <button type="button" @click="signIn">Sign In</button>
      </div>
      <div :hidden="googleAuthState.state == 'signedOut'">
        <GalleryPanel />
      </div>
    </div>
  </aside>
</template>

<script lang="ts" setup>
import { signIn } from "@/lib/Google/GoogleAuth";
import { googleAuthState } from "@/lib/Google/googleAuthState";
import GalleryPanel from "@/components/Gallery/GalleryPanel.vue";
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

.right-menu {
  position: fixed;
  width: 20%;
  height: 100%;
  background-color: rgb(127, 127, 127, 0.95);
  z-index: 50;
  transition: 0.2s ease-in-out;
  transition-property: opacity, left, right;
  overflow: hidden;
  box-shadow: 0em 0em 0.5em rgb(0, 0, 0, 0.8);
}

.right-menu[hidden] {
  right: -45%;
  opacity: 0;
  display: block !important;
}

.right-menu {
  right: 0;
  opacity: 1;
  width: 45%;
}
</style>
