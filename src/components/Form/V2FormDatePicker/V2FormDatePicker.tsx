import React, { ReactNode } from 'react';
import { DatePicker, DatePickerProps, Form, FormItemProps } from 'antd';

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
   * @description 输入框提示
   */
  placeholder?: string;
  /**
   * @description 为 true 时不带样式，作为纯字段控件使用
   * @default  false
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
   * @default  false
   */
  disabled?: boolean;
  /**
   * @description 是否必填
   * @default false
   */
  required?: boolean;
}

export interface V2FormDatePickerProps extends DefaultFormItemProps {
  /**
   * @description DatePicker的属性设置，具体请参考 https://ant.design/components/date-picker-cn/#DatePicker
   * @default   {}
   */
  config?: DatePickerProps & { ref?: any }; // antd DataPicker 的入参
}
/**
* @description 便捷文档地址
* @see https://reactpc.lanhanba.net/components/form/v2form-date-picker
*/
const V2FormDatePicker: React.FC<V2FormDatePickerProps> = ({
  label,
  name,
  rules = [],
  noStyle = false,
  placeholder = `请选择${label || ''}`,
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
      <DatePicker placeholder={placeholder} disabled={disabled} {...config} />
    </Form.Item>
  );
};
V2FormDatePicker.displayName = 'V2FormDatePicker';
export default V2FormDatePicker;
