import { Badge } from "@/components/ui/badge";
import { SidePanel } from "./sidePanel";
import { toast, Toaster } from "sonner";

export const MyComponent = () => {
  return (
    <>
      <SidePanel />
      <Badge className="cursor-pointer" onClick={() => {
        chrome.runtime.sendMessage({ type: 'down', data: "123" });
      }}>自动代码生成</Badge>
      {/* <Badge className="cursor-pointer" onClick={() => {
        chrome.runtime.sendMessage({ type: 'open-new-tab' });
      }}>打开本地服务服务器</Badge> */}
      <Badge variant="outline" className="cursor-pointer" onClick={() => {
        chrome.runtime.sendMessage({ command: "copyToClipboard" }, (response) => {
          if (response) {
            const { notFoundTestID } = response || {};
            console.log("wjs: notFoundTestID", notFoundTestID);
            navigator.clipboard.writeText(response.copyText).then(() => {
              toast("剪贴板已保存", {
                description: notFoundTestID ? `未找到以下占位符，请补全:${notFoundTestID}` : "已保存到剪贴板",
                action: {
                  label: "关闭",
                  onClick: () => console.log("Undo"),
                },
              })
            }).catch(err => {
              console.error('Error copying text: ', err);
            });
          }
        });
      }}>剪贴板保存</Badge>

      <Badge variant="outline" className="cursor-pointer" onClick={() => {
        chrome.runtime.sendMessage({ command: "copyToClipboard2" }, (response) => {
          if (response) {
            const { notFoundTestID } = response || {};
            navigator.clipboard.writeText(response.copyText).then(() => {
              toast("剪贴板已保存", {
                description: notFoundTestID ? `未找到以下占位符，请补全:${notFoundTestID}` : "已保存到剪贴板",
                action: {
                  label: "关闭",
                  onClick: () => console.log("Undo"),
                },
              })
            }).catch(err => {
              console.error('Error copying text: ', err);
            });
          }
        });
      }}>剪贴板保存2</Badge>
      <Toaster />
    </>
  );
};