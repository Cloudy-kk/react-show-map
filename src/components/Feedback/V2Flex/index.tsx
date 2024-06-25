import React, { CSSProperties, ComponentType, FC, ReactNode, forwardRef } from 'react';
import classNames from 'classnames';
import styles from './index.module.less';
import { camelize, capitalize, isNotEmpty } from '@lhb/func';

export type SizeType = 'small' | 'middle' | 'large' | undefined;
export type AnyObject = Record<PropertyKey, any>;
export type CustomComponent<P = AnyObject> = ComponentType<P> | string;

export function isPresetSize(size?: SizeType | string | number): size is SizeType {
  return ['small', 'middle', 'large'].includes(size as string);
}

export interface V2FlexProps<P = AnyObject> {
  /**
   * @description 额外插入的外层class
   */
  className?: string;
  /**
   * @description 额外的外层样式
   */
  style?: React.CSSProperties;
  /** flex 主轴的方向是否垂直，使用 flex-direction: column */
  vertical?: boolean;
  /** 设置元素单行显示还是多行显示，参考 flex-wrap <a href="https://developer.mozilla.org/zh-CN/docs/Web/CSS/flex-wrap">点击此处</a> */
  wrap?: CSSProperties['flexWrap'];
  /** 设置元素在主轴方向上的对齐方式，参考 justify-content https://developer.mozilla.org/zh-CN/docs/Web/CSS/justify-content */
  justify?: CSSProperties['justifyContent'];
  /** 设置元素在交叉轴方向上的对齐方式，参考 align-items https://developer.mozilla.org/zh-CN/docs/Web/CSS/align-items */
  align?: CSSProperties['alignItems'];
  /** flex CSS 简写属性，参考 flex https://developer.mozilla.org/zh-CN/docs/Web/CSS/flex */
  flex?: CSSProperties['flex'];
  /** 设置网格之间的间隙	small | middle | large | string | number */
  gap?: CSSProperties['gap'] | SizeType;
  /** 自定义元素类型，默认 div */
  component?: CustomComponent<P>;
  children: ReactNode;
}

// 转换样式名为首字母大写
const transformClassStr = (str: string) => {
  if (isNotEmpty(str)) {
    return capitalize(camelize(String(str || '')));
  } else {
    return str || '';
  }
};

/**
* @description 便捷文档地址
* @see https://reactpc.lanhanba.net/components/feedback/v2flex
*/
const V2Flex:FC<V2FlexProps> = forwardRef((props, ref) => {
  const {
    className,
    style,
    flex,
    gap,
    children,
    vertical = false,
    component: Component = 'div',
    ...othersProps
  } = props;

  /* state */

  const mergedCls = classNames(
    className,
    styles.V2Flex,
    {
      // [`flex-rtl`]: ctxDirection === 'rtl',
      [styles[transformClassStr(`v2-flex-gap-${gap}`)]]: isPresetSize(gap),
      [styles[transformClassStr('v2-flex-vertical')]]: vertical,
    },
    ...(othersProps && Object.keys(othersProps).length ? Object.entries(othersProps).filter(item => ['justify', 'wrap', 'align'].includes(item[0])).map(item => styles[transformClassStr(`v2-flex-${item[0]}-${item[1]}`)]) : [])
  );

  const mergedStyle: CSSProperties = { ...style };
  if (flex) {
    mergedStyle.flex = flex;
  }

  if (gap && !isPresetSize(gap)) {
    mergedStyle.gap = gap;
  }

  /* hooks */

  /* methods */

  return (<Component
    ref={ref}
    className={mergedCls}
    style={mergedStyle}
  >
    {children}
  </Component>);
});

export default V2Flex;
