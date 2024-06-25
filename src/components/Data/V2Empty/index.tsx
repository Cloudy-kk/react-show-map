/*
* version: 当前版本2.11.5
*/
import React from 'react';
import styles from './index.module.less';
import cs from 'classnames';
import { images, texts } from './config';
export interface V2EmptyProps {
  /**
   * @description 缺省组件类型
   * @type nothing | maintain | fail | notFound | search | permissions
   */
  type?: string;
  /**
   * @description 缺省图样式
   */
  imgStyle?: React.CSSProperties;
  /**
   * @description 是否上下左右居中，如果是，则V2EmptyWrapper width:100%,height:100%，V2Empty上下左右居中
   */
  centerInBlock?: boolean;
  /**
   * @description 自定义图片
   */
  customImg?: string;
  /**
   * @description 自定义提示
   */
  customTip?: React.ReactNode;
  /**
   * @description 是否需要描述
   */
  useDescription?: boolean;
  /**
   * @description 额外插入的外层class
   */
  className?: string;
}
/**
* @description 便捷文档地址
* @see https://reactpc.lanhanba.net/components/Data/v2empty
*/
const V2Empty: React.FC<V2EmptyProps> = ({
  type = 'nothing',
  imgStyle,
  centerInBlock = false,
  customImg,
  customTip,
  useDescription = true,
  className
}) => {
  return (
    <div className={cs([
      styles.V2EmptyWrapper,
      centerInBlock && styles.V2EmptyWrapperCenter,
      className
    ])}>
      <div className={cs(styles.V2Empty, 'v2Empty')}>
        <img className={cs([styles.V2EmptyImage, 'v2EmptyImage', styles[`V2Empty_${type}`]])} style={imgStyle} src={customImg || images[type]} alt='缺省图' />
        {
          useDescription ? <div className={cs(styles.V2EmptyText, 'v2EmptyText')}>{customTip || texts[type]}</div> : undefined
        }
      </div>
    </div>
  );
};

export default V2Empty;
