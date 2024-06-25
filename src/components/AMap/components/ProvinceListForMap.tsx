import { CSSProperties, FC, useEffect, useRef, useState } from 'react';

import ProvinceList from '@/common/components/ProvinceList';

import { useMethods } from '@lhb/hook';
import { CITY_LEVEL, CITY_ZOOM, CQ_CODE_SUBURB, CQ_SUBURB_NAME, DISTRICT_LEVEL, DISTRICT_ZOOM, PROVINCE_LEVEL, PROVINCE_ZOOM } from '../ts-config';
import { setStorage } from '@lhb/cache';

// 地图省市区联动插件
const ProvinceListForMap: FC<{
  className?: string;
  style?: CSSProperties;
  city: any;
  level: number;
  _mapIns?: any;
  type?: number; // 默认是1 即省市区 如需省市，则传2
  config?:any;
  finallyData?: Function;
  onChange?: Function;
}> = ({
  className,
  style = { width: '100%', maxWidth: 200 },
  city,
  level,
  _mapIns,
  type = 1,
  onChange,
  config,
  finallyData
}) => {
  const selectListRef = useRef<any>([]); // 存储选择的项包含名称之类
  const changeLockRef = useRef<boolean>(true); // 用来准确判断是修改了下拉框选项，然后去跳转位置
  const [selectList, setSelectList] = useState<any>([]);
  useEffect(() => {
    const select: any = [];
    (level >= PROVINCE_LEVEL) && city?.provinceId && select.push(city.provinceId);
    (level >= CITY_LEVEL) && city?.id && select.push(city.id);
    (level >= DISTRICT_LEVEL && type === 1) && city?.districtList?.forEach(district => {
      if (district.name === city.district) {
        select.push(district.id);
      }
    });
    setSelectList(select);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [city, level]);
  const {
    onChangeProvince,
    onDropdownVisibleChange,
    customCQ,
  } = useMethods({
    onChangeProvince: (val, selectedOptions) => {
      setSelectList(val || []);
      selectListRef.current = selectedOptions || [];
      !changeLockRef.current && (changeLockRef.current = true);
      onChange && onChange(val, selectedOptions);
    },
    onDropdownVisibleChange: (value) => {
      // 关闭下拉框时判断是否需要将地图定位
      if (changeLockRef.current && !value) {
        changeLockRef.current = false;
        const district = selectListRef.current?.at(-1);
        // 根据选项的长度判断地图放大级别
        /**
         * 0: 全国
         * 1: 省级
         * 2: 市
         * 3: 区
         */
        const zoomMap = [4, PROVINCE_ZOOM, CITY_ZOOM, DISTRICT_ZOOM];
        if (district) {
          // 处理选择重庆市/重庆郊县的特殊逻辑
          customCQ(district);
          _mapIns && _mapIns.setZoomAndCenter(zoomMap[selectListRef.current.length], [district.lng, district.lat], false, 300);
        }
      };
    },
    // 处理选择重庆市(省级别)下重庆市(城市级别)/重庆郊县(城市级别)的特殊逻辑
    customCQ: (city: any) => {
      const { code } = city || {};
      if (code !== CQ_CODE_SUBURB) return;
      setStorage('CQ_SUBURB_NAME', CQ_SUBURB_NAME);
    }
  });
  return <ProvinceList
    className={className}
    type={type}
    changeOnSelect
    bordered={false}
    allowClear={false}
    expandTrigger='hover'
    style={style}
    value={selectList}
    placeholder='请选择省市区'
    onChange={onChangeProvince}
    onDropdownVisibleChange={onDropdownVisibleChange}
    finallyData={finallyData}
    {...config}
  />;
};

export default ProvinceListForMap;

