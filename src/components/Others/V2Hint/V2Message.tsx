import React from 'react';
import './index.global.less';
import cs from 'classnames';
import { message } from 'antd';
import { ArgsProps } from 'antd/lib/message';
import { isObject, isUndef } from '@lhb/func';
import { v4 } from 'uuid'; // 用来生成不重复的key
import { CloseOutlined } from '@ant-design/icons';
import { isMicro } from '../../config-v2';
const _message = isMicro ? (window as any).microMessage : message;
export interface V2MessageConfigProps extends ArgsProps {
  /**
   * @description 额外的可操作插槽
   */
  extra?: React.ReactNode;
  /**
   * @description 是否显示关闭按钮
   * @default true
   */
  showClose?: boolean;
}
export interface V2MessageProps {
  /**
   * @description 类型
   */
  type?: string;
  /**
   * @description 参数
   */
  config: React.ReactNode | V2MessageConfigProps;
}

const fn: React.FC<V2MessageProps> = ({
  type = 'info',
  config,
}) => {
  const key = v4();
  let _config:any;
  if (isObject(config)) {
    _config = {
      ...config,
      key,
      showClose: isUndef((config as V2MessageConfigProps).showClose) ? true : (config as V2MessageConfigProps).showClose
    };
  } else {
    _config = {
      content: config,
      key,
      showClose: true
    };
  }
  // 包裹close或者查看详情slot
  const content = (
    <span className='v2MessageContent'>
      {_config.content}
      {
        _config.extra && (<span className='v2MessageExtra'>{_config.extra}</span>)
      }
      {
        _config.showClose && (
          <span className='v2MessageClose' onClick={() => _message.destroy(key)}>
            <CloseOutlined style={{ fontSize: '12px' }}/>
          </span>
        )
      }
    </span>
  );
  _config.content = content;
  const _className = cs('v2HintMessage', _config.className);
  return _message[type]({
    ..._config,
    className: _className
  });
};

const success: React.FC<React.ReactNode | V2MessageConfigProps> = (config) => {
  return fn({ type: 'success', config });
};

const info: React.FC<React.ReactNode | V2MessageConfigProps> = (config) => {
  return fn({ type: 'info', config });
};

const error: React.FC<React.ReactNode | V2MessageConfigProps> = (config) => {
  return fn({ type: 'error', config });
};

const warning: React.FC<React.ReactNode | V2MessageConfigProps> = (config) => {
  return fn({ type: 'warning', config });
};

const open: React.FC<React.ReactNode | V2MessageConfigProps> = (config) => {
  return fn({ type: 'open', config });
};


interface V2MessageComponent {
  success: typeof success;
  info: typeof info;
  error: typeof error;
  warning: typeof warning;
  open: typeof open;
  destroy: typeof _message.destroy;
}
/**
* @description 便捷文档地址
* @see https://reactpc.lanhanba.net/components/others/v2hint
*/
const V2Message: V2MessageComponent = () => {
  return <></>;
};

V2Message.success = success;
V2Message.info = info;
V2Message.error = error;
V2Message.warning = warning;
V2Message.open = open;
V2Message.destroy = _message.destroy;
export default V2Message;
