import { defineManifest } from "@crxjs/vite-plugin";
import { description, version } from "./package.json";

// 使用 manifest.config.ts 去写 json 文件，可以获得更好的代码体验
export default defineManifest(async (env) => ({
  name:
    env.mode === "stagging"
      ? "[INTERNAL] HTA Text Extractor"
      : "HTA Text Extractor",
  manifest_version: 3,
  // 将 package.json 的部分文还能给嫁接过来
  version,
  description,
  // action: {
  //   default_popup: "src/pages/popup/index.html",
  // },
  // serviceWork 可以作为一个调和剂，充当消息转发中心
  background: {
    service_worker: "src/background/index.tsx",
    type: "module",
  },
  // content_scripts：脚本直接嵌入到网页中，能够访问和修改网页的DOM。通常用于修改网页的外观或功能，且只能在特定页面上运行
  content_scripts: [
    {
      // 这边为什么可以使用 <> 去使用，非常 nice 的想法
      // matches: ["<all_urls>"],
      matches: [
        "https://testhub.package.ctripcorp.com/library/*",
        "file:///Users/jiashengwang/Downloads/*"
      ],
      js: ["src/scripts/content-scripts.tsx"],
      run_at: "document_end"
    },
  ],
  icons: {
    "16": "src/assets/icons/16x16.png",
    "32": "src/assets/icons/32x32.png",
    "48": "src/assets/icons/32x32.png",
    "128": "src/assets/icons/128x128.png",
  },
  permissions: [
    "downloads",
    "tabs",
    "storage",
    "clipboardWrite",
  ]
}));
