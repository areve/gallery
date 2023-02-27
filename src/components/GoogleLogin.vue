<template>
  <div ref="buttonWrapper" v-show="authState.state === 'signed_out'"></div>
  <button type="button" @click="signout" v-show="authState.state === 'signed_in'">Sign Out</button>
  <div v-show="authState.state === 'in_progress'">LOADING</div>
  <!-- <div v-show="tokens.state === 'signed_in'">
    {{ tokens }}
  </div> -->
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { signout, use, authState } from "./google-auth";

const buttonWrapper = ref<HTMLDivElement>(undefined!);

use({ buttonWrapper: buttonWrapper });
</script>
