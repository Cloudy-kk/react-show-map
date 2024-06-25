/**
 * @Description 折线图
 */
import React, { useRef, useEffect, useState } from 'react';
import * as echarts from 'echarts/core';
import { LineChart } from 'echarts/charts';
import { SVGRenderer } from 'echarts/renderers';
import { GridComponent, TooltipComponent, TitleComponent, LegendComponent, DataZoomComponent } from 'echarts/components';
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
  GridComponent,
  TooltipComponent,
  TitleComponent,
  LegendComponent,
  DataZoomComponent,
  LabelLayout,
  UniversalTransition,
]);

export interface V2LineChartProps {
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
* @see https://reactmobile.lanhanba.net/charts/v2-line-chart
*/

const V2LineChart: React.FC<V2LineChartProps> = (props) => {
  const {
    title,
    theme = 'blue',
    width,
    height = 270,
    xAxisData = [],
    seriesData = [],
    config = {},
    wrapperClassName,
  } = props;
  const chartRef = useRef<any>(null);
  let chart: any;

  const seriesBaseConfig = {
    type: 'line',
    label: {
      show: false,
      position: 'top',
      color: '#999999',
      fontSize: 10,
      formatter: (obj: any) => yAxisFormatter(obj.data)
    },
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
    xAxis: {
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
      ...(config.tooltip || {}),
    },
    yAxis: {
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
    },
    series: [],
  });

  useEffect(() => {
    if (xAxisData?.length && seriesData?.length) {
      unstable_batchedUpdates(() => {
        setOptions({
          ...options,
          series: seriesData.map((item) => {
            return {
              ...seriesBaseConfig,
              ...item,
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
    <div className={cs(styles.V2LineChartWrap, wrapperClassName)} style={{ width, height }}>
      <div ref={chartRef} className={styles.V2LineChart}></div>
    </div>
  );
};

export default V2LineChart;
