<template>
  <section class="eraser-panel">
    <div>
      <strong>Radius</strong>
      <input type="number" v-model="eraserToolState.radius" />
    </div>
  </section>
</template>

<script lang="ts" setup>
import { eraserToolState } from "./eraserToolState";
</script>

<style scoped></style>
