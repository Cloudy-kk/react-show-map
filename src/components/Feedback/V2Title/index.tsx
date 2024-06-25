/*
* version: 当前版本2.14.7
*/
import React, { ReactNode } from 'react';
import cs from 'classnames';
import styles from './index.module.less';
import IconFont from '../../Base/IconFont';
import copy from 'copy-to-clipboard';
import { Tooltip, TooltipProps } from 'antd';

export interface V2TitleProps {
  /**
   * @description 标题类型, 可选[H1: 18px, H2: 16px, H3: 14px]
   * @default H1
   */
  type?: string;
  /**
   * @description 内容
   */
  text?: string;
  /**
   * @description 是否可以复制
   * @default false
   */
  needCopy?: boolean;
  /**
   * @description 右侧插槽
   */
  extra?: ReactNode;
  /**
   * @description 额外插入的外层class
   */
  className?: string;
  /**
   * @description 额外插入的外层id
   */
  id?: string;
  /**
   * @description 额外的外层样式
   */
  style?: React.CSSProperties;
  /**
   * @description 是否显示左侧分隔符
   */
  divider?: boolean;
  /**
   * @description slot插槽
   */
  children?: any;
  /**
   * @description 提示文字
   */
  tips?: string | ReactNode;
  /**
   * @description tips的tooltip的更多配置，详情请查看 https://ant.design/components/tooltip-cn
   */
  tipsTooltipConfig?: TooltipProps;
}
/**
* @description 便捷文档地址
* @see https://reactpc.lanhanba.net/components/feedback/v2title
*/
const V2Title: React.FC<V2TitleProps> = ({
  type = 'H1',
  text = '',
  needCopy,
  children,
  extra,
  className,
  style = {},
  id,
  divider = false,
  tips,
  tipsTooltipConfig = {}
}) => {
  const tipsTooltipProps: any = {
    placement: 'top',
    color: '#333333',
    title: tips,
    ...tipsTooltipConfig
  };
  return (
    <div id={id} className={cs(styles.v2TitleOuter, 'v2TitleOuter', className)} style={style}>
      <div className={cs(styles.v2Title, 'v2Title', styles[`v2Title${type}`])}>
        {
          divider && <div className={cs(styles.divider)}></div>
        }
        {children || text}
        {
          needCopy && <IconFont
            className={cs(styles.v2TitleCopy)}
            iconHref='pc-common-icon-ic_copy'
            functionality
            onClick={() => copy(text)}
          />
        }
        {
          tips && <Tooltip {...tipsTooltipProps}>
            <span>
              <IconFont
                iconHref='pc-common-icon-ic_info'
                style={{
                  marginLeft: '4px',
                  color: '#ccc',
                  fontSize: type === 'H3' ? '14px' : '16px'
                }}/>
            </span>
          </Tooltip>
        }
      </div>
      <div className={cs(styles.v2TitleExtra, 'v2TitleExtra')}>
        {extra}
      </div>
    </div>
  );
};

export default V2Title;
