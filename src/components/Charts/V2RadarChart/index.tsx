/**
 * @Description 雷达图
 */
import React, { useRef, useEffect, useState } from 'react';
import * as echarts from 'echarts/core';
import { RadarChart } from 'echarts/charts';
import { SVGRenderer } from 'echarts/renderers';
import { GridComponent, TooltipComponent, TitleComponent, LegendComponent } from 'echarts/components';
// 标签自动布局、全局过渡动画等特性
import { LabelLayout, UniversalTransition } from 'echarts/features';
import { themeColor } from '../../config-v2';
import { EChartsOption } from 'echarts';
import styles from './index.module.less';
import { unstable_batchedUpdates } from 'react-dom';
import cs from 'classnames';

echarts.use([
  SVGRenderer,
  RadarChart,
  GridComponent,
  TooltipComponent,
  TitleComponent,
  LegendComponent,
  LabelLayout,
  UniversalTransition,
]);

export interface V2RadarChartProps {
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
   * @description 雷达图绘制类型
   * @default polygon
   */
  shape?: 'circle' | 'polygon'
  /**
   * @description 雷达图的指标 更多配置见 https://echarts.apache.org/zh/option.html#radar.indicator
   */
  indicator: any[];
  /**
   * @description 雷达图数据 更多配置见 https://echarts.apache.org/zh/option.html#series-radar.data
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
* @see https://reactmobile.lanhanba.net/charts/v2-radar-chart
*/

const V2RadarChart: React.FC<V2RadarChartProps> = (props) => {
  const {
    title,
    theme = 'blue',
    width,
    height = 270,
    shape = 'polygon',
    indicator = [],
    seriesData = [],
    config = {},
    wrapperClassName,
  } = props;
  const chartRef = useRef<any>(null);
  let chart: any;

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
      ...(config.legend || {}),
    },
    color: themeColor[theme],
    radar: {
      shape: shape,
      radius: '56%',
      center: ['50%', '54%'],
      nameGap: 8,
      splitNumber: 4,
      axisName: {
        formatter: (value: string, indicator: any) => {
          return [
            '{a|' + indicator.max + '}',
            '{b|' + value + '}',
          ].join('\n');
        },
        lineHeight: 16,
        color: '#999999',
        rich: {
          a: {
            color: '#666666',
            fontFamily: 'PingFangSC-Medium, PingFang SC',
            fontWeight: 500,
          },
          b: {
            color: '#999999',
            fontFamily: 'PingFangSC-Regular, PingFang SC',
          },
        },
        tooltip: {
          formatter: (params: any) => {
            console.log(params);
          }
        },
      },
      axisLine: {
        lineStyle: {
          color: '#EEEEEE',
          width: 2,
        },
      },
      splitLine: {
        lineStyle: {
          type: [4, 4],
        }
      },
      splitArea: {
        show: false,
      },
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

  const buildSeries = (dataItem: any, dataIndex: number) => {
    const data = dataItem.value;
    const helper = data.map((item: any, index: number) => {
      const arr = new Array(data.length);
      arr.splice(index, 1, item);
      return arr;
    });
    return [data, ...helper].map((item, index) => {
      return {
        name: dataItem.name,
        type: 'radar',
        symbol: index === 0 ? 'circle' : 'none',
        symbolSize: 5,
        areaStyle: {
          color: `rgba(${themeColor[`${theme}RGB`][dataIndex]}, 0.16)`,
        },
        lineStyle: {
          color: index === 0 ? themeColor[theme][dataIndex] : 'transparent'
        },
        tooltip: {
          show: index !== 0,
          formatter: () => {
            let res = indicator[index - 1].name + '：<br>';
            seriesData.forEach((item: any, idx: number) => {
              const str = '<i style="display: inline-block;width: 8px;height: 8px;background: ' +
                            themeColor[theme][idx] + ';margin-right: 4px; margin-top: 6px;}"></i>' +
                            item.name + '：' + item.value[index - 1] + item.unit + '<br>';
              res += str;
            });
            return res;

          }
        },
        z: index === 0 ? 1 : 2,
        data: [item]
      };
    });
  };

  useEffect(() => {
    if (indicator?.length && seriesData?.length) {
      const series: any = [];
      seriesData.forEach((item, index) => {
        series.push(...buildSeries(item, index));
      });
      unstable_batchedUpdates(() => {
        setOptions({
          ...options,
          series,
          radar: {
            ...options.radar,
            indicator: [...indicator]
          },
        });
        setIsConfig(true);
      });
    }
  }, [indicator, seriesData]);

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
    <div className={cs(styles.V2RadarChartWrap, wrapperClassName)} style={{ width, height }}>
      <div ref={chartRef} className={styles.V2RadarChart}></div>
    </div>
  );
};

export default V2RadarChart;
