<template>
  <div class="menu">
    <div class="reset-dimensions">
      <div>color and dimensions</div>
      <input type="color" v-model="resetColor" />
      <input type="number" v-model="resetDimensions.x" class="dimension" min="1" max="5120" />
      x
      <input type="number" v-model="resetDimensions.y" class="dimension" min="1" max="5120" />
    </div>
    <div>
      <button type="button" @click="sizeFromAvailable">Size from available</button>
      <button type="button" @click="resetToColor">Reset to colour</button>
      <button type="button" @click="resetToTransparent">Reset to transparent</button>
    </div>

    <div>
      <strong>Color space</strong>
      <label>
        <input type="radio" name="colorSpace" value="srgb" v-model="artboardState.colorSpace" />
        srgb
      </label>
      <label>
        <input type="radio" name="colorSpace" value="oklch" v-model="artboardState.colorSpace" />
        oklch
      </label>
    </div>

    <div v-if="googleAuthState.state == 'signedOut'">
      <button type="button" @click="signIn">Sign In</button>
    </div>
    <div v-if="googleAuthState.state == 'signedIn'">
      <input v-model="artAppState.fileName" />
      <button type="button" @click="save">Save</button>
      <button type="button" @click="load">Load</button>
      <hr />
      advanced buttons
      <button type="button" @click="signOut">Sign out</button>
      <button type="button" @click="refreshTokens">Refresh tokens</button>
      <button type="button" @click="toggleFps">Toggle FPS</button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { asBlob, loadBlob, resetCanvas } from "../Artboard/artboardService";
import { artboardState } from "../Artboard/artboardState";
import { googleAuthState, signIn as googleSignIn, signOut as googleSignOut, refreshTokens } from "@/lib/Google/GoogleAuth";
import { readFile, writeFile } from "@/lib/FileStorage";
import { ref } from "vue";
import type { Coord } from "@/lib/Coord";
import { clone } from "@/lib/utils";
import { artAppState } from "./artAppState";
import { getAvailableSize } from "@/lib/Window";

const resetColor = ref<string>("#ffffff");
const resetDimensions = ref<Coord>(getAvailableSize());

const resetToColor = () => resetCanvas(clone(resetDimensions.value), resetColor.value);
const resetToTransparent = () => resetCanvas(clone(resetDimensions.value), "transparent");
const sizeFromAvailable = () => (resetDimensions.value = getAvailableSize());

const signIn = async () => {
  googleSignIn();
};

const signOut = async () => {
  googleSignOut();
};

const toggleFps = () => (artAppState.value.showFps = !artAppState.value.showFps);

const rootDirName = "gallery.challen.info/v2"; // TODO hard coded folder name?

const save = async () => {
  const blob = await asBlob();
  // TODO if it exists indicate it when I choose the name
  // TODO if it fails notify the user
  // TODO add a way to browse images
  await writeFile(rootDirName + "/" + artAppState.value.fileName, blob);
};

const load = async () => {
  // TODO if it fails notify the user
  const blob = await readFile(rootDirName + "/" + artAppState.value.fileName);
  if (blob) await loadBlob(blob);
};
</script>

<style scoped>
button {
  border-radius: 0;
  margin: 0;
  display: block;
  width: 100%;
  color: #fff;
  background-color: #666;
}

.dimension {
  width: 4em;
}
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
