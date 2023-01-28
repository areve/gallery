import { createRouter, createWebHashHistory } from "vue-router";

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: "/",
      name: "editor",
      component: () => import("../views/EditorApp.vue"),
    },
  ],
});

export default router;
