<template>
  <div ref="buttonWrapper" v-show="authState.state === 'signed_out'"></div>
  <button type="button" @click="signout" v-show="authState.state === 'signed_in'">Sign Out</button>
  <button type="button" @click="signin" v-show="authState.state === 'signed_out'">Sign In</button>
  <button type="button" @click="getIdToken">getIdToken</button>
  <button type="button" @click="getAccessToken">getAccessToken</button>
  <button type="button" @click="getBothTokens">getBothTokens</button>
  <div v-show="authState.state === 'in_progress'">LOADING</div>
  <!-- {{ authState }} -->
  <div v-show="authState.state === 'signed_in'"></div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { signout, signin, getIdToken, getAccessToken, getBothTokens, use, authState } from "./google-auth";

const buttonWrapper = ref<HTMLDivElement>(undefined!);

use({ buttonWrapper: buttonWrapper });
</script>
