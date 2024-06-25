/*
* version: 当前版本2.14.7
*/
import React from 'react';
import styles from './index.module.less';
import cs from 'classnames';
import IconFont from '../../Base/IconFont';

export interface V2TagProps {
  /**
   * @description 颜色系, 可选[blue, lightBlue, orange, green, cyan, grey, purple, red]
   * @default blue
   */
  color?: 'blue' | 'lightBlue' | 'orange' | 'green' | 'cyan' | 'grey' | 'purple' | 'red' | string; // 避免在一些动态入参的场景中报错，导致部署失败
  /**
   * @description icon，设置这个值后，color就会失效
   */
  icon?: string;
  /**
   * @description 点击事件
   */
  onClick?: Function;
  /**
   * @description 额外插入的外层class
   */
  className?: string;
  /**
   * @description 额外插入的外层样式
   */
  style?: React.CSSProperties;
  /**
   * @description slot插槽
   */
  children?: any;
}
/**
* @description 便捷文档地址
* @see https://reactpc.lanhanba.net/components/Data/v2tag
*/
const V2Tag: React.FC<V2TagProps> = ({
  children,
  color = 'blue',
  icon,
  onClick,
  className,
  style = {}
}) => {
  return (
    <span
      className={cs(styles.v2Tag, styles[`v2Tag-${color}`], icon ? styles.v2TagIcon : '', className)}
      onClick={() => onClick && onClick()}
      style={style}
    >
      {
        icon ? <IconFont
          className={styles.v2DetailCopy}
          iconHref={icon}
        /> : children
      }
    </span>
  );
};

export default V2Tag;
