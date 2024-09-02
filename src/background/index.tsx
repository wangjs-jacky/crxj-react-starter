// import ReactDOM from "react-dom";
import react from "react";
console.log("🔥 Hello from background (src/background/index.ts)");

// const welcomeURL = chrome.runtime.getURL("src/pages/welcome/index.html");

// // 监听插件是否安装
// chrome.runtime.onInstalled.addListener((details) => {
//   if (details.reason === chrome.runtime.OnInstalledReason.INSTALL) {
//     chrome.tabs.create({ url: welcomeURL });
//   }
// });

// // 监听插件是否被点击
// chrome.action.onClicked.addListener(() => { })


const downloadContent = (filename, content) => {
  // const blob = new Blob([content], { type: 'text/plain' });
  // const url = URL.createObjectURL(blob);
  const dataUrl = `data:text/plain;charset=utf-8,${encodeURIComponent(JSON.stringify(content))}`;

  chrome.downloads.download({
    url: dataUrl,
    filename: filename,
    saveAs: true,
    conflictAction: 'prompt'
  }, () => {
    URL.revokeObjectURL(dataUrl); // 清理 URL 对象
  });
};

let result:any[];

// 插件消息中心，监听全局事件
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.type == 'down') {
    downloadContent('aaa.tsx', result);
  } else if (message.type == 'parseHtml') {
    result = message.data;
  }
});

// // 监听右键菜单点击事件
// chrome.contextMenus.onClicked.addListener(() => { });

// // 添加右键菜单
// // chrome.contextMenus.create({
// //   type: 'normal',
// //   title: '批量导出',
// //   contexts: ['all'],
// //   id: 'menu-1'
// // });

// // 下载函数
// function download(url: string) {
//   var options = {
//     url: url
//   }
//   // 下载 ？是否存在 ts 类型
//   chrome.downloads.download(options)
// }



export { };
