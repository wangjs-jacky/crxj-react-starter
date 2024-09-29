import axios from 'axios';

export const instance = axios.create({
  baseURL: "https://www.trip.com/", // 动态配置基础 URL
  headers: {
    "Content-Type": "application/json",
    Accept: "*/*",
    Host: "api.coze.cn",
    Connection: "keep-alive",
  },
  timeout: 10000, // 设置请求超时时间为 5 秒
});


export default instance;