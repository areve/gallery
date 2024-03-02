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
    VitePWA({
      registerType: "prompt",
      workbox: {},
      includeAssets: ["/icons/favicon.ico", "/icons/apple-touch-icon.png"],
      devOptions: {
        enabled: true,
      },
      manifest: {
        name: "Gallery",
        short_name: "Gallery",
        description: "A drawing app",
        theme_color: "#000000",
        icons: [
          {
            src: "/icons/pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/icons/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "/icons/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/icons/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
    }),
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
    build: {
      sourcemap: true,
    },
    define: {
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
    },
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
  };
});
