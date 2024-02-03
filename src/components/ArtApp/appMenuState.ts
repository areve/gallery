import { ref } from "vue";

export const appMenuState = ref({
  showLeftMenu: false,
  showRightMenu: false,

  close() {
    appMenuState.value.showLeftMenu = false;
    appMenuState.value.showRightMenu = false;
  },
});
