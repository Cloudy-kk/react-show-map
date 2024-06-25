import React, { ReactNode } from 'react';
import { Form, FormItemProps, Input } from 'antd';
import { PasswordProps } from 'antd/lib/input';

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
}

//  密码输入框
export interface V2FormInputPasswordProps extends DefaultFormItemProps {
  /**
   * @description 输入框提示
   */
  placeholder?: string;
  /**
   * @description 是否必填
   * @default false
   */
  required?: boolean;
  /**
   * @description 是否禁用
   * @default
   */
  disabled?: boolean;
  /**
   * @description 带有前缀图标的 input
   */
  prefix?: ReactNode;
  /**
   * @description InputNumber的属性配置，具体请参考 https://ant.design/components/input-cn/#Input.Password
   */
  config?: PasswordProps & { ref?: any }; // antd input password的入参
}
/**
* @description 便捷文档地址
* @see https://reactpc.lanhanba.net/components/form/v2form-input-password
*/
const V2FormInputPassword: React.FC<V2FormInputPasswordProps> = ({
  label,
  name,
  rules = [],
  placeholder = `请输入${label || ''}`,
  prefix,
  formItemConfig = {},
  config = {},
  disabled,
  required
}) => {
  let _rules = rules;
  // 未设置rules 规则,但是有设置必填，就添加一个默认的规则
  // 只要设置了 rules，就完全托管给rules自行校验
  if (!_rules?.length) {
    if (required) {
      _rules = _rules.concat([{ required: true }]);
    }
  }
  return (
    <Form.Item name={name} label={label} rules={_rules} {...formItemConfig}>
      <Input.Password placeholder={placeholder} prefix={prefix} disabled={disabled} {...config} />
    </Form.Item>
  );
};
V2FormInputPassword.displayName = 'V2FormInputPassword';
export default V2FormInputPassword;
