import { crx } from "@crxjs/vite-plugin";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { defineConfig } from "vite";
import manifest from "./manifest.config";

export default defineConfig({
  plugins: [react(), crx({ manifest })],
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      // 新增的 Tab 页面，由于没有 crxjs 未内置处理，需手动 rollup 配置
      // input: {
      //   welcome: resolve(__dirname, "./src/pages/welcome/index.html"),
      // },
      // input: {
      //   xxx: resolve(__dirname, "./src/scripts/content-scripts.tsx"),
      // }
    },
  },
});
