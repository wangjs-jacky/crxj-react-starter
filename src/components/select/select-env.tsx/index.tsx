import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useState } from "react";

// const mockMap = {
//   "mock-env-1": `// 导入 xtaro-ticket 公共 mock 配置
// import "../../../mock-env/common-config/activity-xtaro-ticket";

// import React from "react";
// import { fireEvent, render, waitFor, type RenderResult } from "@testing-library/react-native";
// import Detail from "../../../../src/pages/xtnt/business/detail/activity-xtaro-ticket/detail";

// import {
//     expectAttrsExists,
//     expectTestIDTextEqual,
//     expectTextExist,
//     ReactTestInstancePlus,
// } from "../../../utils";
// import { navigateTo } from "../../../../src/pages/xtnt/api/router";

// describe("行程模块", () => {
//     let ItineraryPage: RenderResult = null as unknown as RenderResult;
//     beforeEach(async () => {
//         ItineraryPage = render(<Detail />);
//     });
// });
// `,
//   "mock-env-2": `配置本地的 mock 环境`
// }

async function saveOptions(key: string, value: any) {
  chrome.runtime.sendMessage({ type: 'save_mockEnv_map', data: { key, value } });
}

async function getOptions() {
  chrome.runtime.sendMessage({ type: 'get_mockEnv_map' });
}

export const SelectEnv = () => {
  const [mockEnvKey, setMockEnvKey] = useState('mock-env-1');
  const [mockEnvMap, setMockEnvMap] = useState<Record<string, string>>({})
  const [textarea, setTextAreaValue] = useState("");

  useEffect(() => {
    setTextAreaValue(mockEnvMap[mockEnvKey])
  }, [mockEnvMap, mockEnvKey])

  useEffect(() => {
    // 发送获取事件
    getOptions();

    // 获取配置信息 testIDMap
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.type === "get_mockEnv_map") {
        const mockEnvMap = message.data || {};
        setMockEnvMap(mockEnvMap)
      }
    });
  }, []);

  return (
    <>
      <SheetHeader>
        <SheetTitle>环境配置</SheetTitle>
      </SheetHeader>
      <Select onValueChange={(mockEnvKey) => {
        setMockEnvKey(mockEnvKey)
        setTextAreaValue(mockEnvMap[mockEnvKey])
      }} value={mockEnvKey}>
        <SelectTrigger className="w-full my-2" >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {Object.keys(mockEnvMap).map((key, index) => {
            return <SelectItem key={index} value={key}>{key}</SelectItem>
          })}
        </SelectContent>
      </Select>
      <Textarea rows={20} className="my-2" value={textarea}
        onChange={(e) => {
          setMockEnvMap({
            ...mockEnvMap,
            [mockEnvKey]: e.target.value
          })
          setTextAreaValue(e.target.value)
          saveOptions(mockEnvKey, e.target.value)
        }} />
    </>
  )
}