import { convertToObj, findAllMatches, replacePlaceholders } from "@/lib/utils";
import { preprocess } from "./preprocess";

console.log("🔥 Hello from background (src/background/index.ts)");

// const welcomeURL = chrome.runtime.getURL("src/pages/welcome/index.html");

const TESTID_MAP = "TESTID_MAP";
const MOCKENV_MAP = "MOCKENV_MAP";

const initTestMap = `全局模块: global-testID
中文姓名输入框: booking_input_component_中文姓名_self
联系电话输入框: booking_input_component_联系电话_self
证件有效期输入框: booking_input_component_证件有效期
证件签发日期输入框: booking_input_component_证件签发日期
国家/地区选择器: booking_input_component_国家/地区
出生地选择器: booking_input_component_出生地
证件号输入框: booking_input_component_证件号_self
体重输入框: booking_input_component_体重（kg）_self
身高输入框: booking_input_component_身高（cm）_self
鞋码输入框: booking_input_component_鞋码（欧码）_self
近视度数输入框: booking_input_component_近视度数（度）_self
联系手机输入框: booking_input_component_联系手机_self
Email输入框: booking_input_component_Email_self
签发地选择器: booking_input_component_签发地
出行人编辑浮层: ta-passenger-出行人-edit-poplayer-wrapper
签证选择器: booking_input_component_签证
出行人模块: ta-passenger
男icon: crn_font_booking_iconType_boy
出生地选择框: booking_input_component_出生地
新增出行人浮层: ta-passenger-出行人-edit-poplayer-wrapper
出生地浮层: select-poplayer-出生地（省份）
签发地浮层: select-poplayer-签发地（省份）
国家/地区浮层: select-poplayer-选择国家
港澳签注类型浮层: ta-select-poplayer
国家/地区选择器: booking_input_component_国家/地区_self
港澳签注类型选择器: booking_input_component_签证
选择出行人浮层: ta-passenger-出行人-list-poplayer-wrapper
外露出行人回显编辑按钮01: show_list_edit_icon_0
编辑按钮01: traveler_item_edit_0
证件类型浮层: ta-cardtype-poplayer
证件切换按钮: ta-cardtype
女icon: crn_font_booking_iconType_girl 
风险公告模块: ta-notice-tips
风险公告浮层: risk_pop_default
`

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
      "xtaro-ticket": initTestMap,
      "xtaro-ticket-snapshot": "组件3:testID3\n组件4:testID4"
    },
    [MOCKENV_MAP]: {
      "mock-env-1": `// 导入 xtaro-ticket 公共 mock 配置
    import "../../../mock-env/common-config/activity-xtaro-ticket";
    
    import React from "react";
    import { fireEvent, render, waitFor, type RenderResult } from "@testing-library/react-native";
    import Detail from "../../../../src/pages/xtnt/business/detail/activity-xtaro-ticket/detail";
    
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


// 获取 TAB 信息
async function getCurrentTab() {
  let queryOptions = { active: true, lastFocusedWindow: true };
  let [tab] = await chrome.tabs.query(queryOptions);
  const arr = (tab?.url || "").split("/") || [];
  return { ...tab, caseId: arr[arr.length - 1] || 0 };
}

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

// 标题 字符串
let titleStr = "";
// tab 对象
let _tabInfo = {} as any;
// testID 字符串
let testIDStr = "";

function updateTitle() {
  getCurrentTab().then((tabInfo) => {
    _tabInfo = tabInfo;
    const _titleStr = `{${tabInfo?.caseId}}` + "-" + tabInfo?.title;
    titleStr = `
\\\`\\\`\\\`info
${_titleStr}
\\\`\\\`\\\`
    `
  })
  getTestIDMapConfig().then((res) => {
    testIDStr = res["xtaro-ticket"];
  })
}

let result: any[] = [];

// 插件消息中心，监听全局事件
chrome.runtime.onMessage.addListener(async function (message, sender, sendResponse) {
  const { type, command, data } = message;

  const steps = result.map(res => {
    // const isTag = (!!res['步骤描述'] && !!res['步骤描述']) ? "♀" : "";
    // console.log("wjs: 111", res['步骤描述'], res['步骤描述'], (res['步骤描述'] && res['步骤描述']));
    const isTag = "♀";
    const desc = preprocess(res['步骤描述'] || "");
    const expect = preprocess(res['预期结果'] || "");
    return `${res['步骤编号']}. ${desc} ${isTag} ${expect}\n`;
  })

  switch (type || command) {
    case 'down':
      const tab = await getCurrentTab();
      downloadContent(`case_${tab.caseId}.tsx`, result);
      break;

    // 剪贴板拷贝2
    case 'copyToClipboard2':
      const testIDObj = convertToObj(testIDStr);
      const { result: _steps, notFoundTestID } = replacePlaceholders(steps.join("&&||"), testIDObj);
      const obj = {
        id: _tabInfo?.caseId,
        title: `标题: {${_tabInfo?.caseId}}` + "-" + _tabInfo?.title,
        steps: _steps.replaceAll("“", "\"").replaceAll("”", "\"").replaceAll("'", "\"").replaceAll("♀", ",").split("&&||").map(i => {
          return findAllMatches(i)
        }),
        testID: testIDStr
      }
      sendResponse({ copyText: JSON.stringify(obj, null, 2), notFoundTestID });
      break;

    // 剪贴板功能1
    case 'copyToClipboard':
      const contentStr = steps.join("");
      const testIDObj2 = convertToObj(testIDStr);
      const { notFoundTestID: notFoundTestID2 } = replacePlaceholders(contentStr, testIDObj2);
      sendResponse({ copyText: `${titleStr}\n${contentStr}`, notFoundTestID: notFoundTestID2 });
      break;
    case 'parseHtml':
      updateTitle();
      result = data;
      break;

    case 'getTabInfo':
      const tabInfo = await getCurrentTab();
      if (chrome.tabs) {
        await chrome.tabs.sendMessage(tabInfo.id!, { type: 'getTabInfo', data: tabInfo });
      }
      break;

    case 'save_case_cofig':
      const { caseId } = data;
      chrome.storage.local.set({ caseId: data });
      chrome.storage.local.get([caseId], (result) => {
        console.log("wjs: config value", result[caseId]);
      });
      break;

    case 'open-new-tab':
      chrome.tabs.create({ url: 'http://localhost:3000' });
      break;

    case 'save_testID_map':
      const { key: testIDKey, value: testIDValue } = data || {};
      await saveTestIDMapConfig(testIDKey, testIDValue);
      break;

    case 'get_testID_map':
      const testIDConfig = await getTestIDMapConfig();
      console.log("wjs: config-a", testIDConfig);
      await chrome.tabs.sendMessage(sender?.tab?.id!, { type: 'get_testID_map', data: testIDConfig });
      break;

    case 'save_mockEnv_map':
      const { key: mockEnvKey, value: mockEnvValue } = data || {};
      await saveMockEnvMapConfig(mockEnvKey, mockEnvValue);
      break;

    case 'get_mockEnv_map':
      const mockEnvConfig = await getMockEnvMapConfig();
      console.log("wjs: config-b", mockEnvConfig);
      await chrome.tabs.sendMessage(sender?.tab?.id!, { type: 'get_mockEnv_map', data: mockEnvConfig });
      break;

    default:
      console.log('未知的消息类型:', type || command);
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
