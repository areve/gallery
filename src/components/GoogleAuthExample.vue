<template>
  <h1>GoogleAuthExample</h1>
  <div ref="buttonWrapper" v-show="getAuthState() === 'signed_out'"></div>
  <button type="button" @click="signOut" v-show="getAuthState() === 'signed_in'">signOut</button>
  <button type="button" @click="showPrompt" v-show="getAuthState() === 'signed_out'">showPrompt</button>
  <button type="button" @click="getIdToken">getIdToken</button>
  <button type="button" @click="getAccessToken">getAccessToken</button>
  <button type="button" @click="getBothTokens">getBothTokens</button>
  <div v-show="getAuthState() === 'in_progress'">LOADING</div>
  {{ authState }}
  <div v-show="getAuthState() === 'signed_in'"></div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from "vue";
import {
  signOut,
  showPrompt,
  getAuthState,
  getIdToken,
  getAccessToken,
  getBothTokens,
  useGoogleAuth,
  authState,
  renderButton,
} from "../services/googleAuthService";

const buttonWrapper = ref<HTMLDivElement>(undefined!);
useGoogleAuth();
onMounted(() => renderButton(buttonWrapper.value));
</script>
