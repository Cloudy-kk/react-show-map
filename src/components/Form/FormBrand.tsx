/**
 * @Description form中的品牌列表（模糊查询）
 */

import { FC, useState, useRef, forwardRef, useImperativeHandle } from 'react';
import { Form } from 'antd';
import { getBrand } from '@/common/api/recommend';
import Fuzzy from './V2Fuzzy';

const FormBrand: FC<any> = forwardRef(({
  name,
  label,
  extraParams = { // 接口入参
    origin: 2
  },
  formItemConfig,
  ...props
}, ref) => {
  const fuzzyRef: any = useRef(null);
  const [data, setData] = useState();

  const loadData = async (keyword?: string) => {
    const params = {
      keyword,
      ...extraParams
    };
    // 该接口目前不分页，单个租户不会配置大量的品牌，故接口说目前返回的就是所有，不需要分页
    const data = await getBrand(params);
    setData(data);
    return Promise.resolve(data);
  };

  useImperativeHandle(ref, () => ({
    // 用来对外抛出完整的原始数据，当外部需要的不仅是id，而是更多item内的数据时使用
    // 场景示例：外部包了一层FormCom 组件，在onCHange时，通过getData拿到数据，然后包装好后，可以传出 {id: 1, name: xx, mobile: yy, ...} 等完整item数据。
    getData() {
      return data;
    },
    // 用来插入额外的option
    // 场景示例：点位弹窗，点击新增点位后，为了不让fuzzy重新loadData数据，可以直接 add一条新添加的数据进去即可。下次查询操作后就会被重置。
    addOption: fuzzyRef.current?.addOption,
    // 用来插入默认的options，此时需要设置props.immediateOnce 为 false
    // 场景示例：在编辑弹窗反向填充
    setOptions: fuzzyRef.current?.setOptions,
    selectRef: fuzzyRef.current?.selectRef,
    getItem: (data) => fuzzyRef.current?.getItem(data)
  }));

  return (
    <Form.Item
      name={name}
      label={label}
      {...formItemConfig}
    >
      <Fuzzy
        ref={fuzzyRef}
        loadData={loadData}
        fieldNames={{
          label: 'name',
          value: 'id',
        }}
        {...props}
      />
    </Form.Item>
  );
});

export default FormBrand;
