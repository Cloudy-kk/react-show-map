import { catchNoErr } from '@/common/utils/catch-error';
import { axiosGet, axiosPost } from './request';

/* eslint-disable */
export function get(...args: any) {
  // @ts-ignore
  return catchNoErr(axiosGet(...args));
}

/* eslint-disable */
export function post(...args: any) {
  // @ts-ignore
  return catchNoErr(axiosPost(...args));
}

/* eslint-disable */
export function put(...args: any) {
  // @ts-ignore
  return catchNoErr(axiosPut(...args));
}
