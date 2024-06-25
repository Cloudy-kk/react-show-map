/*
* version: 当前版本2.7.6
*/
import React, { ReactNode, useEffect, useRef, useState } from 'react';
import styles from './index.module.less';
import cs from 'classnames';
import ResizeObserver from 'resize-observer-polyfill';
import { useMethods } from '@lhb/hook';

export interface V2ContainerProps {
  /**
   * @description 样式
   */
  style?: React.CSSProperties;
  /**
   * @description 类名
   */
  className?: string;
  /**
   * @description 额外的插入内容
   */
  extraContent?: {
    top?: ReactNode,
    bottom?: ReactNode
  };
  /**
   * @description mainHeight 同步函数 （v2.4.8+）
   */
  emitMainHeight?: (h: number) => void;
  /**
   * @description slot插槽
   */
  children?: any;
}
/**
* @description 便捷文档地址
* @see https://reactpc.lanhanba.net/components/Data/v2container
*/
const V2Container: React.FC<V2ContainerProps> = ({
  style,
  extraContent,
  children,
  emitMainHeight,
  className,
}) => {
  const outerRef: any = useRef();
  const topRef: any = useRef();
  const bottomRef: any = useRef();
  const [mainHeight, setMainHeight] = useState();
  const methods = useMethods({
    initHeight() {
      if (!outerRef?.current) {
        return;
      }
      let height = outerRef.current.offsetHeight;
      if (extraContent?.top) {
        height = height - topRef.current.offsetHeight;
      }
      if (extraContent?.bottom) {
        height = height - bottomRef.current.offsetHeight;
      }
      if (height && height !== mainHeight) {
        setMainHeight(height);
        emitMainHeight && emitMainHeight(height);
      }
    }
  });
  useEffect(() => {
    let outerHeight = null;
    let topHeight = null;
    let bottomHeight = null;
    // 兼容IE9+，无需考虑性能问题，对整体渲染影响  (除ie外浏览器低于1%, IE 2%-3%)
    // 渲染速度一般低于20ms（正常渲染一帧是16.6ms）
    const myObserver = new ResizeObserver((entries) => {
      window.requestAnimationFrame(() => {
        for (const entry of entries) {
          if (entry.target.className.indexOf('v2-container-outer') !== -1 && outerHeight !== entry.contentRect.height) {
            outerHeight = entry.contentRect.height;
            methods.initHeight();
          } else if (entry.target.className === 'v2-container-top' && topHeight !== entry.contentRect.height) {
            topHeight = entry.contentRect.height;
            methods.initHeight();
          } else if (entry.target.className === 'v2-container-bottom' && bottomHeight !== entry.contentRect.height) {
            bottomHeight = entry.contentRect.height;
            methods.initHeight();
          }
        }
      });
    });
    // 如果整个项目加入了动效，如以下代码
    // <TransitionGroup component={null}>
    //      <CSSTransition key={location.pathname} classNames='fade' timeout={300}></CSSTransition>
    // </TransitionGroup>
    // 需要设置 timeout 300 动效完成后进行，如果没有的话，可以不加setTimeout
    const timer = setTimeout(() => {
      myObserver.observe(outerRef.current);
      myObserver.observe(topRef.current);
      myObserver.observe(bottomRef.current);
    }, 300);
    return () => {
      clearTimeout(timer);
      myObserver.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (<div ref={outerRef} className={cs('v2-container-outer', styles.v2Container, className)} style={style}>
    <div className='v2-container-top' ref={topRef}>
      {extraContent?.top}
    </div>
    <div className={styles.selfAdaption}>
      {
        mainHeight && React.Children.map(children, (child) => {
          if (typeof child?.type === 'string') {
            return child;
          } else {
            return React.cloneElement(child as React.ReactElement, {
              mainHeight,
            });
          }
        })
      }
    </div>
    <div className='v2-container-bottom' ref={bottomRef}>
      {extraContent?.bottom}
    </div>
  </div>);
};

export default V2Container;
