import EditorApp from "@/views/EditorApp.vue";
import { createRouter, createWebHashHistory } from "vue-router";

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: "/",
      name: "editor",
      component: EditorApp,
    },
  ],
});

export default router;
