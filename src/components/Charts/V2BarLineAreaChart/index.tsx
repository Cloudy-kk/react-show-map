/**
 * @Description 折线柱状组合图
 */
import React, { useRef, useEffect, useState } from 'react';
import * as echarts from 'echarts/core';
import { LineChart, BarChart } from 'echarts/charts';
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
  LineChart,
  BarChart,
  GridComponent,
  TooltipComponent,
  TitleComponent,
  LegendComponent,
  LabelLayout,
  UniversalTransition,
]);

export interface V2BarLineAreaChartProps {
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
   * @description x轴数据 更多配置见 https://echarts.apache.org/zh/option.html#xAxis
   */
  xAxisData: string[];
  /**
   * @description y轴数据 更多配置见 https://echarts.apache.org/zh/option.html#series-line
   */
  seriesData: any[];
  /**
   * @description y坐标轴数据，左右两边各一条坐标轴 更多配置见 https://echarts.apache.org/zh/option.html#yAxis
   */
  yAxisData?: any[];
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
* @see https://reactmobile.lanhanba.net/charts/v2-bar-line-area-chart
*/

const V2BarLineAreaChart: React.FC<V2BarLineAreaChartProps> = (props) => {
  const {
    title,
    theme = 'blue',
    width,
    height = 270,
    xAxisData = [],
    seriesData = [],
    yAxisData = [],
    config = {},
    wrapperClassName,
  } = props;
  const chartRef = useRef<any>(null);
  let chart: any;

  const seriesBarBaseConfig = {
    type: 'bar',
    smooth: true,
    showSymbol: false,
    barMaxWidth: 11,
    label: {
      show: false,
      position: 'top',
      color: '#999999',
      fontSize: 10,
      formatter: (obj: any) => yAxisFormatter(obj.data)
    },
  };
  const seriesLineAreaBaseConfig = {
    type: 'line',
    smooth: true,
    showSymbol: false,
  };

  // 与折线区域图同时出现会导致颜色错乱，暂时不用
  // const seriesBarAreaStyleConfig = (index: number) => {
  //   return {
  //     color: {
  //       type: 'linear',
  //       x: 0,
  //       y: 0,
  //       x2: 0,
  //       y2: 1,
  //       colorStops: [{
  //         offset: 0, color: themeColor[theme][index],
  //       }, {
  //         offset: 1, color: `rgba(${themeColor[`${theme}RGB`][index]}, 0.5)`, // 50%透明度
  //       }],
  //       global: false,
  //     },
  //   };
  // };

  const seriesLineAreaStyleConfig = (index: number) => {
    return {
      color: {
        type: 'linear',
        x: 0,
        y: 0,
        x2: 0,
        y2: 1,
        colorStops: [{
          offset: 0, color: `rgba(${themeColor[`${theme}RGB`][index]}, 0.4)`, // 40%透明度
        }, {
          offset: 1, color: `rgba(${themeColor[`${theme}RGB`][index]}, 0.06)`, // 6%透明度
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
    }
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
      right: 50,
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
    xAxis,
    yAxis: [{ ...yAxis, ...(yAxisData?.[0] || {}) }, { ...yAxis, ...(yAxisData?.[1] || {}) }],
    series: [],
  });

  useEffect(() => {
    if (xAxisData?.length && seriesData?.length) {
      unstable_batchedUpdates(() => {
        setOptions({
          ...options,
          series: seriesData.map((item, index) => {
            // const linearStyle: any = item.type === 'bar' ? { itemStyle: seriesBarAreaStyleConfig(index) } : { areaStyle: seriesLineAreaStyleConfig(index) }
            return {
              ...(item.type === 'bar' ? seriesBarBaseConfig : seriesLineAreaBaseConfig),
              ...item,
              data: item.data,
              // itemStyle: item.type === 'bar' ? seriesBarAreaStyleConfig(index) : null, 与areaStyle同时出现会导致颜色错乱
              areaStyle: item.type === 'line' ? seriesLineAreaStyleConfig(index) : null,
              label: {
                ...seriesBarBaseConfig.label,
                ...item.label || {},
              },
              tooltip: {
                valueFormatter: (value: number) => {
                  return item.unit ? `${value}${item.unit}` : value;
                }
              }
            };
          }),
          grid: {
            ...options.grid,
            right: seriesData.filter((item) => item.yAxisIndex === 1).length ? 50 : 12,
          },
          xAxis: {
            ...options.xAxis,
            data: xAxisData,
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
    <div className={cs(styles.V2BarLineAreaChartWrap, wrapperClassName)} style={{ width, height }}>
      <div ref={chartRef} className={styles.V2BarLineAreaChart}></div>
    </div>
  );
};

export default V2BarLineAreaChart;
