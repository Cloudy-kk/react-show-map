import axios from 'axios';
import qs from 'qs';

// axios 默认配置
axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
axios.defaults.headers['x-client'] = process.env.xClient || 'location_console';
axios.defaults.headers['x-client-version'] = process.env.xClientVersion || '3.20.4';
axios.defaults.timeout = 60000; // 设置60s为超时

// 存储路由跳转时，需要cancel的接口
const requestMap = new Map();
const instance = axios.create();

/**
 * 请求拦截
 */
instance.interceptors.request.use((config: any) => {
  const { method } = config;
  if (method === 'get') {
    // https://juejin.cn/post/6995362880996507656
    // 如果是get请求，且params是数组类型如arr=[1,2]，则转换成arr=1&arr=2
    config.paramsSerializer = function (params: any) {
      return qs.stringify(params, { arrayFormat: 'repeat' });
    };
  }
  if (config.cancelToken) {
    const source = axios.CancelToken.source();
    config.axiosKey = config.url.split('?')[0];
    config.cancelToken = source.token;
    // 如果存在就未完结的就cancel
    if (requestMap.has(config.axiosKey)) {
      requestMap.get(config.axiosKey).cancel();
    }
    requestMap.set(config.axiosKey, source);
  }
  return config;
});

/**
 * 结果拦截
 */
instance.interceptors.response.use((response: any) => {
  const {
    config: { axiosKey },
  } = response;
  requestMap.delete(axiosKey);
  return response;
});

export default instance;
