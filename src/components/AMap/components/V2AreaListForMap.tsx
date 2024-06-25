/**
 * @Description 在地图页作为工具栏使用的省市/省市区组件
 */

import { FC, useEffect, useState } from 'react';
import { isEqual } from '@lhb/func';
import {
  PROVINCE_ZOOM,
  CITY_ZOOM,
  DISTRICT_ZOOM,
  PROVINCE_LEVEL,
  CITY_LEVEL,
  DISTRICT_LEVEL,
} from '../ts-config';
// import cs from 'classnames';
// import styles from './index.module.less';
import ProvinceList from '@/common/components/ProvinceList';

const zoomMap = [PROVINCE_ZOOM, CITY_ZOOM, DISTRICT_ZOOM];
const V2AreaListForMap: FC<any> = ({
  className,
  style,
  mapIns, // 地图实例
  mapHelpfulInfo, // useAmapLevelAndCityNew 的返回值
  type = 1, // 默认是1 即省市区 如需省市，则传2
  finallyData, // 将组件内部的数据暴露出去的回调函数
  change, // 将组件内部的onChange事件暴露出去
  followChange, // 将组件内部的联动状态时的数据暴露出去
  dropdownVisibleChange, // 将组件内部的onDropdownVisibleChange事件暴露出去
  options, // 该组件自身的配置项
  config, // 自定义配置（针对底层的Cascader组件的配置项）
}) => {
  const {
    isFollow, // 是否和地图联动
  } = options || {};
  const [data, setData] = useState<any[]>([]); // 数据源
  const [changeValue, setChangeValue] = useState<any>({
    value: [],
    options: [],
    type: 1, // 1. 手动操作选中， 2. useEffect的自动赋值
  });
  const [dropdownVisible, setDropdownVisible] = useState<boolean>(false);
  // 监听选中后关闭下拉框，地图定位到对应省/市/区的逻辑
  useEffect(() => {
    if (!mapIns) return;
    const { value, options, type } = changeValue;
    if (type !== 1) return; // useEffect的自动赋值不触发下面的逻辑
    const len = value?.length;
    if (!dropdownVisible && len > 0) { // 关闭下拉框后，将地图定位到选中的省份/城市
      const target = options[len - 1];
      const { lng, lat } = target || {};
      +lng && +lat && (mapIns.setZoomAndCenter(zoomMap[len - 1], [+lng, +lat]));
    }
  }, [mapIns, changeValue, dropdownVisible]);
  // 监听地图中心点的变化，自动选中省市/省市区的逻辑
  useEffect(() => {
    if (isFollow) { // 与地图联动
      const { city, level, district } = mapHelpfulInfo || {};
      const { provinceId, id } = city || {};
      const target: any = {
        value: [],
        options: [],
        type: 2
      };
      // 省级别视角
      if (level === PROVINCE_LEVEL && provinceId) {
        target.value = [provinceId];
        const province = data.find((item) => item.id === provinceId);
        province && (target.options = [province]);
      } else if (level === CITY_LEVEL && provinceId && id) { // 市级别视角
        target.value = [provinceId, id];
        const { province, city } = getProvinceCity(data, provinceId, id);
        province && city && (target.options = [province, city]);
      } else if (level === DISTRICT_LEVEL) { // 区级别
        if (type === 1) { // 省市区
          target.value = [provinceId, id, district?.id];
          const { province, city } = getProvinceCity(data, provinceId, id);
          province && city && district && (target.options = [province, city, district]);
        } else { // 省市
          target.value = [provinceId, id];
          const { province, city } = getProvinceCity(data, provinceId, id);
          province && city && (target.options = [province, city]);
        }
      }
      // 没有变化时，不重新set（setZoomAndCenter会触发地图moveend，注意死循环）
      if (isEqual(target, changeValue)) return;
      setChangeValue(target);
      followChange && followChange(target.options);
    }
  }, [data, isFollow, mapHelpfulInfo]);

  const onChange = (value, selectedOptions) => { // 下拉框关闭时的选择项
    setChangeValue({
      value,
      options: selectedOptions,
      type: 1
    });
    change && change(value, selectedOptions);
  };
  const onDropdownVisibleChange = (visible) => { // 下拉框的显示/隐藏
    setDropdownVisible(visible);
    dropdownVisibleChange && dropdownVisibleChange(visible);
  };
  const finallyDataHijack = (data: any[]) => {
    setData(data);
    finallyData && finallyData(data);
  };

  const getProvinceCity = (dataArr: any[], provinceId: number, cityId: number) => {
    const province = dataArr.find((item) => item.id === provinceId);
    const { children } = province || {};
    const city = children?.find((item) => item.id === cityId);
    return {
      province,
      city
    };
  };

  return (
    <ProvinceList
      className={className}
      type={type}
      // 默认点击即改变，该组件目前的使用场景决定的，不要修改此值
      changeOnSelect
      allowClear={false}
      value={changeValue.value}
      placeholder={`${type === 1 ? '请选择省市区' : '请选择省市'}`}
      onChange={onChange}
      onDropdownVisibleChange={onDropdownVisibleChange}
      finallyData={finallyDataHijack}
      style={style}
      {...config}
    />
  );
};

export default V2AreaListForMap;

