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

    <div :hidden="googleAuthState.state == 'signedIn'">
      <button type="button" @click="signIn">Sign In</button>
    </div>
    <div :hidden="googleAuthState.state == 'signedOut'">
      <input v-model="artAppState.fileName" />
      <button type="button" @click="save">Save</button>
      <button type="button" @click="load">Load</button>

      <div :hidden="!showDebugButtons">
        <hr />
        debug buttons
        <button type="button" @click="signOut">Sign out</button>
        <button type="button" @click="refreshTokens">Refresh tokens</button>
        <button type="button" @click="toggleFps">Toggle FPS</button>
      </div>
      <button type="button" @click="toggleDebug">{{ showDebugButtons ? "Hide" : "Show" }} debug</button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { asBlob, resetCanvas } from "../Artboard/artboardService";
import { artboardState } from "../Artboard/artboardState";
import { signIn, signOut, refreshTokens } from "@/lib/Google/GoogleAuth";
import { ref } from "vue";
import type { Coord } from "@/lib/Coord";
import { clone } from "@/lib/utils";
import { artAppState } from "./artAppState";
import { getAvailableSize } from "@/lib/Window";
import { load as galleryLoad, save as gallerySave } from "@/components/Gallery/galleryService";
import { googleAuthState } from "@/lib/Google/googleAuthState";
import { progressMessage } from "../Progress/progressState";

const resetColor = ref<string>("#ffffff");
const resetDimensions = ref<Coord>(getAvailableSize());
const showDebugButtons = ref<boolean>(false);

const resetToColor = () => resetCanvas(clone(resetDimensions.value), resetColor.value);
const resetToTransparent = () => resetCanvas(clone(resetDimensions.value), "transparent");
const sizeFromAvailable = () => (resetDimensions.value = getAvailableSize());

const toggleFps = () => (artAppState.value.showFps = !artAppState.value.showFps);
const toggleDebug = () => (showDebugButtons.value = !showDebugButtons.value);

const load = async () => {
  progressMessage("requesting load", 5);
  await galleryLoad({
    name: artAppState.value.fileName,
    path: "/v2",
  });
};

const save = async () => {
  // TODO if it exists indicate it when I choose the name
  // TODO add a way to browse images
  progressMessage("converting canvas to blob", 6);
  const blob = await asBlob();

  progressMessage("saving blob");
  await gallerySave({
    blob,
    name: artAppState.value.fileName,
    path: "/v2",
  });
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
