import { Button, notification, Space } from "antd";
// const qconfig = require("@ctrip/node-vampire-qconfig");
// import qconfig from "@ctrip/node-vampire-qconfig"
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

// configFileName，文件名，格式为：appID：fileName，当传入的文件名不包含 appID 时，默认为当前 appID 下文件
const getConfig = async (configFileName, qconfigData = {}) => {
  let config = qconfig.getConfig(configFileName);
  let content = await config.get();
  console.log("wjs: content", content);
  content = parseData(content);

  config.on("change", data => {
    let t = data ? parseData(data.configData) : {};
    Object.assign(qconfigData, t);
  });
  return Object.assign(qconfigData, content);
};

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


/*
async () => {
          // //处理中间件初始化业务
          // let qconfigData = {};
          // let businessKey = `100029097:ttd-smart-business.properties`;
          // await getConfig(businessKey, qconfigData);
          // // let config = qconfig.getConfig(configFileName);

          const response = await axios.post("/soa2/12446/QConfig.json", { "head": { "cid": "09034161417416248124", "ctok": "", "cver": "1.0", "lang": "01", "sid": "8888", "syscode": "09", "auth": "", "extension": [] }, "KeyList": ["comment_tooltips"] });
          return response.data;
        }

*/ 