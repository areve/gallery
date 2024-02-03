<template>
  <li class="menu-item" :role="'action' in item ? 'button' : ''" @click="item.action">
    {{ item.label }}
    <span class="menu-item-key" v-if="'key' in item">{{ item.key }}</span>
    <span v-if="item.items" class="drop-icon">▾</span>
    <label v-if="item.items" title="Toggle Drop-down" class="drop-icon" for="menu-{{ item.label }}">▾</label>
    <input v-if="item.items" type="checkbox" id="menu-{{ item.label }}" />
    <ul v-if="item.items" class="sub-menu">
      <MenuItem v-for="subItem in item.items" :key="subItem.label" :item="subItem" />
    </ul>
  </li>
</template>

<script lang="ts" setup>
import type { MenuItem } from "./MenuItem";

interface Props {
  item: MenuItem;
}

defineProps<Props>();
</script>

<style scoped>
.clearfix {
  overflow: auto;
}

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

.menu-item[role="button"] {
  cursor: pointer;
}

#menu ul {
  margin: 0;
  padding: 0;
}

#menu .main-menu {
  display: none;
}

.toggle-menu:checked + .main-menu {
  display: block;
}

#menu input[type="checkbox"],
#menu ul span.drop-icon {
  display: none;
}

#menu li,
.toggle-menu,
#menu .sub-menu {
  border-style: solid;
  border-color: rgba(0, 0, 0, 0.05);
}

#menu li,
.toggle-menu {
  border-width: 0 0 1px;
}

#menu .sub-menu {
  background-color: #171717;

  border-width: 1px 1px 0;
  margin: 0 1em;
}

#menu .sub-menu li:last-child {
  border-width: 0;
}

#menu li,
.toggle-menu,
#menu button {
  position: relative;
  display: block;
  color: white;
  /* text-shadow: 1px 1px 0 rgba(0, 0, 0, .125); */
}

#menu,
.toggle-menu {
  background-color: #000;
  color: #fff;
  padding: 0.2em;
}

.toggle-menu,
#menu .menu-item {
  padding: 1em 1.5em;
}

#menu .menu-item {
  transition: all 0.125s ease-in-out;
  -webkit-transition: all 0.125s ease-in-out;
}

#menu .menu-item:hover {
  background-color: #333;
  color: #fff;
}

#menu .sub-menu {
  display: none;
}

#menu input[type="checkbox"]:checked + .sub-menu {
  display: block;
}

#menu .sub-menu a:hover {
  color: #444;
}

.toggle-menu .drop-icon,
#menu li label.drop-icon {
  position: absolute;
  right: 1.5em;
  top: 1.25em;
  display: none;
  /* TODO maybe remove */
}

#menu label.drop-icon,
.toggle-menu span.drop-icon {
  border-radius: 50%;
  width: 1em;
  height: 1em;
  text-align: center;
  background-color: rgba(0, 0, 0, 0.125);
  text-shadow: 0 0 0 transparent;
  color: rgba(255, 255, 255, 0.75);
  display: none;
  /* TODO maybe remove */
}

#menu .drop-icon {
  line-height: 1;
  display: none;
  /* TODO maybe remove */
}

@media only screen and (min-width: 1em) {
  /* TODO 52em is better for a breakpoint */

  .toggle-menu,
  #menu .menu-item {
    padding: 0.2em 1em;
  }

  #menu .main-menu {
    display: block;
  }

  .toggle-menu,
  #menu label.drop-icon {
    display: none;
  }

  #menu ul span.drop-icon {
    display: inline-block;
    display: none;
    /* TODO maybe remove */
  }

  #menu li {
    float: left;
    border-width: 0 1px 0 0;
  }

  #menu .sub-menu li {
    float: none;
  }

  #menu .sub-menu {
    border-width: 0;
    margin: 0;
    position: absolute;
    top: 100%;
    left: 0;
    width: 12em;
    z-index: 3000;
  }

  #menu .sub-menu,
  #menu input[type="checkbox"]:checked + .sub-menu {
    display: none;
  }

  #menu .sub-menu li {
    border-width: 0 0 1px;
  }

  #menu .sub-menu .sub-menu {
    top: 0;
    left: 100%;
  }

  #menu li:hover > input[type="checkbox"] + .sub-menu {
    display: block;
  }
}

.menu-item-key {
  float: right;
}
</style>
