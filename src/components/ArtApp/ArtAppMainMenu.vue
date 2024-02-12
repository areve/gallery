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
import { escapeQuery, fileInfoKeys, googleFilesGet, googleFolderCreate } from "@/lib/google/googleApi";
import { resetCanvas } from "../Artboard/artboardService";
import { artboardState } from "../Artboard/artboardState";
import { authState, signIn as googleSignIn, signOut as googleSignOut, useGoogleAuth } from "@/lib/google/googleAuthService";

useGoogleAuth();
// googleSignOut();
const resetWhite = () => resetCanvas("white");
const resetOrange = () => resetCanvas("orange");
const save = () => {
  console.log("save");
};

const rootDirName = "gallery.challen.info"; // TODO hard coded folder name?

async function ensureFolder(name: string) {
  let folder = await folderExists(name);
  if (!folder) folder = await googleFolderCreate(name);
  return folder;
}

async function folderExists(name: string) {
  const result = await googleFilesGet(
    {
      q: `trashed=false and name='${escapeQuery(name)}' and mimeType='application/vnd.google-apps.folder'`,
      pageSize: "1",
      fields: `files(${fileInfoKeys.join(",")})`,
    },
    "/"
  );
  return result[0];
}

//getAuthState, signIn, useGoogleAuth

const signIn = async () => {
  googleSignIn();
};

const signOut = async () => {
  googleSignOut();
};

const load = async () => {
  console.log("load");
  const folder = await folderExists(rootDirName);
  console.log(folder);
  // const folder = await ensureFolder(rootDirName);
  // const files = await googleFilesGet(
  //   {
  //     q: `trashed=false and '${escapeQuery(folder.id)}' in parents`,
  //     // TODO support "pageSize"
  //     fields: `nextPageToken, files(${fileInfoKeys.join(",")})`,
  //   },
  //   "/gallery"
  // );
  // console.log(files)
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
