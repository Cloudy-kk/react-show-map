/**
 * @Description 折线图
 */
import React, { useRef, useEffect, useState } from 'react';
import * as echarts from 'echarts/core';
import { PieChart } from 'echarts/charts';
import { SVGRenderer } from 'echarts/renderers';
import { GridComponent, TooltipComponent, TitleComponent, LegendComponent } from 'echarts/components';
// 标签自动布局、全局过渡动画等特性
import { LabelLayout, UniversalTransition } from 'echarts/features';
import { percentValueFormatter } from '@lhb/func';
import { themeColor } from '../../config-v2';
import { EChartsOption } from 'echarts';
import styles from './index.module.less';
import { unstable_batchedUpdates } from 'react-dom';
import cs from 'classnames';

echarts.use([
  SVGRenderer,
  PieChart,
  GridComponent,
  TooltipComponent,
  TitleComponent,
  LegendComponent,
  LabelLayout,
  UniversalTransition,
]);

export interface V2PieChartProps {
  /**
   * @description 图表标题
   */
  title?: string;
  /**
   * @description 基础类型或者环形
   * @default base
   */
  type?: 'base' | 'circle' | 'rose',
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
   * @description y轴数据 更多配置见 https://echarts.apache.org/zh/option.html#series-pie
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
* @see https://reactmobile.lanhanba.net/charts/v2-pie-chart
*/

const V2PieChart: React.FC<V2PieChartProps> = (props) => {
  const {
    title,
    theme = 'blue',
    type = 'base',
    width,
    height = 270,
    seriesData = [],
    config = {},
    wrapperClassName,
  } = props;
  const chartRef = useRef<any>(null);
  let chart: any;

  const seriesBaseConfig = {
    type: 'pie',
    radius: type === 'circle' ? ['38%', '50%'] : '50%',
    center: ['30%', '50%'],
    roseType: type === 'rose' ? 'area' : false,
    itemStyle: {
      borderRadius: 3,
      borderColor: '#fff',
      borderWidth: 1,
    },
    label: {
      show: false,
    },
    labelLine: {
      show: false,
    },
    tooltip: {
      position: 'inside',
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
      width: '45%',
      orient: 'vertical',
      itemWidth: 8,
      itemHeight: 8,
      itemGap: 6,
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
      top: 'center',
      left: '55%',
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
      trigger: 'item',
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
    series: [],
  });

  useEffect(() => {
    if (seriesData?.length) {
      const totalValue = seriesData[0]?.data?.reduce((prevVal: number, currVal: any) => {
        return prevVal + currVal.value;
      }, 0); // 饼图的value总和，用于计算每块图例百分比
      unstable_batchedUpdates(() => {
        setOptions({
          ...options,
          series: seriesData.map((item) => {
            return {
              ...seriesBaseConfig,
              ...item,
              tooltip: {
                valueFormatter: (value: number) => {
                  return item.unit ? `${value}${item.unit}` : value;
                }
              }
            };
          }),
          legend: {
            ...options.legend,
            formatter: (name: string) => {
              const data = seriesData[0]?.data || [];
              for (let i = 0; i < data.length; i++) {
                if (data[i].name === name) {
                  const percent = percentValueFormatter(data[i].value, totalValue);
                  return `${name} ${percent}%`;
                }
              }
              return name;
            },
          },
        });
        setIsConfig(true);
      });

    }
  }, [seriesData]);

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
    <div className={cs(styles.V2PieChartWrap, wrapperClassName)} style={{ width, height }}>
      <div ref={chartRef} className={styles.V2PieChart}></div>
    </div>
  );
};

export default V2PieChart;
