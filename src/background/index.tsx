console.log("🔥 Hello from background (src/background/index.ts)");

// const welcomeURL = chrome.runtime.getURL("src/pages/welcome/index.html");

const TESTID_MAP = "TESTID_MAP";
const MOCKENV_MAP = "MOCKENV_MAP";


// 监听插件是否安装
chrome.runtime.onInstalled.addListener((details) => {
  // if (details.reason === chrome.runtime.OnInstalledReason.INSTALL) {
  //   chrome.tabs.create({ url: welcomeURL });
  // }
  // chrome.tabs.create({ url: 'http://localhost:3000' });

  // 初始化，local 存储
  chrome.storage.local.clear()
  chrome.storage.local.set({
    [TESTID_MAP]: {
      "product-detail": "组件1:testID1\n组件2:testID2",
      "product-detail-snapshot": "组件3:testID3\n组件4:testID4"
    },
    [MOCKENV_MAP]: {
      "mock-env-1": `// 导入 product-detail 公共 mock 配置
    import "../../../mock-env/common-config/activity-product-detail";
    
    import React from "react";
    import { fireEvent, render, waitFor, type RenderResult } from "@testing-library/react-native";
    import Detail from "../../../../src/pages/xtnt/business/detail/activity-product-detail/detail";
    
    import {
        expectAttrsExists,
        expectTestIDTextEqual,
        expectTextExist,
        ReactTestInstancePlus,
    } from "../../../utils";
    import { navigateTo } from "../../../../src/pages/xtnt/api/router";
    
    describe("行程模块", () => {
        let ItineraryPage: RenderResult = null as unknown as RenderResult;
        beforeEach(async () => {
            ItineraryPage = render(<Detail />);
        });
    });
    `,
      "mock-env-2": `配置本地的 mock 环境`
    }
  })
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
      // URL.revokeObjectURL(dataUrl); // 清理 URL 对象
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


// // 获取配置
// async function getTestIDMapConfig() {
//   const options = await chrome.storage.local.get([TESTID_MAP]);
//   return options[TESTID_MAP];
// }

// // 保存配置
// async function saveTestIDMapConfig(key: string, value: any) {
//   const options = (await getTestIDMapConfig()) || {};
//   chrome.storage.local.set({
//     [TESTID_MAP]: {
//       ...options,
//       [key]: value
//     }
//   })
// }

function createMapByKey(MAP_KET: string) {
  // 获取配置
  async function getMapConfig() {
    const options = await chrome.storage.local.get([MAP_KET]);
    return options[MAP_KET];
  }

  //保存用户配置
  async function saveMapConfig(key: string, value: any) {
    const options = (await getTestIDMapConfig()) || {};
    chrome.storage.local.set({
      [MAP_KET]: {
        ...options,
        [key]: value
      }
    })
  }

  return {
    getMapConfig,
    saveMapConfig
  }
}

const getTestIDMapConfig = createMapByKey(TESTID_MAP).getMapConfig;
const saveTestIDMapConfig = createMapByKey(TESTID_MAP).saveMapConfig;
const getMockEnvMapConfig = createMapByKey(MOCKENV_MAP).getMapConfig;
const saveMockEnvMapConfig = createMapByKey(MOCKENV_MAP).saveMapConfig;

// 插件消息中心，监听全局事件
chrome.runtime.onMessage.addListener(async function (message, sender, sendResponse) {
  if (message.type == 'down') {
    const tab = await getCurrentTab();
    downloadContent(`case_${tab.caseId}.tsx`, result);
  } else if (message.type == 'parseHtml') {
    result = message.data;
  } else if (message.type === "getTabInfo") {
    const tab = await getCurrentTab();
    if (chrome.tabs) {
      // 往组件中发送当前 tab 的信息
      await chrome.tabs.sendMessage(tab.id!, { type: 'getTabInfo', data: tab });
    }
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
    await saveTestIDMapConfig(key, value)
  } else if (message.type == 'get_testID_map') {
    const config = await getTestIDMapConfig()
    console.log("wjs: config-a", config);
    await chrome.tabs.sendMessage(sender?.tab?.id!, { type: 'get_testID_map', data: config });
  }
  else if (message.type == 'save_mockEnv_map') {
    const { key, value } = message.data || {};
    await saveMockEnvMapConfig(key, value)
  } else if (message.type == 'get_mockEnv_map') {
    const config = await getMockEnvMapConfig()
    console.log("wjs: config-b", config);
    await chrome.tabs.sendMessage(sender?.tab?.id!, { type: 'get_mockEnv_map', data: config });
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
