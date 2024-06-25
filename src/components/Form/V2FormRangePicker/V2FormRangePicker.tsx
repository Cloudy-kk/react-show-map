import React, { ReactNode } from 'react';
import { DatePicker, Form, FormItemProps } from 'antd';
import { RangePickerProps } from 'antd/lib/date-picker';

const { RangePicker } = DatePicker;

export interface DefaultFormItemProps {
  /**
   * @description 字段名，支持数组
   */
  name?: string | number | (string | number)[];
  /**
   * @description label 标签的文本
   */
  label?: ReactNode;
  /**
   * @description 为 true 时不带样式，作为纯字段控件使用
   * @default false
   */
  noStyle?: boolean;
  /**
   * @description Form.Item中rule属性设置，具体请参考 https://ant.design/components/form-cn/#Rule
   */
  rules?: any[];
  /**
   * @description Form.Item的属性设置，具体请参考 https://ant.design/components/form-cn/#Form.Item
   * @default   {}
   */
  formItemConfig?: FormItemProps; // Form.Item的其他入参
  /**
   * @description 是否禁用
   * @default false
   */
  disabled?: boolean;
  /**
   * @description 是否必填
   * @default false
   */
  required?: boolean;
}

export interface V2FormRangePickerProps extends DefaultFormItemProps {
  /**
   * @description DatePicker的属性设置，具体请参考 https://ant.design/components/date-picker-cn/#%E5%85%B1%E5%90%8C%E7%9A%84-API
   * @default   {}
   */
  config?: RangePickerProps & { ref?: any }; // antd RangerPicker 的入参
  /**
   *@description 不可选择的日期
   */
  disabledDate?: (date: any) => boolean;
}
/**
* @description 便捷文档地址
* @see https://reactpc.lanhanba.net/components/form/v2form-range-picker
*/
const V2FormRangePicker: React.FC<V2FormRangePickerProps> = ({
  label,
  name,
  rules = [],
  noStyle = false,
  formItemConfig,
  config,
  disabled,
  required
}) => {
  let _rules = rules;
  // 未设置rules 规则,但是有设置必填，就添加一个默认的规则
  // 只要设置了 rules，就完全托管给rules自行校验
  if (!_rules?.length) {
    if (required) {
      _rules = _rules.concat([{ required: true, message: `请选择${label || ''}` }]);
    }
  }
  return (
    <Form.Item noStyle={noStyle} name={name} label={label} rules={_rules} {...formItemConfig}>
      <RangePicker disabled={disabled} {...config} />
    </Form.Item>
  );
};
V2FormRangePicker.displayName = 'V2FormRangePicker';
export default V2FormRangePicker;
