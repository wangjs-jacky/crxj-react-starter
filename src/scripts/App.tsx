import { Badge } from "@/components/ui/badge";
import { SidePanel } from "./sidePanel";

export const MyComponent = () => {
  return (
    <>
      <SidePanel />
      <Badge className="cursor-pointer" onClick={() => {
        chrome.runtime.sendMessage({ type: 'down', data: "123" });
      }}>自动代码生成</Badge>
      <Badge className="cursor-pointer" onClick={() => {
        chrome.runtime.sendMessage({ type: 'open-new-tab' });
      }}>打开本地服务服务器</Badge>
    </>
  );
};