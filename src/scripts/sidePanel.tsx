import { SelectEnv } from "@/components/select/select-env.tsx"
import { SelectTestID } from "@/components/select/select-test-id.tsx"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Textarea } from "@/components/ui/textarea"
import { useEffect, useState } from "react"




export function SidePanel() {
  const [title, setTitle] = useState('');
  const [caseId, setCaseId] = useState('');
  const [componentName, setComponentName] = useState('renderPage');


  useEffect(() => {
    // 获取 tab 信息
    chrome.runtime.sendMessage({ type: 'getTabInfo' });

    // 获取 Tabs 组件信息
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.type === "getTabInfo") {
        console.log("wjs: message.data", message.data);
        const { url, title, caseId } = message.data || {};
        setTitle(title);
        setCaseId(caseId)
      }
    });

    // 清理函数
    return () => { };
  }, [])

  return (
    <Sheet >
      <SheetTrigger asChild>
        <Badge className="cursor-pointer" variant="secondary">配置当前测试case</Badge>
      </SheetTrigger>
      <SheetContent className="z-50">
        <SheetHeader>
          <SheetTitle>编辑测试信息</SheetTitle>
          <SheetDescription>
            配置该用例所需的参数，完成后点击保存至本地
          </SheetDescription>
        </SheetHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="componentname" className="text-right">
              组件名
            </Label>
            <Input id="name" value={componentName} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="testname" className="text-right">
              用例标题
            </Label>
            <Input id="username" value={title} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="testcase" className="text-right">
              测试用例id
            </Label>
            <Input id="username" value={caseId} className="col-span-3" />
          </div>
        </div>

        {/* 配置 testID 映射表 */}
        <SelectTestID />

        {/* 配置 mock-env 环境 */}
        <SelectEnv />

        <SheetFooter>
          <SheetClose asChild>
            <Button type="submit" onClick={() => {
              chrome.runtime.sendMessage({
                type: 'save_case_cofig', data: {
                  title,
                  caseId,
                  componentName
                }
              });
            }}>保存至本地</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
