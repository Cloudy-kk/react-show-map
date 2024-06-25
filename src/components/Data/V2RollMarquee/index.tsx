import React, { useEffect, useRef, useState } from 'react';
import cs from 'classnames';
import styles from './index.module.less';
import { Carousel } from '@lhb/func';
import { useMethods } from '@lhb/hook';
export interface V2RollMarqueeProps {
  /**
   * @description 外层容器样式类名
   */
  className?: any;
  /**
   * @description 移动速率 px/每秒
   * @default 100
   */
  distance?: number;
  /**
   * @description 帧率，越高，移动频率越快，越顺滑，性能消耗越大（可能会出现卡顿）
   * @default 60
   */
  fps?: number;
  /**
   * @description 是否鼠标移动上去后暂停
   * @default true
   */
  mouseenterable?: boolean;
  /**
   * @description 移动方向, 可选['top', 'bottom', 'left', 'right']
   * @default left
   */
  moveDirection?: 'left' | 'top' | 'bottom' | 'right' | undefined;
  /**
   * @description 初始化时是否自动立即触发滚动事件
   * @default false
   */
  immediate?: boolean;
  /**
   * @description 轮播加载完成回调，返回carousel实例，详情请见下方文档
   */
  onLoad?: (carousel: any) => void;
  /**
   * @description 如果浏览器视口发生变化，是否初始化整个滚动（将重置为初始位置并开始滚动）
   * @default false
   */
  fixResizeToInit?: boolean;
  /**
   * @description init方法防抖间隔时间，单位ms
   * @default 400
   */
  initDuration?: number;
  children?: any;
}
/**
* @description 便捷文档地址
* @see https://reactpc.lanhanba.net/components/Data/v2roll-marquee
*/
const V2RollMarquee: React.FC<V2RollMarqueeProps> = ({
  className,
  distance = 100,
  fps = 60,
  mouseenterable = true,
  moveDirection = 'left',
  immediate = false,
  onLoad,
  children,
  fixResizeToInit = false,
  initDuration = 400,
}) => {
  const carouselRef: any = useRef(null);
  const [carousel, setCarousel] = useState<any>();
  const methods = useMethods({
    reInit() {
      if (carousel) {
        carousel.init();
      }
    }
  });
  useEffect(() => {
    const el: any = new Carousel({
      el: carouselRef?.current,
      distance,
      fps,
      mouseenterable,
      moveDirection,
      immediate,
      initDuration
    });
    onLoad?.(el);
    setCarousel(el);
    if (fixResizeToInit) {
      window.addEventListener('resize', methods.reInit);
    }
    return () => {
      if (el) {
        el.destroy();
        if (fixResizeToInit) {
          window.removeEventListener('resize', methods.reInit);
        }
      }
    };
  }, []);
  return (
    <div className={cs(styles.V2RollMarqueeWrapper, className)}>
      <div
        className={cs([
          styles.V2RollMarquee,
          className,
          (moveDirection === 'bottom' || moveDirection === 'top') && styles.V2RollMarqueeVertical,
        ])}
        ref={carouselRef}
      >
        {children}
      </div>
    </div>
  );
};

export default V2RollMarquee;
