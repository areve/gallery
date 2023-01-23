<template>
  <nav class="menu">
    <ul class="menu-list">
      <li class="menu-item">File</li>
      <li class="menu-item">Edit</li>
      <li class="menu-item">About</li>
      <li class="menu-item" @click="save" role="button">Save</li>
    </ul>
  </nav>
</template>

<script setup>

import { save } from '@/stores/appActions'

</script>

<style scoped>
.menu {
  background-color: #000;
  color: #fff;
  padding: 0.2em;
  grid-area: menu;
}

.menu-list {
  padding: 0;
  margin: 0;
  list-style: none;
  display: flex;
  flex-direction: row;
}

.menu-item {
  padding: 0.1em 0.4em;
}

.menu-item[role="button"] {
  cursor: pointer;
}
</style>