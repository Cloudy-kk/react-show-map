/**
 * 省市区/省市-存入redux中
 */

import React, { useEffect } from 'react';
import cs from 'classnames';
import styles from '../V2FormCascader/index.module.less';
import { Cascader } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import { changeProvinceCityDistrict, changeProvincesCities } from '@/store/common';

import { areaList } from '@/common/api/common';

const { SHOW_CHILD } = Cascader;

const V2ProvinceList: React.FC<any> = ({
  type = 1,
  popupClassName,
  multiple,
  fieldNames,
  ...props
}) => {
  const _fieldNames = Object.assign({ label: 'name', value: 'id', children: 'children' }, fieldNames);

  const province = useSelector((state: any) =>
    type === 1 ? state.common.provinceCityDistrict : state.common.provincesCities
  );
  const dispatch = useDispatch();

  useEffect(() => {
    const getAreaList = async () => {
      const cityResult = await areaList({ type });
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

  return (
    <Cascader
      popupClassName={cs(styles.V2FormCascaderPopup, 'v2FormCascaderPopup', [
        multiple ? styles.V2FormCascaderMultiple : styles.V2FormCascaderSingle
      ], popupClassName)}
      multiple={multiple}
      showCheckedStrategy={SHOW_CHILD}
      fieldNames={_fieldNames}
      {...props}
      options={province}
    />
  );
};

export default V2ProvinceList;
