import { RequestConfig } from '@/../types/interface/config';
import { getHeader, mergeConfig, getRequestUrl, success, fail, getAxiosConfig } from './utils';
import instance from './instance';

/**
 * Get 请求
 * @param serviceName 请求地址 | 接口path
 * @param param 接口参数
 * @param extraConfig 自定义配置
 * @param version 接口版本
 */
export async function axiosGet(
  serviceName: string,
  param = {},
  extraConfig: RequestConfig = {},
  version: 1
): Promise<any> {
  instance.defaults.headers = {
    ...instance.defaults.headers,
    ...getHeader(version),
    ...extraConfig.headers,
  };
  const config = mergeConfig(extraConfig);
  const requestUrl = getRequestUrl(serviceName, config);
  const axiosConfig: any = getAxiosConfig(config, { params: param });
  try {
    const response: any = await instance.get(requestUrl, axiosConfig);
    return success(response, config);
  } catch (err) {
    return fail(err, config, requestUrl);
  }
}

/**
 * Post 请求
 * @param serviceName 请求地址 | 接口path
 * @param data 接口参数
 * @param extraConfig 自定义配置
 * @param version 接口版本
 */
export async function axiosPost(
  serviceName: string,
  data = {},
  extraConfig: RequestConfig = {},
  version: 1
): Promise<any> {
  instance.defaults.headers = {
    ...instance.defaults.headers,
    ...getHeader(version),
    ...extraConfig.headers,
  };
  const config = mergeConfig(extraConfig);
  const requestUrl = getRequestUrl(serviceName, config);
  const axiosConfig: any = getAxiosConfig(config);
  try {
    const response: any = await instance.post(requestUrl, data, axiosConfig);
    return success(response, config);
  } catch (err) {
    return fail(err, config, requestUrl);
  }
}

/**
 * Put 请求
 * @param serviceName 请求地址 | 接口path
 * @param data 接口参数
 * @param extraConfig 自定义配置
 * @param version 接口版本
 */
export async function axiosPut(
  serviceName: string,
  data = {},
  extraConfig: RequestConfig = {},
  version: 1
): Promise<any> {
  instance.defaults.headers = {
    ...instance.defaults.headers,
    ...getHeader(version),
    ...extraConfig.headers,
  };
  const config = mergeConfig(extraConfig);
  const requestUrl = getRequestUrl(serviceName, config);
  const axiosConfig: any = getAxiosConfig(config);
  try {
    const response: any = await instance.put(requestUrl, data, axiosConfig);
    return success(response, config);
  } catch (err) {
    return fail(err, config, requestUrl);
  }
}
