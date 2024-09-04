console.log("🔥 Hello from background (src/background/index.ts)");

// const welcomeURL = chrome.runtime.getURL("src/pages/welcome/index.html");

// 监听插件是否安装
chrome.runtime.onInstalled.addListener((details) => {
  // if (details.reason === chrome.runtime.OnInstalledReason.INSTALL) {
  //   chrome.tabs.create({ url: welcomeURL });
  // }
  // chrome.tabs.create({ url: 'http://localhost:3000' });
  chrome.storage.local.clear()
});

// // 监听插件是否被点击
// chrome.action.onClicked.addListener(() => { })

const downloadContent = (filename: string, content: any[]) => {
  try {
    const dataUrl = `data:text/plain;charset=utf-8,${encodeURIComponent(JSON.stringify(content))}`;
    chrome.downloads.download({
      url: dataUrl,
      filename: filename,
      saveAs: true,
      conflictAction: 'prompt'
    }, () => {
      URL.revokeObjectURL(dataUrl); // 清理 URL 对象
    });
  } catch (error) { }
};

let result: any[];

// 获取 TAB 信息
async function getCurrentTab() {
  let queryOptions = { active: true, lastFocusedWindow: true };
  let [tab] = await chrome.tabs.query(queryOptions);
  const arr = (tab?.url || "").split("/") || [];
  return { ...tab, caseId: arr[arr.length - 1] || 0 };
}

const TESTID_MAP = "TESTID_MAP"

async function getTestIDMapConfig() {
  const { TESTID_MAP } = await chrome.storage.local.get([TESTID_MAP]);
  return TESTID_MAP;
}

//保存用户配置
async function saveTestIDMapConfig(key: string, value: any) {
  const options = await getTestIDMapConfig();
  chrome.storage.local.set({
    [TESTID_MAP]: {
      ...options,
      [key]: value
    }
  })
}

// 插件消息中心，监听全局事件
chrome.runtime.onMessage.addListener(async function (message, sender, sendResponse) {
  if (message.type == 'down') {
    const tab = await getCurrentTab();
    downloadContent(`case_${tab.caseId}.tsx`, result);
  } else if (message.type == 'parseHtml') {
    result = message.data;
  } else if (message.type === "getTabInfo") {
    const tab = await getCurrentTab();
    // 往组件中发送当前 tab 的信息
    await chrome.tabs.sendMessage(tab.id!, { type: 'getTabInfo', data: tab });
  } else if (message.type == 'save_case_cofig') {
    // 保存用户配置
    function saveOptions(value: Record<string, any>) {
      chrome.storage.local.set(value)
    }
    const { caseId } = message.data;
    saveOptions({ caseId: message.data })

    chrome.storage.local.get([caseId]).then((result) => {
      var value = result[caseId];
      console.log("wjs: config value", value);
    });
  } else if (message.type == 'open-new-tab') {
    chrome.tabs.create({ url: 'http://localhost:3000' });
  } else if (message.type == 'save_testID_map') {
    const { key, value } = message.data || {};
    console.log("wjs: key,value", key, value);

    await saveTestIDMapConfig(key, value)
  } else if (message.type == 'get_testID_map') {
    const config = await getTestIDMapConfig()
    console.log("wjs: xxx,config", config);

    await chrome.tabs.sendMessage(sender?.tab?.id!, { type: 'get_testID_map', data: config });
    // chrome.runtime.sendMessage({ type: "get_testID_map1", data: config });
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
