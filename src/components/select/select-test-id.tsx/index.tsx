import { useEffect, useRef, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { SheetHeader, SheetTitle } from "../../ui/sheet";
import { Textarea } from "../../ui/textarea";

async function saveOptions(key: string, value: any) {
  chrome.runtime.sendMessage({ type: 'save_testID_map', data: { key, value } });
}

async function getOptions() {
  chrome.runtime.sendMessage({ type: 'get_testID_map' });
}

export const SelectTestID = () => {
  const [pageKey, setPageKey] = useState('product-detail');
  const [testIDMap, setTestIDMap] = useState<Record<string, string>>({
  });
  const [textarea, setTextAreaValue] = useState("");

  useEffect(() => {
    setTextAreaValue(testIDMap[pageKey])
  }, [testIDMap, pageKey])

  useEffect(() => {
    // 发送获取事件
    getOptions();

    // 获取配置信息 testIDMap
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.type === "get_testID_map") {
        const testIDMap = message.data || {};
        setTestIDMap(testIDMap)
      }
    });
  }, []);

  return (
    <>
      <SheetHeader>
        <SheetTitle>testID 映射</SheetTitle>
      </SheetHeader>
      <Select onValueChange={(key) => {
        setPageKey(key);
        setTextAreaValue(testIDMap[key])
      }} value={pageKey}>
        <SelectTrigger className="w-full my-2">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {Object.keys(testIDMap).map((key, index) => {
            return <SelectItem key={index} value={key}>{key}</SelectItem>
          })}
        </SelectContent>
      </Select>
      <Textarea placeholder="组件1: testID-1
组件2: testID-2" id="message-2" className="my-2" value={textarea}
        onChange={async (e) => {
          setTestIDMap({
            ...testIDMap,
            [pageKey]: e.target.value
          })
          setTextAreaValue(e.target.value)
          saveOptions(pageKey, e.target.value)
        }} />
      <p className="text-sm text-muted-foreground py-2">
        该映射表会透传给 <code>AI Agent</code> 用于解析，后续可直接在 <code>BDD</code>  文本中使用组件名
      </p>
    </>

  )
}