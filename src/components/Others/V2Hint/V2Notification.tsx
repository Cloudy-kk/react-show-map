import React from 'react';
import './index.global.less';
import cs from 'classnames';
import { ArgsProps } from 'antd/lib/notification';
import { notification } from 'antd';
import { isMicro } from '../../config-v2';
const _notification = isMicro ? (window as any).microNotification : notification;
export interface V2NotificationProps {
  /**
   * @description 类型
   */
  type?: string;
  /**
   * @description 参数
   */
  config: ArgsProps;
}

const fn: React.FC<V2NotificationProps> = ({
  type = 'info',
  config
}) => {
  const _className = cs('v2HintNotification', config.className);
  return _notification[type]({
    ...config,
    placement: config.placement || 'top',
    className: _className
  });
};

const success: React.FC<ArgsProps> = (config) => {
  return fn({ type: 'success', config });
};

const info: React.FC<ArgsProps> = (config) => {
  return fn({ type: 'info', config });
};

const error: React.FC<ArgsProps> = (config) => {
  return fn({ type: 'error', config });
};

const warning: React.FC<ArgsProps> = (config) => {
  return fn({ type: 'warning', config });
};

const open: React.FC<ArgsProps> = (config) => {
  return fn({ type: 'open', config });
};


interface V2NotificationComponent {
  success: typeof success;
  info: typeof info;
  error: typeof error;
  warning: typeof warning;
  open: typeof open;
  close: typeof _notification.close;
  destroy: typeof _notification.destroy;
}
/**
* @description 便捷文档地址
* @see https://reactpc.lanhanba.net/components/others/v2hint
*/
const V2Notification: V2NotificationComponent = () => {
  return <></>;
};

V2Notification.success = success;
V2Notification.info = info;
V2Notification.error = error;
V2Notification.warning = warning;
V2Notification.open = open;
V2Notification.close = _notification.close;
V2Notification.destroy = _notification.destroy;
export default V2Notification;
