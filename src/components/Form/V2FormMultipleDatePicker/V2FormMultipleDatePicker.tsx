/*
* version: 当前版本2.7.0
*/
import React, { ReactNode } from 'react';
import { NamePath } from 'antd/lib/form/interface';
import { Form, FormItemProps } from 'antd';
import V2MultipleDatePicker from './V2MultipleDatePicker';
import styles from './index.module.less';
import cs from 'classnames';

export interface DefaultFormItemProps {
  /**
   * @description 字段名，支持数组
   */
  name?: NamePath | any;
  /**
   * @description label 标签的文本
   */
  label?: ReactNode;
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
   */
  formItemConfig?: FormItemProps; // Form.Item的其他入参
  /**
   * @description 是否必填
   * @default false
   */
  required?: boolean;
}
/**
* @description 便捷文档地址
* @see https://reactpc.lanhanba.net/components/form/v2form-multiple-date-picker
*/
export interface V2FormMultipleDatePickerProps extends DefaultFormItemProps {
  /**
   * @description MultipleDatePicker配置，详见下方 config 配置
   */
   config?: any;
  /**
   * @description Select的属性设置，具体请参考https://ant.design/components/select-cn/
  */
  selectProps?: any;
  /**
   * @description 是否禁用
   */
  disabled?: boolean;
  /**
   * @description 空时显示的提示
   * @default 请选择日期
   */
  placeholder?: string;
  /**
   * @description 选项变化时的回调函数
   * @type function(e:Event)
   */
  onChange?: Function;
}

const V2FormMultipleDatePicker: React.FC<V2FormMultipleDatePickerProps> = ({
  label,
  name,
  rules = [],
  placeholder,
  formItemConfig = {},
  config = {},
  onChange,
  selectProps,
  noStyle = false,
  disabled = false,
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
    <Form.Item name={name} label={label} rules={_rules} noStyle={noStyle} required={required} valuePropName='selectedDate' className={cs(styles.V2FormMultipleDatePicker, 'v2FormMultipleDatePicker')} {
      ...formItemConfig
    }>
      <V2MultipleDatePicker
        placeholder={placeholder}
        onChange={(e) => onChange && onChange(e)}
        selectProps={selectProps}
        disabled={disabled || config.disabled}
        required={required}
        {...config}
      />
    </Form.Item>
  );
};
V2FormMultipleDatePicker.displayName = 'V2FormMultipleDatePicker';
export default V2FormMultipleDatePicker;
