import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import mix from "vite-plugin-mix";

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
  ];
  if (command !== "build") {
    plugins.push(
      mix({
        handler: "./api/api.ts",
      })
    );
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
