import axios from 'axios';

export const instance = axios.create({
  baseURL: "https://www.fat1.qa.nt.tripqate.com/", // 动态配置基础 URL
  headers: {
    "Content-Type": "application/json",
    Accept: "*/*",
    Host: "api.coze.cn",
    Connection: "keep-alive",
  },
  timeout: 10000, // 设置请求超时时间为 10 秒
});

// 添加请求拦截器
instance.interceptors.request.use(
  config => {
    // 在发送请求之前做些什么
    return config;
  },
  error => {
    // 对请求错误做些什么
    return Promise.reject(error);
  }
);

// 添加响应拦截器
instance.interceptors.response.use(
  response => {
    // 对响应数据做点什么
    return response;
  },
  error => {
    // 对响应错误做点什么
    console.error('wjs: API call error:', error);
    return Promise.reject(error);
  }
);

export default instance;