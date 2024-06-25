/**
 * @Description 获取用户当前位置
 * 通过高德地图获取当前用户所在的位置信息(浏览器定位)
 */

import { useEffect, useState } from 'react';
import { isArray } from '@lhb/func';
import { fetchCityIdByName } from '@/common/api/selection'; //接口: 根据城市名称获取cityId（后端匹配定义）
import { getCurPosition, getLngLatAddress } from '@/common/utils/map';

/**
 * 获取用户定位信息，默认返回省市区的id和name
 * @param mapIns 地图实例
 * @param config 自定义配置
 * @param hasAddress 是否需要定位的地址
 */
export function useCurLocation(
  mapIns: any,
  config = {},
  /** 是否需要返回具体的位置信息 */
  hasAddress = false,
) {

  // 用户当前位置信息
  const [locationInfo, setLocationInfo] = useState<any>({});

  useEffect(() => {
    if (!mapIns) return;
    getLocation();
  }, [mapIns]);

  /** 获取定位信息*/
  const getLocation = async () => {
    const res: any = {};
    try {
      const info: any = await getCurPosition(mapIns, {
        // https://lbs.amap.com/api/javascript-api-v2/documentation#geolocation
        // 是否显示定位按钮
        showButton: false,
        showCircle: true,
        showMarker: false,
        ...config,
      });
      // 拿到用户所在的省市信息和定位
      const { city, province, position } = info || {};
      const name = city || province; // 直辖市没有city名
      if (isArray(position) && position.length) { // 需要地址信息
        if (hasAddress) {
          const address = await getLngLatAddress(position);
          address && (res.address = address);
        }
        +(position[0]) && (res.lng = +position[0]);
        +(position[1]) && (res.lat = +position[1]);
      }
      // 拿到区的信息（是因为getCurPosition中的zoomToAccuracy这个参数）
      mapIns.getCity(async (curInfo: any) => {
        const { district } = curInfo; // 拿到当前所在的区
        if (!name) return;
        const cityInfo = await fetchCityIdByName({ name }); // 通过城市查找该城市下所有的区
        const { districtList, id: cityId, provinceId, name: cityName } = cityInfo || {};
        res.provinceId = provinceId;
        res.provinceName = province;
        res.cityId = cityId;
        res.cityName = cityName;
        // 匹配到对应的区信息
        const targetDistrict = districtList?.find((districtItem: any) => districtItem?.name?.includes(district));
        if (targetDistrict) {
          const { id: districtId, name: districtName } = targetDistrict;
          res.districtId = districtId;
          res.districtName = districtName;
          setLocationInfo(res);
          return;
        }
        setLocationInfo(res);
      });
    } catch (error) {
      console.log(`获取用户定位失败：`, error);
    }
  };

  return locationInfo;
}
