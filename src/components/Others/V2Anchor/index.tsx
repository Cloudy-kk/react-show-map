import React, { MouseEvent, ReactNode } from 'react';
import styles from './index.module.less';
import cs from 'classnames';
import { Anchor, AnchorProps } from 'antd';
import { useDocument } from '../../config-v2';
export interface V2AnchorProps extends AnchorProps {
  /**
   * @description slot插槽
   */
  children?: ReactNode;
  /**
   * @description 额外插入的外层class
   */
  className?: string;
  /**
   * @description 是否使用id作为定位标准，默认true，设置false时，将通过className作为定位标准
   */
  useId?: boolean;
  /**
   * @description 样式
   */
  style?: React.CSSProperties;
}
/**
* @description 便捷文档地址
* @see https://reactpc.lanhanba.net/components/others/v2anchor
*/
const V2Anchor: React.FC<V2AnchorProps> = ({
  children,
  className,
  useId = true,
  style,
  ...props
}) => {
  const documentReal = useDocument();
  const hrefHandle = (
    e: MouseEvent<HTMLElement>,
    link: {
      title: ReactNode;
      href: string;
    }
  ) => {
    e.preventDefault();
    if (link.href) {
      const element = documentReal.querySelector(`${useId ? '#' : '.'}${link.href.replace('#', '')}`);
      element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };
  return (
    <div className={cs(styles.V2Anchor, className)} style={style}>
      <Anchor
        onClick={hrefHandle}
        { ...props }
      >
        {children}
      </Anchor>
    </div>
  );
};

export default V2Anchor;
