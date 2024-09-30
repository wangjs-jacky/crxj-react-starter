import { Button, ConfigProvider, notification, Space } from "antd";
import axios from "@/lib/axios";
import { useSelectModal } from "./SelectModal";
import { useEffect, useState } from "react";

const MockObject = {
  "全局模块": "global-testID",
  "中文姓名输入框": "booking_input_component_中文姓名_self",
  "联系电话输入框": "booking_input_component_联系电话_self",
  "证件有效期输入框": "booking_input_component_证件有效期",
  "证件签发日期输入框": "booking_input_component_证件签发日期",
  "国家/地区选择器": "booking_input_component_国家/地区_self",
  "出生地选择器": "booking_input_component_出生地",
  "证件号输入框": "booking_input_component_证件号_self",
  "体重输入框": "booking_input_component_体重（kg）_self",
  "身高输入框": "booking_input_component_身高（cm）_self",
  "鞋码输入框": "booking_input_component_鞋码（欧码）_self",
  "近视度数输入框": "booking_input_component_近视度数（度）_self",
  "联系手机输入框": "booking_input_component_联系手机_self",
  "Email输入框": "booking_input_component_Email_self",
  "签发地选择器": "booking_input_component_签发地",
  "出行人编辑浮层": "ta-passenger-出行人-edit-poplayer-wrapper",
  "选择出行人浮层": "ta-passenger-出行人-list-poplayer-wrapper",
  "出行人模块": "ta-passenger",
  "男icon": "crn_font_booking_iconType_boy",
  "女icon": "crn_font_booking_iconType_girl",
  "编辑按钮01": "traveler_item_edit_0",
  "编辑按钮02": "traveler_item_edit_1",
  "编辑按钮03": "traveler_item_edit_2",
  "出生地浮层": "select-poplayer-出生地（省份）",
  "签发地浮层": "select-poplayer-签发地（省份）",
  "国家/地区浮层": "select-poplayer-选择国家",
  "港澳签注类型浮层": "ta-select-poplayer",
  "港澳签注类型选择器": "booking_input_component_签证",
  "外露出行人回显编辑按钮01": "show_list_edit_icon_0",
  "中英文切换按钮": "ta-switch-language",
  "拍照识别按钮": "ta-ocr",
  "常旅列表页关闭按钮": "ta-passenger-list-poplayer-close",
  "外露出行人删除按钮": "traveler_single_delete_游客_0",
  "出行人选择01按钮": "ta-passenger-select_01",
  "去支付": "ta-footer-next-btn",
  "邀请好友填写": "ta-invite-btn",
  "邀请好友填写分享按钮": "ta-invite-share-btn",
  "通讯录按钮": "ta-address-book",
  "联系手机清除按钮": "contact_mobile_clear_btn",
  "邮箱清除按钮": "contact_email_clear_btn",
  "证件号重复半浮层模块": "ta-repeat-cardnum-poplayer",
  "证件号重复半浮层模块编辑按钮01": "ta-repeat-cardnum_0",
  "证件号重复半浮层模块编辑按钮02": "ta-repeat-cardnum_1",
  "常旅列表页保存按钮": "ta-passenger-list-save",
  "新增出行人浮层": "ta-passenger-出行人-edit-poplayer-wrapper",
  "返回按钮": "ta-passenger-edit-poplayer-back",
  "姓名填写说明按钮01": "crn_font_booking_iconType_help",
  "证件类型浮层": "ta-cardtype-poplayer",
  "证件切换按钮": "ta-cardtype",
  "风险公告模块": "ta-notice-tips",
  "风险公告浮层": "risk_pop_default",
  "出生地选择框": "booking_input_component_出生地"
};

export const HTATextExtractor = () => {
  const [api, contextHolder] = notification.useNotification();
  const [testIDMap, setTestIDMap] = useState({});
  const [selectOptions, setSelectOptions] = useState([]);
  const [modalApi, modalContextHolder] = useSelectModal({ selectOptions, testIDMap });

  useEffect(() => {
    const obj = Object.keys(testIDMap).map((item) => {
      return {
        value: item,
        label: `${item}-${testIDMap[item]}`
      }
    });
    setSelectOptions(obj);
  }, [testIDMap])

  useEffect(() => {
    const main = async () => {
      // 获取数据
      const response = await axios.get("/restapi/ttd/bff/qconfig");
      if (response) {
        setTestIDMap(MockObject);
        chrome.runtime.sendMessage({ command: "qconfig", data: MockObject })
      }
    }
    main();
  }, [])

  return (
    <ConfigProvider>
      {contextHolder}
      {/* 弹窗环境 */}
      {modalContextHolder}
      <Space>
        <Button type="primary" onClick={() => {
          chrome.runtime.sendMessage({ command: "copyToClipboard" }, (response) => {
            if (response) {
              const { notFoundTestID } = response || {};
              navigator.clipboard.writeText(response.copyText).then(() => {
                api[notFoundTestID ? "warning" : "success"]({
                  message: `测试文本已保存至剪贴板`,
                  description: notFoundTestID ? `🚨 在 Qconfig 平台未能找到如下占位符，请补全: ${notFoundTestID}` : "testID 已替换成功，尝试 Ctrl + V 黏贴",
                  placement: "bottomRight",
                  duration: 5
                })
              })
            }
          });
        }}>提取 BDD 测试文本</Button>
        <Button type="primary" onClick={() => {
          chrome.runtime.sendMessage({ command: "checkTestID" })
        }}>检测 testID</Button>
      </Space>
    </ConfigProvider>
  );
};