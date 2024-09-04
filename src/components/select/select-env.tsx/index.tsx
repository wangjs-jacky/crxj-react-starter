import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

const mockMap = {
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
  "mock-env-2": `// 2- 导入 product-detail 公共 mock 配置
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
`}


export const SelectEnv = () => {
  const [mockEnv, setMockEnv] = useState('mock-env-1');
  const [mockEnvValue, setMockEnvValue] = useState(mockMap["mock-env-1"]);

  return (
    <>
      <SheetHeader>
        <SheetTitle>环境配置</SheetTitle>
      </SheetHeader>
      <Select onValueChange={(mockEnv) => {
        setMockEnv(mockEnv)
        setMockEnvValue(mockMap[mockEnv])
      }} value={ mockEnv }>
        <SelectTrigger className="w-full my-2" >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {Object.keys(mockMap).map((key, index) => {
            return <SelectItem key={index} value={key}>{key}</SelectItem>
          })}
        </SelectContent>
      </Select>
      <Textarea rows={20} className="my-2" value={mockEnvValue}
        onChange={(e) => {
          setMockEnvValue(e.target.value)
        }} />
    </>
  )
}