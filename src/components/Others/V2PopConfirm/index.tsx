/*
* version: 当前版本2.16.0
*/
import React, { useState } from 'react';
import styles from './index.module.less';
import cs from 'classnames';
import { Button, Popover, Space } from 'antd';
import { CheckCircleFilled, CloseCircleFilled, InfoCircleFilled } from '@ant-design/icons';
import { useMethods } from '@lhb/hook';
import { TooltipPlacement } from 'antd/lib/tooltip';

interface V2PopConfirmProps {
  /**
   * @description 提示的类型，可选 info | success | error | warning
   * @default info
   */
  type?: string;
  /**
   * @description 提示的内容
   */
  content: string;
  /**
   * @description 额外插入的外层class
   */
  overlayClassName?: string;
  /**
   * @description 触发行为，可选 hover | focus | click | contextMenu
   * @default click
   */
  trigger?: string | string[];
  /**
   * @description 显示隐藏的回调
   */
  onOpenChange?: (open: boolean) => void;
  /**
   * @description 确定按钮文字
   */
  okText?: string;
  /**
   * @description 取消按钮文字
   */
  cancelText?: string;
  /**
   * @description 确定按钮点击回调
   */
  onOk?: Function;
  /**
   * @description 取消按钮点击回调
   */
  onCancel?: Function;
  /**
   * @description 取消按钮点击回调, 可选请参考https://4x.ant.design/components/tooltip-cn/#%E5%85%B1%E5%90%8C%E7%9A%84-API
   * @default topRight
   */
  placement?: TooltipPlacement;
  children: React.ReactNode;
}
/**
* @description 便捷文档地址
* @see https://reactpc.lanhanba.net/components/others/v2pop-confirm
*/
const V2PopConfirm: React.FC<V2PopConfirmProps> = ({
  children,
  content,
  overlayClassName,
  trigger = 'click',
  onOpenChange,
  type = 'info',
  okText = '确定',
  cancelText = '取消',
  onOk,
  onCancel,
  placement = 'topRight'
}) => {
  const [open, setOpen] = useState<boolean>(false);
  const methods = useMethods({
    onOpenChange() {
      onOpenChange?.(!open);
      setOpen(!open);
    },
    onCancel() {
      setOpen(false);
      onCancel?.();
    },
    onOk() {
      setOpen(false);
      onOk?.();
    }
  });
  const tipIcon = () => {
    switch (type) {
      case 'error':
        return <CloseCircleFilled className={cs(styles.V2PopConfirmIcon, styles.V2PopConfirmIconError)} />;
      case 'warning':
        return <InfoCircleFilled className={cs(styles.V2PopConfirmIcon, styles.V2PopConfirmIconWarning)} />;
      case 'success':
        return <CheckCircleFilled className={cs(styles.V2PopConfirmIcon, styles.V2PopConfirmIconSuccess)} />;
      default:
        return <InfoCircleFilled className={cs(styles.V2PopConfirmIcon, styles.V2PopConfirmIconInfo)} />;
    }
  };
  return (
    <Popover
      trigger={trigger}
      open={open}
      onOpenChange={methods.onOpenChange}
      overlayClassName={cs(styles.V2PopConfirm, overlayClassName)}
      placement={placement}
      content={
        <div>
          <div className={styles.V2PopConfirmTitle}>
            {tipIcon()}
            {content}
          </div>
          <Space className={styles.V2PopConfirmBtn} size={13}>
            <Button onClick={methods.onCancel}>{cancelText}</Button>
            <Button type='primary' onClick={methods.onOk}>{okText}</Button>
          </Space>
        </div>
      }
    >
      {children}
    </Popover>
  );
};
export default V2PopConfirm;
