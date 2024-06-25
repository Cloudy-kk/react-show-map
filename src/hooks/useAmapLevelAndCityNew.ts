/**
 * @Description 监听地图缩放/移动时，获取当前地图中心点的城市信息和当前地图Markers显示的缩放级别（自定义的缩放级别，比如显示全国省份的级别、省份下所有地级市的级别等）
 */
import { debounce } from '@lhb/func';
import {
  useState,
  useEffect,
  useMemo,
  useRef
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { changeProvinceCityDistrict } from '@/store/common';
// import { fetchCityIdByName } from '@/common/api/selection';
import {
  COUNTRY_LEVEL,
  PROVINCE_ZOOM,
  CITY_ZOOM,
  PROVINCE_LEVEL,
  DISTRICT_ZOOM,
  CITY_LEVEL,
  DISTRICT_LEVEL,
  City,
  // CQ_SUBURB_NAME,
  getAMapCityName
} from '@/components/AMap/ts-config';
import { areaList } from '../api/common';

/**
 * @description 返回当前地图中心点的城市信息和地图显示Markers的缩放级别hooks
 * @param {Object} amapIns 地图实例
 * @param {Boolean} isInit 是否需要在地图初始化完成的时候执行一次（默认初始化地图时不会触发地图的zoomend/moveend等事件）
 * @param {Boolean} districtGranularity 是否监听区级别的变化
 * @return {Object} { city, level } 城市和显示Markers缩放级别
 */
export function useAmapLevelAndCityNew(
  amapIns,
  isInit = false,
  districtGranularity = false
) {
  const [level, setLevel] = useState<number>(COUNTRY_LEVEL); // 当前显示Markers的缩放级别
  const levelRef: any = useRef(level);
  const [city, setCity] = useState<City | null>(); // 当前城市信息
  const cityRef: any = useRef(); // 存储最新的城市信息
  // const [] = useState<number>();
  const nameRef: any = useRef();
  const cityForAMap = useSelector((state: any) => state.common.cityForAMap);
  const dispatch = useDispatch();


  useEffect(() => {
    const getAreaList = async () => {
      const cityResult = await areaList({ type: 1 });
      dispatch(changeProvinceCityDistrict(cityResult));
    };
    // 如果不存在则进行请求
    if (!cityForAMap.length) {
      getAreaList();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!amapIns) return;
    if (!cityForAMap?.length) return;
    // 监听地图缩放
    amapIns.on('zoomend', zoomChange);
    // 监听地图移动结束
    amapIns.on('moveend', centerChange);
    // 需要主动触发对应的方法来获取缩放级别和地图中心点城市
    if (isInit) {
      zoomChange();
      centerChange();
    }

    return () => { // 解除监听事件
      amapIns && amapIns.off('zoomend', zoomChange);
      amapIns && amapIns.off('moveend', centerChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [amapIns, cityForAMap]);


  useEffect(() => {
    if (!city) return;
    cityRef.current = city;
  }, [city]);

  // 地图缩放事件
  const zoomChange = debounce(() => {
    const curZoom = amapIns.getZoom(); // 获取当前缩放级别
    let curLevel = 0;
    // 定义地图的缩放级别在不同范围时映射到自定义的显示Markers级别
    if (curZoom < PROVINCE_ZOOM) {
      curLevel = COUNTRY_LEVEL;
    } else if (curZoom < CITY_ZOOM) {
      curLevel = PROVINCE_LEVEL;
    } else if (curZoom < DISTRICT_ZOOM) {
      curLevel = CITY_LEVEL;
    } else {
      curLevel = DISTRICT_LEVEL;
    }
    if (curLevel !== levelRef.current) {
      setLevel(curLevel);
      levelRef.current = curLevel;
    }
  }, 150);


  // 地图移动结束
  const centerChange = debounce(() => {
    amapIns.getCity((curInfo: any) => {
      // 城市没有变化时
      if (curInfo?.citycode === cityRef.current?.citycode) {
        // 不监听区的变化
        if (!districtGranularity) return;
        // 区没有变化时
        if (curInfo?.district === cityRef.current?.district) return;
      }

      const name = getAMapCityName(curInfo);

      if (!name) {
        // 移出中华人民共和国领土范围时
        setCity(null);
        return;
      }
      // name没有变化时不重复请求接口
      if (nameRef.current === name && !districtGranularity) return;
      nameRef.current = name;
      const target = cityForAMap.find(item => item.name.indexOf(name) > -1);
      if (target) {
        setCity({
          ...curInfo,
          name: target.name,
          id: target.id,
          provinceId: target.provinceId,
          districtList: target.district
        });
      }


    });
  }, 150);

  return useMemo(() => ({
    level,
    city,
    district: city?.districtList?.find((item: any) => item.name === city?.district)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [level, city?.id, districtGranularity ? city?.district : null]);

}
