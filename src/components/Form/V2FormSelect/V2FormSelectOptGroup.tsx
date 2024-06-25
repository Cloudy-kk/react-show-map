import React, { ReactNode } from 'react';
import cs from 'classnames';
import styles from './index.module.less';
import { Form, FormItemProps, Select, SelectProps } from 'antd';
const { Option, OptGroup } = Select;

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
   * @description 额外插入的外层class
   */
  className?: string;
  /**
   * @description 是否禁用
   */
  disabled?: boolean;
}

interface FieldNames {
  value: string;
  label: string;
  children: string;
}

export interface V2FormSelectOptGroupProps extends DefaultFormItemProps {
  fieldNames?: FieldNames;
  options: any[];
  placeholder?: string;
  allowClear?: boolean;
  /**
   * @description 设置 Select 的模式为多选或标签
   * @type multiple | tags
   */
  mode?: 'multiple' | 'tags';
  /**
   * @description 额外插入的浮层外层class
   */
  popupClassName?: string;
  /**
   * @description Select的属性设置，具体请参考https://ant.design/components/select-cn/
   */
  config?: SelectProps & { ref?: any }; // antd Select 的入参
  /**
   * @description 是否必填
   */
  required?: boolean;
}
/**
* @description 便捷文档地址
* @see https://reactpc.lanhanba.net/components/form/v2form-select
*/
const V2FormSelectOptGroup: React.FC<V2FormSelectOptGroupProps> = ({
  label,
  name,
  rules = [],
  required,
  options,
  placeholder = `请选择${label || ''}`,
  allowClear = true,
  fieldNames = { label: 'label', value: 'value', children: 'children' },
  mode,
  noStyle,
  formItemConfig,
  popupClassName,
  className,
  config,
  disabled
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
    <Form.Item name={name} label={label} noStyle={noStyle} className={cs(styles.V2FormSelectOptGroup, className)} rules={_rules} {...formItemConfig}>
      <Select mode={mode} disabled={disabled} placeholder={placeholder} allowClear={allowClear} popupClassName={cs(styles.V2FormSelectOptGroupPopup, popupClassName)} {...config}>
        {!!options.length &&
          options.map((item, index) => (
            <OptGroup key={index} label={item[fieldNames.label]}>
              {Array.isArray(item[fieldNames.children]) &&
                item[fieldNames.children].map((child: any) => (
                  <Option key={child[fieldNames.value]} value={child[fieldNames.value]}>
                    {child[fieldNames.label]}
                  </Option>
                ))}
            </OptGroup>
          ))}
      </Select>
    </Form.Item>
  );
};
V2FormSelectOptGroup.displayName = 'V2FormSelectOptGroup';
export default V2FormSelectOptGroup;
