import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
// import mix from "vite-plugin-mix";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(({ command }) => {
  const plugins = [
    vue({
      template: {
        compilerOptions: {
          whitespace: "preserve",
        },
      },
    }),
    ,
    VitePWA({ registerType: "autoUpdate" }),
  ];
  if (command !== "build") {
    plugins
      .push
      // mix({
      //   handler: "./gallery-api/src/handler.ts",
      // }),
      // mix({
      //   handler: "./api/api.ts",
      // })
      ();
  }
  return {
    plugins,
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
  };
});
