import { createRouter, createWebHashHistory } from "vue-router";
import GalleryView from "../views/GalleryView.vue";

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: "/",
      name: "gallery",
      component: GalleryView,
    },
    {
      path: "/editor",
      name: "editor",
      component: () => import("../views/EditorView.vue"),
    },
  ],
});

export default router;
