/**
 * 省市区/省市-存入redux中
 * */

import { useEffect, FC } from 'react';
import { Cascader } from 'antd';
import { CascaderProps } from 'antd/lib/cascader/index';
import { useSelector, useDispatch } from 'react-redux';
import { changeProvinceCityDistrict, changeProvincesCities } from '@/store/common';

import { areaList } from '@/common/api/common';
import { isArray } from '@lhb/func';

interface ProvinceListProp {
  type: number; // 默认是1 即省市区 如需省市，则传2
  // config?: CascaderProps<any>;
  placeholder?: string;
  value?: any;
  onChange?: Function;
  finallyData?: Function;
}

const ProvinceList: FC<ProvinceListProp & CascaderProps<any>> = ({
  type = 1,
  placeholder,
  finallyData,
  ...props }) => {
  const defaultProps = {
    ...(props.value && { value: props.value }),
    ...(props.onChange && { onChange: props.onChange }),
  };
  const province = useSelector((state: any) =>
    type === 1 ? state.common.provinceCityDistrict : state.common.provincesCities
  );
  const dispatch = useDispatch();

  useEffect(() => {
    const getAreaList = async () => {
      // type可能会是null
      const cityResult = await areaList({ type: type || 1 });
      if (type === 1) {
        dispatch(changeProvinceCityDistrict(cityResult));
      } else {
        dispatch(changeProvincesCities(cityResult));
      }
    };
    // 如果不存在则进行请求
    if (!province.length) {
      getAreaList();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);

  useEffect(() => {
    if (!(isArray(province) && province.length)) return;
    finallyData && finallyData(province);
  }, [province]);

  return (
    <Cascader
      allowClear
      showSearch
      {...defaultProps}
      {...props}
      options={province}
      placeholder={placeholder}
      fieldNames={{ label: 'name', value: 'id', children: 'children' }}
    />
  );
};

export default ProvinceList;
