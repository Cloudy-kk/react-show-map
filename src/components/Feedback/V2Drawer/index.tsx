import React, { useEffect, useImperativeHandle, useState } from 'react';
import cs from 'classnames';
import styles from './index.module.less';
import { Drawer } from 'antd';
import { DrawerProps } from 'antd/lib/drawer';
import IconFont from '../../Base/IconFont';
import { v4 } from 'uuid'; // 用来生成不重复的key
import { antPrefix, useDocument } from '../../config-v2';

export interface V2DrawerHandles {
  /**
   * @description 获取当前v2drawer下的内容dom节点
   */
  getBodyElement: () => HTMLElement;
}

export interface V2DrawerProps extends DrawerProps {
  /**
   * @description 额外插入的外层class
   */
  className?: string;
  /**
   * @description ref
  */
  onRef?: any; // 实例
  /**
   * @description slot插槽
   */
  children?: any;
}
/**
* @description 便捷文档地址
* @see https://reactpc.lanhanba.net/components/feedback/v2drawer
*/
const V2Drawer: React.FC<V2DrawerProps> = ({
  contentWrapperStyle = {},
  children,
  onRef,
  className,
  ...props
}) => {
  const documentReal = useDocument();
  const [keyName, setKeyName] = useState<string>();
  useImperativeHandle(onRef, () => ({
    getBodyElement: () => {
      return keyName && documentReal?.querySelector(`.${keyName} .${antPrefix}-drawer-body`);
    },
  }));
  useEffect(() => {
    if (!keyName) {
      setKeyName(`v2Drawer_${v4()}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <Drawer
      placement='right'
      className={cs(styles.v2Drawer, keyName, className)}
      closeIcon={<IconFont iconHref='pc-common-icon-ic_closeone'/>}
      contentWrapperStyle={{
        width: '70%',
        minWidth: '1008px',
        maxWidth: '1152px',
        ...contentWrapperStyle,
      }}
      {
        ...props
      }
    >
      {children}
    </Drawer>
  );
};

export default V2Drawer;
