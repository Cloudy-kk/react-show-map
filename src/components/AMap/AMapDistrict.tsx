// 省市区地理围栏组件
import { FC, useEffect, useState } from 'react';
import { getDistrictBounds } from '@/common/utils/map';
import styles from './index.module.less';
import AMap from '.';

interface AMapDistrictProps {
  name: String; // 行政区域名称
  amapOptions?:Object;// 地图查询参数 https://lbs.amap.com/demo/jsapi-v2/example/district-search/draw-district-boundaries
}

const AMapDistrict: FC<AMapDistrictProps> = ({ name, amapOptions = {} }) => {
  const [amapIns, setAmapIns] = useState<any>(null); // 地图实例
  const [polygonsBounds, setPolygonsBounds] = useState<Array<any>>([]); // 行政区域边界范围

  const loadData = async (name) => {
    const bounds: any = await getDistrictBounds(
      {
        subdistrict: 0, // 0：不返回下级行政区 1：返回下一级行政区 2：返回下两级行政区 3：返回下三级行政区
        showbiz: false, // 是否显示商圈，默认值true 可选为true/false，为了能够精准的定位到街道，特别是在快递、物流、送餐等场景下，强烈建议将此设置为false
        extensions: 'all',
        level: 'city', // 设置查询行政区级别为 城市
        ...amapOptions
      },
      name);
    polygonsBounds && amapIns && amapIns.remove(polygonsBounds); // 清除上次结果
    const polygons: Array<any> = [];
    for (let i = 0, l = bounds.length; i < l; i++) {
      // 生成行政区划polygon
      const polygon = new window.AMap.Polygon({
        path: bounds[i],
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
    amapIns.add(polygons);
    amapIns.setFitView(polygons); // 视口自适应
  };
  useEffect(() => {
    if (!amapIns || !name) return;
    loadData(name);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [amapIns, name]);
  const amapCreated = (ins: any) => {
    setAmapIns(ins);
  };

  return (
    <div className={styles['map-polygon-wrapper']} style={{ height: '100%' }}>
      <AMap
        loaded={amapCreated}
        plugins={[
          'AMap.DistrictSearch',
        ]}>
      </AMap>
    </div>
  );
};

export default AMapDistrict;
