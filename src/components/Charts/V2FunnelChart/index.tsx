/**
 * @Description 漏斗图
 */
import React, { ReactNode, useRef } from 'react';
import { beautifyValueFormatter, funnelFormatter } from '@lhb/func';
import { themeColor } from '../../config-v2';
import styles from './index.module.less';
import cs from 'classnames';
import { Tooltip } from 'antd';
import IconFont from '../../Base/IconFont';

export interface V2FunnelSeriesDataProps {
  /**
   * @description 图例名称
   */
  name: string;
  /**
   * @description 图例的值
   */
  value: number;
  /**
   * @description 鼠标hover图例tooltip中的数值单位
   */
  unit?: string | ReactNode;
  /**
   * @description 右侧图例说明
   */
  describe?: string;
  /**
   * @description 右侧图例描述的转化率
   */
  percent?: string;
  /**
   * @description 右侧图例说明的描述
   */
  tip?: string;
  /**
   * @description 左侧扩展说明
   */
  leftValue?: string;
}

export interface V2FunnelChartProps {
  /**
   * @description 图表标题
   */
  title?: string;
  /**
   * @description 图表主题
   */
  theme?: 'blue' | 'green' | 'purple' | string;
  /**
   * @description 图例显示模式
   */
  mode?: 'colorful' | 'gradient' | string;
  /**
   * @description 图表宽度，默认不指定，跟随外容器
   */
  width?: number | string;
  /**
   * @description 图表高度
   * @default 270px
   */
  height?: number | string;
  /**
   * @description 图例是否需要垂直居中
   * @default true
   */
  verticalAlign?: boolean;
  /**
   * @description 是否需要动画加载效果
   * @default true
   */
  animation?: boolean;
  /**
   * @description 漏斗图数据
   */
  seriesData: V2FunnelSeriesDataProps[];
  /**
   * @description 图表外层包装容器的类名
   */
  wrapperClassName?: string;
}

/**
* @description 便捷文档地址
* @see https://reactmobile.lanhanba.net/charts/v2-Funnel-chart
*/

const V2FunnelChart: React.FC<V2FunnelChartProps> = (props) => {
  const {
    title,
    theme = 'blue',
    mode = 'gradient',
    width,
    height = 270,
    verticalAlign = true,
    animation = true,
    seriesData = [],
    wrapperClassName,
  } = props;
  const chartRef = useRef<any>(null);

  const renderFill = (index: number) => {
    if (mode === 'colorful') {
      // 如果图例超出则继续沿用最后一个
      const colors = themeColor[theme];
      return colors[index] ? colors[index] : colors[colors.length - 1];
    } else {
      // 渐变图例颜色需要从下往上渲染，超过既定颜色时，默认使用既定颜色的最后一个
      const colors = themeColor[`${theme}Gradient`];
      if (colors.length >= seriesData.length) {
        const diff = colors.length - seriesData.length;
        return colors[index + diff];
      }
      if (index >= colors.length) {
        return colors[colors.length - 1];
      }
      return colors[index];
    }
  };

  return (
    <div className={cs(styles.V2FunnelChartPropsWrap, verticalAlign && styles.verticalAlignWrap, wrapperClassName)} style={{ width, height }}>
      { !!title && <div className={styles.V2ChartTitle}>{ title }</div> }
      <div ref={chartRef} className={cs(styles.V2FunnelChartProps, verticalAlign && styles.verticalAlign)}>
        <div className={styles.V2FunnelContent} style={{ width: 'calc(40% + 36px)' }}>
          { seriesData?.map((item, index) => {
            return (
              <div className={styles.V2FunnelItemWrap} key={index}>
                <Tooltip align={{ offset: [0, -2] }} placement='bottom' overlayClassName={styles.overlayTooltip} title={
                  <div className={styles.tooltipContent}>
                    <div>{ item.name }:</div>
                    <div>{ beautifyValueFormatter(item.value) }{ item.unit || '' }</div>
                  </div>
                }>
                  <div className={styles.V2FunnelItem} style={{ width: `calc(100% - (36px * ${index}))` }}>
                    <div className={cs(styles.V2FunnelItemGrip, styles.gripLeft)} >
                      <div className={cs(styles.V2FunnelToolTipContent, animation && styles.animation)}>
                        <svg width='440px' height='43px' viewBox='0 0 440 43' version='1.1' preserveAspectRatio='xMinYMid slice' xmlns='http://www.w3.org/2000/svg'>
                          <g id='left-1' stroke='none' strokeWidth='1' fill='none' fillRule='evenodd'>
                            <g id='left-2' className={styles.funnelG2} transform='translate(-98.000000, -49.000000)' fill={renderFill(index)}>
                              <g id='left-3' transform='translate(46.000000, 49.000000)'>
                                <g id='left-4' transform='translate(40.000000, 0.000000)'>
                                  <g id='left-5' transform='translate(12.000000, 0.000000)'>
                                    <path id='left-funnelPath' d='M20.0602572,43 L860.618952,43 C862.271038,43 863.753149,41.9843252 864.349378,40.4435788 L877.893475,5.44357878 C878.690742,3.38332123 877.666885,1.06684025 875.606628,0.269573709 C875.146195,0.0913979191 874.656755,4.87591208e-14 874.163049,0 L5.92876348,0 C3.71962448,6.62306119e-15 1.92876348,1.790861 1.92876348,4 C1.92876348,4.51323007 2.02753207,5.02166464 2.21968127,5.49756777 L16.351175,40.4975678 C16.9617713,42.0098544 18.4293561,43 20.0602572,43 Z'></path>
                                  </g>
                                </g>
                              </g>
                            </g>
                          </g>
                        </svg>
                      </div>
                    </div>
                    <div className={cs(styles.V2FunnelItemGrip, styles.gripRight)} >
                      <div className={cs(styles.V2FunnelToolTipContent, animation && styles.animation)}>
                        <svg width='440px' height='43px' viewBox='0 0 440 43' version='1.1' preserveAspectRatio='xMaxYMid slice' xmlns='http://www.w3.org/2000/svg'>
                          <g id='left-1' stroke='none' strokeWidth='1' fill='none' fillRule='evenodd'>
                            <g id='left-2' className={styles.funnelG2} transform='translate(-538.000000, -49.000000)' fill={renderFill(index)}>
                              <g id='left-3' transform='translate(46.000000, 49.000000)'>
                                <g id='left-4' transform='translate(40.000000, 0.000000)'>
                                  <g id='left-5' transform='translate(12.000000, 0.000000)'>
                                    <path id='left-funnelPath' d='M20.0602572,43 L860.618952,43 C862.271038,43 863.753149,41.9843252 864.349378,40.4435788 L877.893475,5.44357878 C878.690742,3.38332123 877.666885,1.06684025 875.606628,0.269573709 C875.146195,0.0913979191 874.656755,4.87591208e-14 874.163049,0 L5.92876348,0 C3.71962448,6.62306119e-15 1.92876348,1.790861 1.92876348,4 C1.92876348,4.51323007 2.02753207,5.02166464 2.21968127,5.49756777 L16.351175,40.4975678 C16.9617713,42.0098544 18.4293561,43 20.0602572,43 Z'></path>
                                  </g>
                                </g>
                              </g>
                            </g>
                          </g>
                        </svg>
                      </div>
                    </div>
                    <div className={styles.V2FunnelItemName}>{ item.name } { !!item.leftValue && funnelFormatter(item.value) }</div>
                  </div>
                </Tooltip>

                { !!item.describe && (
                  <div className={cs(styles.V2FunnelItemIntro, animation && styles.animation)}>
                    <div className={styles.introGuideLine} />
                    <div className={styles.introContent}>
                      <div className={styles.introName}>{ item.describe }{ !!item.tip && <Tooltip placement='top' align={{ offset: [0, 2] }} title={item.tip}><span><IconFont iconHref='pc-common-icon-ic_info' className={styles.tipIcon} /></span></Tooltip> }</div>
                      <div className={styles.introPercent}>{ item.percent }</div>
                    </div>
                  </div>
                ) }
                <div className={cs(styles.V2FunnelItemLeftValue, animation && styles.animation)}>
                  <div className={styles.introContent}>
                    <div className={styles.introName}>{ item.leftValue || funnelFormatter(item.value) }</div>
                  </div>
                  <div className={styles.introGuideLine} />
                </div>
              </div>
            );
          }) }
        </div>
      </div>
    </div>
  );
};

export default V2FunnelChart;
