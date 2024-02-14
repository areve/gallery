<template>
  <section class="brush-panel">
    <div>
      <strong>Color</strong>
      <label>
        <input type="radio" name="color" value="red" v-model="brushToolState.color" />
        Red
      </label>
      <label>
        <input type="radio" name="color" value="blue" v-model="brushToolState.color" />
        Blue
      </label>
      <label>
        <input type="radio" name="color" value="green" v-model="brushToolState.color" />
        Green
      </label>
      <label>
        <input type="radio" name="color" value="yellow" v-model="brushToolState.color" />
        Yellow
      </label>
      <label>
        <input type="radio" name="color" value="white" v-model="brushToolState.color" />
        White
      </label>
<label>
        <input type="radio" name="color" value="rgb(0,0,0,0.2)" v-model="brushToolState.color" />
        Soft Black
      </label>

<label>
        <input type="radio" name="color" value="black" v-model="brushToolState.color" />
        Black
      </label>    </div>
    <div>
      <strong>Radius</strong>
      <input type="number" v-model="brushToolState.radius" />
    </div>
  </section>
</template>

<script lang="ts" setup>
import { brushToolState } from "./brushToolState";
</script>

<style scoped></style>
