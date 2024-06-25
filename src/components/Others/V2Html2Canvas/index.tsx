import React, { ForwardedRef, forwardRef, useImperativeHandle, useMemo, useRef, useState } from 'react';
import cs from 'classnames';
import styles from './index.module.less';
import html2canvas from 'html2canvas';
export interface V2Html2CanvasHandles {
  /**
   * @description 绘制canvas并返回base64数据
   */
  drawCanvas: (opts?: any) => any;
}
export interface V2Html2CanvasProps {
  /**
   * @description 额外插入的外层class
   */
  className?: string;
  /**
   * @description 样式
   */
  style?: React.CSSProperties;
  /**
   * @description 是否需要隐藏合成内容的载体
   * @default false
   */
  hide?: boolean;
  /**
   * @description 选项卡头显示内容
   */
  children?: React.ReactNode;
  /**
   * @description 图片数据流
   * @default '''
   */
  data64?: string;
  /**
   * @description 提示栏，设置false时，可以移除提示，设置ReactNode、HTMLElement、String都可以替换提示内容
   * @default 点击鼠标右键以保存图片
   */
  tip?: React.ReactNode | boolean;
  /**
   * @description 是否只想要获取生成的canvas的base64，不需要图片预览
   * @default false
   */
  onlyGetBase64?: boolean;
  ref?: any;
}
/**
* @description 便捷文档地址
* @see https://reactmobile.lanhanba.net/basics/v1-html2-canvas
*/
const V2Html2Canvas: React.FC<V2Html2CanvasProps> = forwardRef(({
  hide = false,
  children,
  data64 = '',
  tip = '点击鼠标右键以保存图片',
  onlyGetBase64 = false,
  className,
  style = {}
}, ref: ForwardedRef<V2Html2CanvasHandles>) => {
  const targetRef: any = useRef(null);
  const [canvasShow, setCanvasShow] = useState<boolean>(false);
  const _style = useMemo(() => {
    const result: any = {
      opacity: '1',
      ...style,
    };
    if (hide) {
      result.opacity = '0';
      result.height = '0';
      result.overflow = 'hidden';
    }
    return result;
  }, [hide]);
  useImperativeHandle(ref, () => ({
    async drawCanvas(opts = {}) {
      const selector: any = targetRef.current;
      const width = selector.offsetWidth;
      const height = selector.offsetHeight;
      const options = Object.assign({
        scale: window.devicePixelRatio && window.devicePixelRatio > 1 ? window.devicePixelRatio : 1,
        width,
        height,
        useCORS: true,
        allowTaint: false,
        logging: false
      }, opts);
      if (!onlyGetBase64) {
        // 将自定义 canvas 作为配置项传入，开始绘制
        setCanvasShow(true);
        window.scrollTo(0, 0);
      }
      return await html2canvas(selector, options);
    }
  }));
  return (
    <>
      <div className={className} style={_style}>
        <div ref={targetRef}>
          {children}
        </div>
      </div>
      {
        canvasShow ? (
          <div className={cs(styles.V2Html2Canvas, 'v2Html2Canvas')} onClick={() => setCanvasShow(false)}>
            <div className={cs(styles.V2Html2CanvasOuter, 'v2Html2CanvasOuter')}>
              <img
                className={cs(styles.V2Html2CanvasImg, 'v2Html2CanvasImg')}
                src={data64}
                onClick={(e) => e.stopPropagation()}/>
              {
                tip ? (
                  <p className={cs(styles.V2Html2CanvasTip, 'v2Html2CanvasTip')}>{tip}</p>
                ) : undefined
              }
            </div>
          </div>
        ) : undefined
      }
    </>
  );
});

export default V2Html2Canvas;
