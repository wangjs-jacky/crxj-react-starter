import { Button, ConfigProvider, notification, Space, Tooltip } from "antd";
import axios from "@/lib/axios";
import { useSelectModal } from "./SelectModal";
import { useEffect, useState } from "react";
import { HTA_TESTID_MAP } from "@/constant";
import { CircleAlert } from "lucide-react";

const MockObject = {
  "全局模块": "global-testID",
  "中文姓名输入框": "booking_input_component_中文姓名_self",
  "联系电话输入框": "booking_input_component_联系电话_self",
  "证件有效期选择框": "booking_input_component_证件有效期",
  "证件签发日期选择框": "booking_input_component_证件签发日期",
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
  "签证选择器": "booking_input_component_签证",
  "出行人模块": "ta-passenger",
  "男icon": "crn_font_booking_iconType_boy",
  "女icon": "crn_font_booking_iconType_girl",
  "出生地选择框": "booking_input_component_出生地",
  "新增出行人浮层": "ta-passenger-出行人-edit-poplayer-wrapper",
  "出生地浮层": "select-poplayer-出生地（省份）",
  "签发地浮层": "select-poplayer-签发地（省份）",
  "国家/地区浮层": "select-poplayer-选择国家",
  "港澳签注类型浮层": "ta-select-poplayer",
  "港澳签注类型选择器": "booking_input_component_签证",
  "选择出行人浮层": "ta-passenger-出行人-list-poplayer-wrapper",
  "外露出行人回显编辑按钮01": "show_list_edit_icon_0",
  "编辑按钮01": "traveler_item_edit_0",
  "编辑按钮02": "traveler_item_edit_1",
  "编辑按钮03": "traveler_item_edit_2",
  "证件类型浮层": "ta-cardtype-poplayer",
  "证件切换按钮": "ta-cardtype",
  "风险公告模块": "ta-notice-tips",
  "风险公告浮层": "risk_pop_default",
  "姓名填写说明按钮01": "ta-input-label-explain-中文姓名",
  "中英文切换按钮": "ta-switch-language",
  "拍照识别按钮": "ta-ocr",
  "新增出行人返回按钮": "ta-passenger-edit-poplayer-back",
  "常旅列表页关闭按钮": "ta-passenger-list-poplayer-close",
  "外露出行人游客删除按钮01": "traveler_single_delete_游客_0",
  "外露出行人游客删除按钮02": "traveler_single_delete_游客_1",
  "出行人选择01按钮": "ta-passenger-select_0",
  "出行人选择02按钮": "ta-passenger-select_1",
  "出行人选择03按钮": "ta-passenger-select_2",
  "去支付": "ta-footer-next-btn",
  "邀请好友填写": "ta-invite-btn",
  "邀请好友填写按钮": "ta-invite-btn",
  "通讯录按钮": "ta-address-book",
  "联系手机清除按钮": "contact_mobile_clear_btn",
  "邮箱清除按钮": "contact_email_clear_btn",
  "证件号重复半浮层模块": "ta-repeat-cardnum-poplayer",
  "证件号重复半浮层模块编辑按钮01": "ta-repeat-cardnum_0",
  "证件号重复半浮层模块编辑按钮02": "ta-repeat-cardnum_1",
  "常旅列表页保存按钮": "ta-passenger-list-save",
  "增加份数01": "skuresource_0_plus_icon",
  "增加份数02": "skuresource_1_plus_icon",
  "增加份数03": "skuresource_2_plus_icon",
  "SKU模块": "act-booking-sku",
  "附加售卖增加icon01": "additionalSale_0_step_add",
  "附加售卖增加icon02": "additionalSale_1_step_add",
  "附加售卖增加icon03": "additionalSale_2_step_add",
  "附加售卖减少icon01": "additionalSale_0_step_minus",
  "附加售卖减少icon02": "additionalSale_1_step_minus",
  "附加售卖减少icon03": "additionalSale_2_step_minus",
  "附加售卖份数输入框01": "additionalSale_0_step_input",
  "附加售卖份数输入框02": "additionalSale_1_step_input",
  "附加售卖份数输入框03": "additionalSale_2_step_input",
  "新增游客icon": "show_add_icon_only",
  "未选中出行人按钮01": "traveler_item_unselect_traveler_0",
  "未选中出行人按钮02": "traveler_item_unselect_traveler_1",
  "未选中投保人按钮01": "traveler_item_unselect_policyholder_0",
  "未选中投保人按钮02": "traveler_item_unselect_policyholder_1",
  "未选中被保人按钮01": "traveler_item_unselect_insured_0",
  "未选中被保人按钮02": "traveler_item_unselect_insured_1",
  "未选中附加售卖按钮01": "traveler_item_unselect_additional_0",
  "未选中附加售卖按钮02": "traveler_item_unselect_additional_1",
  "中文姓名填写说明按钮": "ta-input-name-tips",
  "必选附加售卖按钮": "must-additional-sale-info",
  "车型说明浮层关闭按钮": "车型说明_poplayer_wrapper_layer",
  "车型说明浮层": "ta-additional-detail-poplayer",
  "姓名说明浮层关闭按钮": "ta-name-desc-poplayer-close",
  "姓名说明浮层": "ta-name-desc-poplayer",
  "常旅列表出行人01": "traveler_item_select_0",
  "常旅列表出行人02": "traveler_item_select_1",
  "选中出行人按钮01": "traveler_item_one_select_traveler_0",
  "单选未选中出行人按钮": "traveler_item_one_unselect_traveler_1",
  "单选未选中投保人按钮": "traveler_item_one_unselect_policyholder_1",
  "单选未选中被保人按钮": "traveler_item_one_unselect_insured_1",
  "单选未选中附加售卖按钮": "traveler_item_one_unselect_additional_1",
  "外露出行人成人删除按钮01": "traveler_single_delete_成人_0",
  "外露出行人成人删除按钮02": "traveler_single_delete_成人_1",
  "外露出行人儿童删除按钮01": "traveler_single_delete_儿童_0",
  "外露出行人儿童删除按钮02": "traveler_single_delete_儿童_1",
  "外露出行人婴儿删除按钮01": "traveler_single_delete_婴儿_0",
  "外露出行人婴儿删除按钮02": "traveler_single_delete_婴儿_1",
  "外露出行人成人选择框": "traveler_single_unselect_成人",
  "外露出行人儿童选择框": "traveler_single_unselect_儿童",
  "外露出行人婴儿选择框": "traveler_single_unselect_婴儿",
  "外露未选中出行人按钮01": "show_list_text_normal_0",
  "外露未选中出行人按钮02": "show_list_text_normal_1",
  "外露已选回显编辑按钮01": "traveler_single_editline_icon_0",
  "外露已选回显编辑按钮02": "traveler_single_editline_icon_1",
  "联系手机替换气泡关闭按钮": "ta-mobile-exchange-tips-close"
};

export const HTATextExtractor = () => {
  const [api, contextHolder] = notification.useNotification();
  const [testIDMap, setTestIDMap] = useState({});
  const [selectOptions, setSelectOptions] = useState([]);
  const [modalApi, modalContextHolder] = useSelectModal({ selectOptions, testIDMap });
  // const [moduleId, setModuleId] = useState("");

  useEffect(() => {
    const obj = Object.keys(testIDMap).map((item) => {
      return {
        value: item,
        label: `${item}-${testIDMap[item]}`
      }
    });
    setSelectOptions(obj);
  }, [testIDMap])

  // useEffect(() => {
  //   // 在 background.js 中获取 url 信息
  //   chrome.runtime.sendMessage({ type: 'getTabInfo' });

  //   // 设置 moduleId 信息
  //   chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  //     if (message.type === "getTabInfo") {
  //       const { moduleId } = message.data || {};
  //       setModuleId(moduleId);
  //     }
  //   });
  // }, []);

  useEffect(() => {
    const main = async () => {
      // 获取数据
      const response = await axios.get("/restapi/ttd/bff/qconfig");
      const pageKey = document.querySelectorAll("div.ant-breadcrumb > span a")?.[3]?.title;
      if (response) {
        const { data } = response;
        const { Response } = data || {};
        const _data = Response[HTA_TESTID_MAP] || {};
        console.log("wjs: pageKey", pageKey, _data[pageKey]);
        setTestIDMap(_data[pageKey] || MockObject);
        chrome.runtime.sendMessage({ command: "qconfig", data: _data[pageKey] || MockObject })
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
        }}>生成 test 代码</Button>
        <Button type="primary" onClick={() => {
          chrome.runtime.sendMessage({ command: "down" })
        }}>下载脚本</Button>
        <Tooltip placement="right" title="您可以在 chrome://settings/downloads 中设置: 关闭下载前询问每个文件的保存位置">
          <CircleAlert size={18} style={{ display: "flex", cursor: "pointer" }} />
        </Tooltip>
      </Space>
    </ConfigProvider>
  );
};