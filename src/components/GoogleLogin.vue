<template>
  <div ref="buttonWrapper" v-show="!tokens.idToken"></div>
  <button type="button" @click="signout" v-show="tokens.accessToken">Sign Out</button>
  <div v-show="!!tokens.accessToken != !!tokens.idToken">LOADING</div>
  <div v-show="!!tokens.accessToken == !!tokens.idToken">
    {{ tokens }}
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { signout, use, tokens } from "./google-auth";

const buttonWrapper = ref<HTMLDivElement>(undefined!);

use({ buttonWrapper: buttonWrapper });
</script>
