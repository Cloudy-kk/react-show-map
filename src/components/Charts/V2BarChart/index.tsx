/**
 * @Description 折线图
 */
import React, { useRef, useEffect, useState } from 'react';
import * as echarts from 'echarts/core';
import { BarChart } from 'echarts/charts';
import { SVGRenderer } from 'echarts/renderers';
import { GridComponent, TooltipComponent, TitleComponent, LegendComponent } from 'echarts/components';
// 标签自动布局、全局过渡动画等特性
import { LabelLayout, UniversalTransition } from 'echarts/features';
import { yAxisFormatter } from '@lhb/func';
import { themeColor } from '../../config-v2';
import { EChartsOption } from 'echarts';
import styles from './index.module.less';
import { unstable_batchedUpdates } from 'react-dom';
import cs from 'classnames';

echarts.use([
  SVGRenderer,
  BarChart,
  GridComponent,
  TooltipComponent,
  TitleComponent,
  LegendComponent,
  LabelLayout,
  UniversalTransition,
]);

export interface V2BarChartProps {
  /**
   * @description 图表标题
   */
  title?: string;
  /**
   * @description 图表主题
   */
  theme?: 'blue' | 'green' | 'purple';
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
   * @description 柱状图显示方向
   * @default vertical
   */
  direction?: 'horizontal' | 'vertical';
  /**
   * @description x轴数据 更多配置见 https://echarts.apache.org/zh/option.html#xAxis
   */
  xAxisData: string[];
  /**
   * @description y轴数据 更多配置见 https://echarts.apache.org/zh/option.html#series-bar
   */
  seriesData: any[];
  /**
   * @description echarts更多配置 详情见https://echarts.apache.org/zh/option.html#title
   * @type EChartsOption
   */
  config?: EChartsOption;
  /**
   * @description 图表外层包装容器的类名
   */
  wrapperClassName?: string;
}

/**
* @description 便捷文档地址
* @see https://reactmobile.lanhanba.net/charts/v2-bar-chart
*/

const V2BarChart: React.FC<V2BarChartProps> = (props) => {
  const {
    title,
    theme = 'blue',
    width,
    height = 270,
    direction = 'vertical',
    xAxisData = [],
    seriesData = [],
    config = {},
    wrapperClassName,
  } = props;
  const chartRef = useRef<any>(null);
  let chart: any;

  const seriesBaseConfig = {
    type: 'bar',
    smooth: true,
    showSymbol: false,
    barMaxWidth: 11,
    itemStyle: {},
    label: {
      show: false,
      position: 'top',
      color: '#999999',
      fontSize: 10,
      formatter: (obj: any) => yAxisFormatter(obj.data)
    },
  };

  const seriesAreaStyleConfig = (index: number) => {
    return {
      color: {
        type: 'linear',
        x: direction === 'vertical' ? 0 : 1,
        y: 0,
        x2: 0,
        y2: direction === 'vertical' ? 1 : 0,
        colorStops: [{
          offset: 0, color: themeColor[theme][index],
        }, {
          offset: 1, color: `rgba(${themeColor[`${theme}RGB`][index]}, 0.5)`, // 50%透明度
        }],
        global: false,
      },
    };
  };

  // 横轴配置
  const xAxis = {
    type: 'category',
    data: [],
    nameTextStyle: {
      fontSize: 13,
      fontFamily: 'PingFangSC-Regular, PingFang SC',
    },
    axisLine: {
      show: false,
      lineStyle: {
        color: '#999',
      },
    },
    axisTick: {
      show: false,
    },
    ...(config.xAxis || {}),
  };

  // 竖轴配置
  const yAxis = {
    type: 'value',
    axisLabel: {
      formatter: yAxisFormatter,
    },
    nameTextStyle: {
      fontSize: 13,
      fontFamily: 'PingFangSC-Regular, PingFang SC',
    },
    axisLine: {
      lineStyle: {
        color: '#999',
      },
    },
    splitLine: {
      lineStyle: {
        color: ['#eee'],
        width: 0.5,
      },
    },
    ...(config.yAxis || {}),
  };

  const [isConfig, setIsConfig] = useState(false); // options 是否配置完成
  const [options, setOptions] = useState<any>({
    ...config,
    title: {
      show: !!title,
      text: title || '',
      textStyle: {
        color: '#222222',
        fontWeight: 500,
        fontFamily: 'PingFangSC-Medium, PingFang SC',
        fontSize: 16,
        lineHeight: 22,
      },
      top: 6,
      left: 6,
      ...(config.title || {}),
    },
    legend: {
      type: 'plain',
      width: '50%',
      itemWidth: 8,
      itemHeight: 8,
      itemGap: 2,
      itemStyle: {
        borderWidth: 0,
      },
      textStyle: {
        fontSize: 13,
        fontWeight: 400,
        color: '#666666',
        lineHeight: 14,
        rich: {
          a: {
            verticalAlign: 'middle',
          },
        },
        padding: [0, 4, 1, 0],
      },
      icon: 'roundRect',
      top: 10,
      right: 0,
      ...(config.legend || {}),
    },
    color: themeColor[theme],
    grid: {
      left: 50,
      bottom: 36,
      right: 12,
      ...(config.grid || {}),
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
      backgroundColor: '#222',
      borderColor: '#222',
      borderWidth: 0,
      textStyle: {
        color: '#fff',
        fontWeight: 'normal',
        fontSize: 12,
        fontFamily: 'PingFangSC-Regular, PingFang SC',
      },
      confine: true,
      alwaysShowContent: false,
      ...(config.tooltip || {}),
    },
    xAxis: direction === 'vertical' ? xAxis : yAxis,
    yAxis: direction === 'vertical' ? yAxis : xAxis,
    series: [],
  });

  useEffect(() => {
    if (xAxisData?.length && seriesData?.length) {
      const direct = direction === 'vertical' ? 'xAxis' : 'yAxis';
      unstable_batchedUpdates(() => {
        setOptions({
          ...options,
          series: seriesData.map((item, index) => {
            return {
              ...seriesBaseConfig,
              ...item,
              data: direction === 'vertical' ? item.data : item.data.reverse(),
              itemStyle: seriesAreaStyleConfig(index),
              label: {
                ...seriesBaseConfig.label,
                ...item.label || {},
              },
              tooltip: {
                valueFormatter: (value: number) => {
                  return item.unit ? `${value}${item.unit}` : value;
                }
              }
            };
          }),
          [direct]: {
            ...options[direct],
            data: direction === 'vertical' ? xAxisData : xAxisData.reverse(),
          },
        });
        setIsConfig(true);
      });
    }
  }, [xAxisData, seriesData]);

  useEffect(() => {
    if (!isConfig) return;
    if (chartRef.current) {
      chart = echarts.init(chartRef.current, 'light', {
        renderer: 'svg',
        height,
      });
      chart.setOption(options);
    }
    return () => chart?.dispose();
  }, [options, isConfig]);

  return (
    <div className={cs(styles.V2BarChartWrap, wrapperClassName)} style={{ width, height }}>
      <div ref={chartRef} className={styles.V2BarChart}></div>
    </div>
  );
};

export default V2BarChart;
