/**
 * @description 热力图工具，
 * 需引入地图插件 [AMap.HeatMap]
 * 可搭配工具箱使用，也可单独使用，单独使用的时候通过customSlot自定义样式
 */

import { CSSProperties, ReactNode, forwardRef, useEffect, useImperativeHandle, useMemo, useState } from 'react';
import IconFont from '@/common/components/IconFont';
import styles from './index.module.less';
import cs from 'classnames';
import { CITY_LEVEL, DISTRICT_LEVEL, PROVINCE_LEVEL } from '@/common/components/AMap/ts-config';
import { getHeatMapList } from '@/common/api/selection';
import { isNotEmptyAny } from '@lhb/func';
import { useMethods } from '@lhb/hook';
import { useAmapLevelAndCityNew } from '@/common/hook/useAmapLevelAndCityNew';
import React from 'react';
// import { message } from 'antd';
interface IProps {
  _mapIns:any;
  style?: CSSProperties;
  setSelected?:Function;
  customSlot?:ReactNode;
  extraCityInfo?:any
  externalStatus?:boolean;
  // isShowInCountry?:boolean;// 去掉
  needPermission?:boolean;
  setIsOpenHeatMap?:Function;
  topLevel?:1|2|3|4// 热力图的可显示的最高级别-对应COUNTRY_LEVEL、PROVINCE_LEVEL...
}
const HeatMapTool = forwardRef<any, IProps>(({
  _mapIns, // 地图示例 必传
  style,
  setSelected, // 工具箱高亮 工具箱内使用
  customSlot, // 自定义热力开关插槽
  extraCityInfo, // 通过外部传递相关city参数去手动获取热力信息
  externalStatus = false, // 外部传递的控制开关状态的参数
  // isShowInCountry = false, // 自定义 全国范围下是否要显示热力图,默认全国不显示
  needPermission = false, // 热力图接口是否需要数据权限，默认不需要（目前网规场景需要）
  setIsOpenHeatMap, // 是否打开热力图开关
  topLevel = PROVINCE_LEVEL// 按照之前，默认全国不显示
}, ref) => {

  // useState
  const [heatMapIns, setHeatMapIns] = useState<any>(null); // 热力图实例
  const { city, level, district } = useAmapLevelAndCityNew(_mapIns, false, true); // 缩放层级和城市相关信息
  const [status, setStatus] = useState<boolean>(externalStatus); // 热力图开关


  // useMemo
  const isShowHeatMap = useMemo(() => level >= topLevel, [level]); // 判断是否正处于可视范围下
  const autoGetCity = useMemo(() => !isNotEmptyAny(extraCityInfo), [extraCityInfo]); // 是否需要自动获取城市信息
  const colorShow = useMemo(() => {
    if (!isShowHeatMap) {
      return 'c-999';
    }
    return status ? 'c-006' : 'c-132';
  }, [isShowHeatMap, status]);

  // 初始化热力图是例
  useEffect(() => {
    if (!_mapIns) return;

    if (!window?.AMap?.HeatMap) {
      throw new Error('AMap.HeatMap 未引入！');
    }
    const ins = new window.AMap.HeatMap(_mapIns, {
      radius: 25,
      opacity: [0, 0.6],
    });
    setHeatMapIns(ins);
  }, [_mapIns]);


  // 手动更新热力图
  useEffect(() => {
    if (!heatMapIns) return;
    if (!autoGetCity && status) {
      setStatus(true);
      getHeadMapData(extraCityInfo);
      !isShowHeatMap ? heatMapIns.hide() : heatMapIns.show();
    }
  }, [heatMapIns, status, extraCityInfo?.provinceId, extraCityInfo?.cityId, extraCityInfo?.districtId, district?.id]);
  // 自动更新热力图
  useEffect(() => {
    if (!heatMapIns) return;
    if (!isShowHeatMap) {
      heatMapIns.hide();
      return;
    }
    // 地图层级变化自动获取热力信息
    if (status) {

      autoGetCity && autoSetHeatInfo();
      !isShowHeatMap ? heatMapIns.hide() : heatMapIns.show();
      return;
    }
  }, [heatMapIns, isShowHeatMap, city, level, status, level, district?.id]);

  // 监听status变化
  useEffect(() => {
    if (!heatMapIns) return;
    if (!isShowHeatMap) {
      heatMapIns.hide();
      return;
    }

    if (status) {
      setSelected && setSelected((state) => state + 1);
      heatMapIns.show();
    } else {

      setSelected && setSelected((state) => (state === 0 ? 0 : state - 1));
      heatMapIns.hide();
    }


  }, [status, isShowHeatMap]);

  // 监听externalStatus的变化，当外部传递的参数变化时，更新status的值
  useEffect(() => {
    if (!heatMapIns) return;
    if (externalStatus !== undefined) {
      setStatus(externalStatus);
    }
  }, [externalStatus]);


  const {
    getHeadMapData,
    onClickBtn,
    autoSetHeatInfo
  } = useMethods({

    /**
     * @description 接口获取数据
     * @param params 接口请求参数 provinceId，cityId，districtId
     */
    getHeadMapData: async (params) => {
      const data = await getHeatMapList({
        ...params,
        crowdType: 1,
        needPermission
      });
      data && heatMapIns.setDataSet({ data });
    },

    /**
     * @description 自动获取city有关数据同时配置热力图，通过useMapLevelAndCity获取数据
     */
    autoSetHeatInfo: () => {
      if (!city) return;

      // const index = city?.districtList.findIndex((e) => e.name.includes(city.district));

      // if (index < 0) {
      //   // message.error('无法获取热力图数据');
      //   return;
      // }

      // const districtId = city?.districtList[index].id;

      const { provinceId, id } = city || {};
      const params = {
        provinceId,
        cityId: level === CITY_LEVEL || level === DISTRICT_LEVEL ? id : undefined,
        districtId: level === DISTRICT_LEVEL ? district?.id : undefined,
      };

      getHeadMapData(params);
    },

    /**
     * @description 点击热力图开关
     */
    onClickBtn: () => {

      // 全国情况下不可点击 保留开关状态
      if (!isShowHeatMap) return;

      if (status) {
        setStatus(false);
        setSelected && setSelected((state) => (state === 0 ? 0 : state - 1));
      } else {
        setStatus(true);
        setSelected && setSelected((state) => state + 1);
      }
    },

  });

  // 暴露相关方法
  useImperativeHandle(ref, () => ({
    setStatus, // 控制开关是否显示
  }));
  // 将热力图状态同步到外层（使用的地方），外层需做互斥逻辑
  useEffect(() => {
    setIsOpenHeatMap && setIsOpenHeatMap(status);
  }, [status]);
  return (
    <>
      {customSlot || (
        <div
          className={cs(
            styles.satellite,
            'bg-fff pointer   selectNone',
            colorShow,
          )}
          onClick={onClickBtn}
          style={style}
        >
          <IconFont iconHref='iconic_renkoureli' style={{ width: '14px', height: '14px' }} />
          <span className='inline-block ml-5'>人口热力</span>
        </div>
      )}
    </>
  );
});

export default HeatMapTool;
