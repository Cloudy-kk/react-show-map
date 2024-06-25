import React, { ReactNode, isValidElement } from 'react';
import cs from 'classnames';
import styles from './index.module.less';
import { Tabs } from 'antd';
import type { TabsProps } from 'antd';

export interface V2TabsProps extends Omit<TabsProps, 'type' | 'tabBarExtraContent'> {
  /**
   * @description 款式，可选 ['line', 'card', 'fullCard', 'editable-card']
   * @default line
   */
  type?: string;
  /**
   * @description tab bar 上额外的元素
   */
  tabBarExtraContent?: ReactNode | { left?: ReactNode, right?: ReactNode, middle?: ReactNode };
}
/**
* @description 便捷文档地址
* @see https://reactpc.lanhanba.net/components/Data/v2tabs
*/
const V2Tabs: React.FC<V2TabsProps> = ({
  className,
  type = 'line',
  tabBarExtraContent,
  ...props
}) => {
  const getType = (type) => {
    if (type === 'fullCard' || type === 'card') {
      return 'card';
    } else if (type === 'editable-card') {
      return 'editable-card';
    }
    return 'line';
  };
  // 如果使用了middle，就使用自定义布局，否则直接沿用ant的
  // @ts-ignore
  if (typeof tabBarExtraContent === 'object' && !isValidElement(tabBarExtraContent) && 'middle' in tabBarExtraContent) {
    return (
      <div className={styles.v2CustomTabs}>
        <div className={styles.v2CustomTabsLeft}>
          <div className={styles.v2CustomTabsLeftInner}>
            <V2Tabs
              className={cs([
                styles.v2Tabs,
                type === 'card' && styles.v2TabsCard,
                type === 'fullCard' && styles.v2TabsFullCard,
                typeof props.animated === 'boolean' && !props.animated && styles.v2TabsNoAnimated,
                className
              ])}
              popupClassName={styles.v2TabsPopup}
              type={getType(type)}
              tabBarExtraContent={tabBarExtraContent.left ? { left: tabBarExtraContent.left } : {}}
              {...props}
            />
            { tabBarExtraContent.middle }
          </div>
        </div>
        {
          tabBarExtraContent.right && (
            <div className={styles.v2CustomTabsRight}>
              { tabBarExtraContent.right }
            </div>
          )
        }
      </div>
    );
  } else {
    return (<Tabs
      className={cs([
        styles.v2Tabs,
        type === 'card' && styles.v2TabsCard,
        type === 'fullCard' && styles.v2TabsFullCard,
        typeof props.animated === 'boolean' && !props.animated && styles.v2TabsNoAnimated,
        className
      ])}
      popupClassName={styles.v2TabsPopup}
      type={getType(type)}
      tabBarExtraContent={tabBarExtraContent}
      {...props}
    />);
  }
};

export default V2Tabs;
