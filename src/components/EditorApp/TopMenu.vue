<template>
  <nav id="menu" :hidden="!panelsVisibleState.menu">
    <label for="toggle-menu" class="toggle-menu">
      Menu <span class="drop-icon">▾</span>
    </label>
    <input type="checkbox" id="toggle-menu" />
    <ul class="main-menu">
      <MenuItemVue v-for="item in menu" :key="item.label" :item="item" />
    </ul>
  </nav>
</template>

<script lang="ts" setup>
import { action, applyEffect } from "@/components/EditorApp/appActions";
import { panelsVisibleState } from "@/components/EditorApp/panelsVisibleState";
import MenuItemVue from "./MenuItem.vue";
import type { MenuItem } from "./MenuItem";
import { addKeysForMenuItems } from "./keyboardService";

const menu: MenuItem[] = [
  {
    label: "File",
    items: [
      {
        label: "Save",
        action: () => action("save"),
        key: "Ctrl+S",
      },
      {
        label: "Reset",
        action: () => action("reset"),
        key: "Ctrl+R",
      },
      {
        label: "Settings",
        action: () => action("show-settings"),
      },
    ],
  },
  {
    label: "View",
    items: [
      {
        label: "Gallery",
        action: () =>
          (panelsVisibleState.value.gallery =
            !panelsVisibleState.value.gallery),
        key: "Ctrl+G",
      },
      {
        label: "OpenAI",
        action: () =>
          (panelsVisibleState.value.openAi = !panelsVisibleState.value.openAi),
      },
      {
        label: "Artwork Settings",
        action: () =>
          (panelsVisibleState.value.artworkSettings =
            !panelsVisibleState.value.artworkSettings),
      },
      {
        label: "Scale",
        action: () =>
          (panelsVisibleState.value.scale = !panelsVisibleState.value.scale),
      },
      {
        label: "Status",
        action: () =>
          (panelsVisibleState.value.statusBar =
            !panelsVisibleState.value.statusBar),
      },
      {
        label: "Toolbar",
        action: () =>
          (panelsVisibleState.value.toolbar =
            !panelsVisibleState.value.toolbar),
      },
      {
        label: "Menu",
        action: () =>
          (panelsVisibleState.value.menu = !panelsVisibleState.value.menu),
        key: "Ctrl+M",
      },
      {
        label: "Pencils",
        action: () =>
          (panelsVisibleState.value.pencil = !panelsVisibleState.value.pencil),
      },
    ],
  },
  {
    label: "Image",
    items: [
      {
        label: "Auto-crop",
        action: () => action("auto-crop"),
      },
      {
        label: "Effect",
        items: [
          {
            label: "Shotgun effect",
            action: () => applyEffect("shotgun"),
            key: "Ctrl+Shift+G",
          },
          {
            label: "All white",
            action: () => applyEffect("all-white"),
          },
          {
            label: "RYB > RGB",
            action: () => applyEffect("ryb2rgb"),
            key: "Ctrl+.",
          },
          {
            label: "RGB > RYB",
            action: () => applyEffect("rgb2ryb"),
            key: "Ctrl+,",
          },
        ],
      },
    ],
  },
];



addKeysForMenuItems(menu);
</script>

<style scoped>
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
