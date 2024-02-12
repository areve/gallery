<template>
  <button type="button" @click="resetWhite">Reset</button>
  <button type="button" @click="resetOrange">Reset orange</button>
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

  <div v-if="authState.state == 'signedOut'">
    <button type="button" @click="signIn">Sign In</button>
  </div>
  <div v-if="authState.state == 'signedIn'">
    <button type="button" @click="save">Save</button>
    <button type="button" @click="load">Load</button>
    <hr />
    <button type="button" @click="signOut">Sign Out</button>
  </div>
</template>

<script lang="ts" setup>
import { getAsBlob, loadBlob, resetCanvas } from "../Artboard/artboardService";
import { artboardState } from "../Artboard/artboardState";
import { authState, signIn as googleSignIn, signOut as googleSignOut, useGoogleAuth } from "@/lib/google/googleAuthService";
import { readDir, readFile, writeFile } from "@/lib/FileStorage";

useGoogleAuth();

const resetWhite = () => resetCanvas("white");
const resetOrange = () => resetCanvas("orange");

const signIn = async () => {
  googleSignIn();
};

const signOut = async () => {
  googleSignOut();
};

const rootDirName = "gallery.challen.info/v2"; // TODO hard coded folder name?

const save = async () => {
  console.log("save");
  const blob = await getAsBlob();
  const file = await writeFile(rootDirName + "/hello.png", blob);
  console.log(file);
};

const load = async () => {
  console.log("load");
  // const files = await readDir(rootDirName);
  const blob = await readFile(rootDirName + "/hello.png");
  // const file = "";
  console.log(blob);
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
</style>
