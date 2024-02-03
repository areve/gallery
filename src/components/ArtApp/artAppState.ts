import { ref } from "vue";

export const artAppState = ref({
  showLeftMenu: false,
  showRightMenu: false,

  closeMenus() {
    artAppState.value.showLeftMenu = false;
    artAppState.value.showRightMenu = false;
  },
});
