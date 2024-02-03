import { ref } from "vue";

export const artAppState = ref({
  menus: {
    appLeft: false,
    appRight: false,
  },
  closeMenus() {
    artAppState.value.menus.appLeft = false;
    artAppState.value.menus.appRight = false;
  },
});
