import { ref } from "vue";

export const appMenuState = ref({
  showLeftMenu: false,
  showRightMenu: false,

  close() {
    this.showLeftMenu = false;
    this.showRightMenu = false;
  },
});
