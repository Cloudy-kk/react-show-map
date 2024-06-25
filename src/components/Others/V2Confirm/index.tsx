import React from 'react';
import { Modal, ModalProps } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import styles from './index.module.less';
import cs from 'classnames';
import { isMicro } from '../../config-v2';
interface V2ConfirmProps extends ModalProps {
  /**
   * @description 点击确定回调
   */
  onSure?: Function;
  /**
   * @description 点击取消回调
   */
  onCancel?: (e: any) => void;
  /**
   * @description 标题
   * @default 提示
   */
  title?: string;
  /**
   * @description 内容
   */
  content?: React.ReactNode;
  /**
   * @description 确认按钮文字
   * @default 确定
   */
  okText?: string;
  /**
   * @description 取消按钮文字
   * @default 取消
   */
  cancelText?: string;
  /**
   * @description 是否使用无icon的modal样式
   * @default true
   */
  newStyle?: boolean;
  /**
   * @description 是否显示右上角关闭icon,newStyle为true时才生效
   * @default true
   */
  closable?: boolean;
  /**
   * @description 自定义图标, newStyle=false时生效
   * @default <ExclamationCircleOutlined />
   */
  icon?: React.ReactNode;
  /**
   * @description 弹窗宽度
   */
  width?: string | number;
  /**
   * @description 不需要底部按钮组
   */
  noFooter?: boolean;
  /**
   * @description 点击蒙层是否允许关闭
   */
  maskClosable?: boolean;
  /**
   * @description 层级参数
   */
  zIndex?: number;
}
/**
* @description 便捷文档地址
* @see https://reactpc.lanhanba.net/components/others/v2confirm
*/
export const V2Confirm = ({
  onSure = () => {},
  onCancel = () => {},
  icon = <ExclamationCircleOutlined />,
  title = '提示',
  content,
  okText = '确定',
  cancelText = '取消',
  closable = true,
  newStyle = true,
  width = '480px',
  noFooter = false,
  maskClosable = false,
  zIndex,
  ...props
}: V2ConfirmProps) => {
  const _modal = isMicro ? (window as any).microModal : Modal;
  const modal = _modal.confirm({
    width,
    title,
    content,
    icon: newStyle ? null : icon,
    okText,
    cancelText,
    maskClosable,
    closable: newStyle ? closable : false,
    onOk: () => onSure(modal),
    className: cs([
      newStyle && styles.V2Confirm,
      noFooter && styles.V2ConfirmNoFooter,
    ]),
    zIndex,
    onCancel: () => onCancel(modal),
    ...props,
  });
};
