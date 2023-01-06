import { createRouter, createWebHistory } from "vue-router";
import GalleryView from "../views/GalleryView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
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
