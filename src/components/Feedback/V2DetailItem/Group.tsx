import React from 'react';
import cs from 'classnames';
import styles from './index.module.less';
export interface V2DetailGroupProps {
  /**
   * @description 布局结构方向,可选:[horizontal, vertical]
   */
  direction?: string;
  /**
   * @description label宽度所占的字符数,此参数仅在`direction=horizontal` 下生效
   */
  labelLength?: string | number;
  /**
   * @description 样式类型，可选:[easy, base]
   * @default base
   */
  moduleType?: string | number;
  /**
   * @description 类
   */
  className?: any;
  /**
   * @description 样式
   */
  style?: React.CSSProperties;
  /**
   * @description 是否开启模块模式
   * @default false
   */
  block?: boolean;
  children?: React.ReactNode;
}
/**
* @description 便捷文档地址
* @see https://reactpc.lanhanba.net/components/feedback/v2detail-item#group-api
*/
const V2DetailGroup: React.FC<V2DetailGroupProps> = ({
  direction,
  labelLength,
  children,
  moduleType,
  className,
  block,
  style = {}
}) => {
  const recursiveMap = (children, fn) => {
    return React.Children.map(children, child => {
      if (!React.isValidElement(child)) {
        return child;
      }
      // @ts-ignore
      if (child?.props.children) {
        child = React.cloneElement(child, {
          // @ts-ignore
          children: recursiveMap(child?.props.children, fn)
        });
      }
      return fn(child);
    });
  };
  const cloneFn = (child) => {
    if (child?.type.displayName === 'V2DetailItem') {
      return React.cloneElement(child, {
        groupDirection: direction,
        groupLabelLength: labelLength,
        groupModuleType: moduleType
      });
    }
    return child;
  };
  return (
    <div className={cs(className, [
      block && styles.v2DetailGroupBlock
    ])} style={style}>
      {
        recursiveMap(children, cloneFn)
      }
    </div>
  );
};

export default V2DetailGroup;
