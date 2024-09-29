import { Button, notification, Space } from "antd";
import axios from "@/lib/axios";

const parseData = (data) => {
  if (Object.prototype.toString.call(data) === '[object Object]') {
    Object.keys(data).forEach(k => {
      try {
        data[k] = JSON.parse(data[k]);
      } catch (e) { }
    })
  }
  return data
}

export const HTATextExtractor = () => {
  const [api, contextHolder] = notification.useNotification();
  return (
    <>
      {contextHolder}
      <Space>
        <Button type="primary" onClick={() => {
          chrome.runtime.sendMessage({ command: "copyToClipboard" }, (response) => {
            if (response) {
              const { notFoundTestID } = response || {};
              api.info({
                message: `剪贴板已保存`,
                description: notFoundTestID ? `未找到以下占位符，请补全:${notFoundTestID}` : "已保存到剪贴板",
                placement: "topRight",
                duration: 10
              })
            }
          });
        }}>生成 test 代码</Button>
        <Button type="primary" onClick={async () => {
          // chrome.runtime.sendMessage({ command: "request" }, (response) => {
          //   console.log("wjs: response", response);
          // })

          const response = await axios.get("/restapi/ttd/bff/qconfig");
          console.log("wjs: request", response.data?.Response);
        }}>检测 testID</Button>
      </Space>
    </>
  );
};