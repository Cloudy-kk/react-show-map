/**
 * @Description 梯形漏斗图
 */
import React, { ReactNode, useRef } from 'react';
import { beautifyValueFormatter, funnelFormatter } from '@lhb/func';
import { themeColor } from '../../config-v2';
import styles from './index.module.less';
import cs from 'classnames';
import { Tooltip } from 'antd';
import IconFont from '../../Base/IconFont';

export interface V2FunnelTrapeziumSeriesDataProps {
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

export interface V2FunnelTrapeziumChartProps {
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
   * @description 是否需要动画加载效果
   * @default true
   */
  animation?: boolean;
  /**
   * @description 图例是否需要垂直居中
   * @default true
   */
  verticalAlign?: boolean;
  /**
   * @description 漏斗图数据
   */
  seriesData: V2FunnelTrapeziumSeriesDataProps[];
  /**
   * @description 图表外层包装容器的类名
   */
  wrapperClassName?: string;
}

/**
* @description 便捷文档地址
* @see https://reactmobile.lanhanba.net/charts/v2-Funnel-Trapezium-chart
*/

const V2FunnelTrapeziumChart: React.FC<V2FunnelTrapeziumChartProps> = (props) => {
  const {
    title,
    theme = 'blue',
    mode = 'colorful',
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
    <div className={cs(styles.V2FunnelTrapeziumChartWrap, verticalAlign && styles.verticalAlignWrap, wrapperClassName)} style={{ width, height }}>
      { !!title && <div className={styles.V2ChartTitle}>{ title }</div> }
      <div ref={chartRef} className={cs(styles.V2FunnelTrapeziumChart, verticalAlign && styles.verticalAlign)}>
        <div className={styles.V2FunnelContent} style={{ width: 'calc(60% + 52px)' }}>
          { seriesData?.map((item, index) => {
            return (
              <div className={styles.V2FunnelItemWrap} key={index}>
                <div className={styles.V2FunnelItem} style={{ width: `calc(100% - (28px * ${index}))` }}>
                  <div className={cs(styles.V2FunnelItemCount, !!item.leftValue && styles.V2FunnelItemLeftValue)}>{ item.leftValue ? (
                    <Tooltip align={{ offset: [0, -2] }} placement='bottom' overlayClassName={styles.overlayTooltip} title={item.leftValue}><div className={styles.leftValueContent}>{ item.leftValue }</div></Tooltip>
                  ) : funnelFormatter(item.value) }</div>
                  <div className={styles.V2FunnelItemLabel} >
                    <Tooltip align={{ offset: [0, -2] }} placement='bottom' overlayClassName={styles.overlayTooltip} title={
                      <div className={styles.tooltipContent}>
                        <div>{ item.name }:</div>
                        <div>{ beautifyValueFormatter(item.value) }{ item.unit || '' }</div>
                      </div>
                    }>
                      <div className={cs(styles.V2FunnelToolTipContent, animation && styles.animation)}>
                        <div className={styles.V2FunnelItemName}>{ item.name } { !!item.leftValue && funnelFormatter(item.value) }</div>
                        <svg width='1155px' height='43px' viewBox='0 0 1155 43' version='1.1' preserveAspectRatio='xMaxYMid slice' xmlns='http://www.w3.org/2000/svg'>
                          <g id='1' stroke='none' strokeWidth='1' fill='none' fillRule='evenodd'>
                            <g id='2' className={styles.funnelG2} transform='translate(-138.000000, -40.000000)' fill={renderFill(index)}>
                              <g id='3' transform='translate(60.000000, 40.000000)'>
                                <g id='4' transform='translate(78.000000, 0.000000)'>
                                  <path id='funnelPath' className={styles.funnelPath} d='M0,43 L1129.73625,43 C1131.13624,43 1132.43434,42.268072 1133.15889,41.070165 L1154.32849,6.07016497 C1155.47181,4.17989693 1154.86629,1.72068749 1152.97602,0.577366949 C1152.35156,0.199663011 1151.63566,-1.49348037e-13 1150.90585,0 L0,0 L0,0 L0,43 Z'></path>
                                </g>
                              </g>
                            </g>
                          </g>
                        </svg>
                      </div>
                    </Tooltip>
                  </div>
                </div>
                { !!item.describe && (
                  <div className={cs(styles.V2FunnelItemIntro, animation && styles.animation)}>
                    <div className={styles.introGuideLine} />
                    <div className={styles.introContent}>
                      <div className={styles.introName}>{ item.describe }{ !!item.tip && <Tooltip placement='top' align={{ offset: [0, 2] }} title={item.tip}><span><IconFont iconHref='pc-common-icon-ic_info' className={styles.tipIcon} /></span></Tooltip> }</div>
                      <div className={styles.introPercent}>{ item.percent }</div>
                    </div>
                  </div>
                ) }
              </div>
            );
          }) }
        </div>
      </div>
    </div>
  );
};

export default V2FunnelTrapeziumChart;
