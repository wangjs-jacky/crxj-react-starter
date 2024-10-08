import { convertToObj, findAllMatches, replaceTestID } from "@/lib/utils";
import { preprocess } from "./preprocess";
import axios from "@/lib/axios";
console.log("🔥 Hello from background (src/background/index.ts)");

const KEY = "trip_ottd_online_redirect_config";

const TESTID_MAP = "TESTID_MAP";
const MOCKENV_MAP = "MOCKENV_MAP";

const initTestMap = `全局模块: global-testID
中文姓名输入框: booking_input_component_中文姓名_self
联系电话输入框: booking_input_component_联系电话_self
证件有效期输入框: booking_input_component_证件有效期
证件签发日期输入框: booking_input_component_证件签发日期
国家/地区选择器: booking_input_component_国家/地区_self
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
选择出行人浮层: ta-passenger-出行人-list-poplayer-wrapper
出行人模块: ta-passenger
男icon: crn_font_booking_iconType_boy
女icon: crn_font_booking_iconType_girl
编辑按钮01: traveler_item_edit_0
编辑按钮02: traveler_item_edit_1
编辑按钮03: traveler_item_edit_2
出生地浮层: select-poplayer-出生地（省份）
签发地浮层: select-poplayer-签发地（省份）
国家/地区浮层: select-poplayer-选择国家
港澳签注类型浮层: ta-select-poplayer
港澳签注类型选择器: booking_input_component_签证
外露出行人回显编辑按钮01: show_list_edit_icon_0
中英文切换按钮: ta-switch-language
拍照识别按钮: ta-ocr
常旅列表页关闭按钮: ta-passenger-list-poplayer-close
外露出行人删除按钮: traveler_single_delete_游客_0
出行人选择01按钮: ta-passenger-select_01
去支付: ta-footer-next-btn
邀请好友填写: ta-invite-btn
邀请好友填写分享按钮: ta-invite-share-btn
通讯录按钮: ta-address-book
联系手机清除按钮: contact_mobile_clear_btn
邮箱清除按钮: contact_email_clear_btn
证件号重复半浮层模块: ta-repeat-cardnum-poplayer
证件号重复半浮层模块编辑按钮01: ta-repeat-cardnum_0
证件号重复半浮层模块编辑按钮02: ta-repeat-cardnum_1
常旅列表页保存按钮: ta-passenger-list-save
新增出行人浮层: ta-passenger-出行人-edit-poplayer-wrapper
返回按钮: ta-passenger-edit-poplayer-back
姓名填写说明按钮01: crn_font_booking_iconType_help
证件类型浮层: ta-cardtype-poplayer
证件切换按钮: ta-cardtype
风险公告模块: ta-notice-tips 
风险公告浮层: risk_pop_default 
出生地选择框: booking_input_component_出生地
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
  const url = tab?.url || "";
  const moduleMatch = url.match(/module\/(\d+)/);
  const moduleId = moduleMatch ? moduleMatch[1] : null;
  const caseMatch = url.match(/case\/(\d+)/);
  const caseId = caseMatch ? caseMatch[1] : null;
  return { ...tab, caseId, moduleId };
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
let urlStr = "";


let testIDMap = {};


function updateInfo(url) {
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
  });

  // 更新 URL（后续调整所有的结构）
  urlStr = `
\\\`\\\`\\\`url
${url}
\\\`\\\`\\\`
`
}

let result: any[] = [];

// 插件消息中心，监听全局事件
chrome.runtime.onMessage.addListener(async function (message, sender, sendResponse) {
  const { type, command, data } = message;

  let steps = []

  switch (type || command) {
    case 'down':
      const tab = await getCurrentTab();
      downloadContent(`case_${tab.caseId}.tsx`, result);
      break;

    // 解析页面元素
    // 1. 句子通过 "♀" 分段。
    // 2. 预处理，将除字符串外的部分 () 删掉。
    // 3. 将文本中的 [], 进行替换，对于不存在的 testID 进行弹窗提示。
    case 'copyToClipboard':
    case 'checkTestID':
      steps = result.map(res => {
        const isTag = "♀";
        const desc = preprocess(res['步骤描述'] || "");
        const expect = preprocess(res['预期结果'] || "");
        return `${res['步骤编号']}. ${desc} ${isTag} ${expect}\n`;
      })
      // 合并字符串（方便 testID 依赖收集）
      const contentStr = steps.join("");
      const { notFoundTestID } = replaceTestID(contentStr, testIDMap);
      console.log("wjs: command", command);
      if (command === "copyToClipboard") {
        sendResponse({
          copyText: `${titleStr}\n${urlStr}\n${contentStr}`, notFoundTestID
        });
      }
      break;
    case 'parseHtml':
      updateInfo(message?.url);
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

    case "qconfig":
      testIDMap = message.data || {}
      break;
    default:
      console.log('未知的消息类型:', type || command);
  }
});

export { };
