/**
 * @Description 将html页面转为canvas
 */
import { FC, forwardRef, useImperativeHandle, useRef } from 'react';
import html2canvas from 'html2canvas';

const Html2canvas:FC<any> = forwardRef(({
  children,
}, ref) => {
  const containerRef = useRef<any>(null);

  useImperativeHandle(ref, () => ({
    drawCanvas: drawCanvas,
  }));

  const drawCanvas = async(opts = {}) => {
    const selector: any = containerRef.current;
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
    // 将自定义 canvas 作为配置项传入，开始绘制
    // this.canvasShow = true;
    window.scrollTo(0, 0);
    return await html2canvas(selector, options);
  };

  return (
    <div ref={containerRef} style={{
      width: '100%',
      height: '100%'
    }}>
      {children}
    </div>
  );
});
export default Html2canvas;
