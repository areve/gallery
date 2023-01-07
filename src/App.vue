<script setup lang="ts">
import { RouterLink, RouterView } from "vue-router";
</script>

<template>
  <header>
    <div class="nav-wrapper">
      <nav>
        <RouterLink to="/">Gallery</RouterLink>
        <RouterLink to="/editor">Editor</RouterLink>
      </nav>
    </div>
  </header>

  <RouterView />
</template>

<style scoped>
.nav-wrapper{
  position: fixed;
  z-index: 2;
  top: 0;
  left: 50%;
}
</style>
