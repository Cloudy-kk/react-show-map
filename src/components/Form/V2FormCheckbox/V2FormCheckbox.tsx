import React, { ReactNode, useMemo } from 'react';
import cs from 'classnames';
import styles from './index.module.less';
import { Checkbox, Form, FormItemProps } from 'antd';
import { CheckboxGroupProps } from 'antd/lib/checkbox';
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
  /**
   * @description 是否禁用
   * @default  false
   */
  disabled?: boolean;
  /**
   * @description 额外插入的外层class
   */
  className?: string;
}

export interface V2FormCheckboxProps extends DefaultFormItemProps {
  /**
   * @description 可选项数据源
   */
  options: any[];
  /**
   * @description 自定义 options 中 label value children 的字段
   */
  fieldNames?: { label: string; value: string };
  /**
   * @description 变化时回调函数
   */
  onChange?: Function;
  /**
   * @description Checkbox的属性设置，具体请参考 https://ant.design/components/checkbox-cn/#API
   * @default   {}
   */
  config?: CheckboxGroupProps & { ref?: any };
  /**
   * @description 是否必填
   * @default false
   */
  required?: boolean;
}
/**
* @description 便捷文档地址
* @see https://reactpc.lanhanba.net/components/form/v2form-checkbox
*/
const V2FormCheckbox: React.FC<V2FormCheckboxProps> = ({
  label,
  name,
  rules = [],
  noStyle = false,
  formItemConfig,
  config,
  options = [],
  onChange,
  disabled,
  required,
  fieldNames = {
    label: 'label',
    value: 'value',
  },
  className
}) => {
  let _rules = rules;
  // 未设置rules 规则,但是有设置必填，就添加一个默认的规则
  // 只要设置了 rules，就完全托管给rules自行校验
  if (!_rules?.length) {
    if (required) {
      _rules = _rules.concat([{ required: true, message: `请选择${label || ''}` }]);
    }
  }
  const formatOptions = useMemo(() => {
    return options.map((option: any) => {
      return {
        ...option,
        label: option[fieldNames.label],
        value: option[fieldNames.value],
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options]);
  return (
    <Form.Item
      name={name}
      label={label}
      required={required}
      rules={_rules}
      noStyle={noStyle}
      className={cs(styles.V2FormCheckbox, className)}
      {...formItemConfig}
    >
      <Checkbox.Group
        options={formatOptions}
        disabled={disabled}
        onChange={(e) => onChange && onChange(e)}
        {...config}
      ></Checkbox.Group>
    </Form.Item>
  );
};
V2FormCheckbox.displayName = 'V2FormCheckbox';
export default V2FormCheckbox;
