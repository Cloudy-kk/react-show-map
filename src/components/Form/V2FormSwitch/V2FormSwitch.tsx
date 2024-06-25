import React, { ReactNode } from 'react';
import { Form, FormItemProps, Switch, SwitchProps } from 'antd';
import cs from 'classnames';
import styles from './index.module.less';

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
   * @description 是否必填
   * @default false
   */
  required?: boolean;
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

// select框
export interface V2FormSwitchProps extends DefaultFormItemProps {
  /**
   * @description 子节点的值的属性，如 Switch 的是 'checked'。该属性为 getValueProps 的封装，自定义 getValueProps 后会失效
   */
  valuePropName?: string;
  /**
   * @description 初始是否选中
   * @default false
   */
  defaultChecked?: boolean;
  /**
   * @description 变化时回调函数
   */
  onChange?: Function;
  /**
   * @description Switch的属性设置，具体请参考https://ant.design/components/switch-cn/#API
   * @default   {}
   */
  config?: SwitchProps & { ref?: any };
  /**
   * @description 额外插入的外层class
   */
  className?: string;
  /**
   * @description 是否禁用
   * @default false
   */
  disabled?: boolean;
}
/**
* @description 便捷文档地址
* @see https://reactpc.lanhanba.net/components/form/v2form-switch
*/
const V2FormSwitch: React.FC<V2FormSwitchProps> = ({
  label,
  name,
  rules = [],
  noStyle = false,
  valuePropName = 'checked',
  formItemConfig,
  config,
  onChange,
  defaultChecked,
  className,
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
    <Form.Item
      noStyle={noStyle}
      name={name}
      label={label}
      rules={_rules}
      valuePropName={valuePropName}
      {...formItemConfig}
    >
      <Switch
        defaultChecked={defaultChecked}
        onChange={(checked, event) => onChange && onChange(checked, event)}
        className={cs(styles.V2FormSwitch, className)}
        disabled={disabled}
        {...config} />
    </Form.Item>
  );
};
V2FormSwitch.displayName = 'V2FormSwitch';
export default V2FormSwitch;
