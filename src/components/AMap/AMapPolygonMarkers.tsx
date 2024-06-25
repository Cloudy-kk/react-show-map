/**
 * @Description 显示半径,打点,围栏
 */
import { FC, useEffect, useState } from 'react';
// https://elemefe.github.io/react-amap/components/polygon
// import { LngLat } from 'react-amap';
import AMap from '.';
import styles from './index.module.less';
interface AMapMarkersProps {
  data: MapObj;
}
interface MapObj {
  center: any; // 圆心
  circleRadius: number; // 圆半径
  pathList: any[]; // 围栏
  markers?: any[]; // 打点
  groupMarkers?: any[]; // 分组打点
}
// 海量点颜色
export const businessColorEnum: any = (code: string) => {
  switch (code) {
    case '餐饮业态':
    case '05':
      return '#FDA830';
    case '购物业态':
    case '06':
      return '#A396F5';
    case '休闲业态':
    case '08':
      return '#FA9994';
    case '机构业态':
    case '17':
      return '#E78FF1';

    default:
      return '#00FFFF';
  }
};
const AMapPolygonMarkers: FC<AMapMarkersProps> = ({
  data
}) => {
  const [amapIns, setAmapIns] = useState<any>(null); // 地图实例
  const [polygonsBounds, setPolygonsBounds] = useState<Array<any>>([]); // 行政区域边界范围
  const loadData = async () => {
    polygonsBounds && amapIns && amapIns.remove(polygonsBounds); // 清除上次结果
    const polygons: Array<any> = [];
    for (let i = 0, l = data.pathList.length; i < l; i++) {
      // 生成行政区划polygon
      const polygon = new window.AMap.Polygon({
        path: data.pathList[i].path.map(item => {
          return new window.AMap.LngLat(item.longitude, item.latitude);
        }),
        fillOpacity: 0.5,
        strokeOpacity: 1,
        fillColor: '#ccebc5',
        strokeColor: '#2b8cbe',
        strokeWeight: 1,
        strokeStyle: 'dashed',
        strokeDasharray: [5, 5],
      });
      polygons.push(polygon);
    }
    setPolygonsBounds(polygons);
    const circleLng = data?.center ? data?.center[0] : 103.826777;
    const circleLat = data?.center ? data?.center[1] : 36.060634;
    const circle = new window.AMap.Circle({
      center: new window.AMap.LngLat(circleLng, circleLat), // 圆心位置
      radius: data?.circleRadius || 1000, // 半径
      // strokeColor: '#006AFF33', // 设置边框颜色
      // fillColor: '#006AFF1F', // 设置填充颜色
      fillOpacity: 0.1,
      bubble: true
    });
    const customIcon = new window.AMap.Icon({
      // 图标尺寸
      size: new window.AMap.Size(40, 47),
      // 图标的取图地址
      image: 'https://staticres.linhuiba.com/project-custom/pms/icon/position.png',
      // 图标所用图片大小
      imageSize: new window.AMap.Size(40, 47),
    });
    const marker = new window.AMap.Marker({
      icon: customIcon,
      position: [circleLng, circleLat],
      offset: new window.AMap.Pixel(-40 / 2, -47)
    });
    amapIns.add(marker);
    amapIns.add(circle);
    amapIns.add(polygons);
  };
  const loadPoint = () => {
    window.AMapUI.loadUI(['misc/PointSimplifier'], function (PointSimplifier) {
      if (!PointSimplifier.supportCanvas) {
        alert('当前环境不支持 Canvas！');
        return;
      }
      data?.groupMarkers?.map((item) => {
        initPage(PointSimplifier, item);
      });
    });
    function initPage(PointSimplifier, data) {
      // 创建组件实例
      const pointSimplifierIns = new PointSimplifier({
        map: amapIns, // 关联的map
        compareDataItem: function (a, b, aIndex, bIndex) {
          // 数据源中靠后的元素优先，index大的排到前面去
          return aIndex > bIndex ? -1 : 1;
        },
        getPosition: function (dataItem) {
          // 返回数据项的经纬度，AMap.LngLat实例或者经纬度数组
          return dataItem.position;
        },
        getHoverTitle: function (dataItem) {
          // 返回数据项的Title信息，鼠标hover时显示
          return dataItem.title;
        },
        renderOptions: {
          // 点的样式
          pointStyle: {
            fillStyle: businessColorEnum(data?.[0].code), // 填充色
          }
        },
        autoSetFitView: false // 是否在绘制后自动调整地图视野以适合全部点，
      });
      // 设置数据源，data需要是一个数组
      pointSimplifierIns.setData(data);

      // 监听事件客群客流评估
      // pointSimplifierIns.on('pointClick pointMouseover pointMouseout', function(e, record) {
      //   console.log(e.type, record);
      // });
    }
  };
  useEffect(() => {
    if (!amapIns) return;
    loadPoint();
    loadData();
    return () => {
      amapIns.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [amapIns]);
  const amapCreated = (ins: any) => {
    setAmapIns(ins);
  };

  return (
    <div className={styles['map-polygon-wrapper']} style={{ height: '100%' }}>
      <AMap
        loaded={amapCreated}
        mapOpts={{
          zoom: 15,
          center: data?.center
        }}
        // @ts-ignore
        plugin={['AMap.Adaptor']}
        AMapUI={[
          'misc/PointSimplifier',
        ]}>
      </AMap>
    </div>
  );
};

export default AMapPolygonMarkers;