import React, { ReactNode } from 'react';
import cs from 'classnames';
import styles from './index.module.less';
import { Form, FormItemProps, Select, SelectProps } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
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
   * @description 额外插入的外层class
   */
  className?: string;
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
}

// select框
export interface V2FormSelectProps extends DefaultFormItemProps {
  /**
   * @description 数据化配置选项内容，相比 jsx 定义会获得更好的渲染性能
   * @default []
   */
  options: any[];
  /**
   * @description 输入框提示
   */
  placeholder?: string;
  /**
   * @description 是否允许清空
   * @default true
   */
  allowClear?: boolean;
  /**
   * @description 变化时回调函数
   */
  onChange?: Function;
  /**
   * @description 设置 Select 的模式为多选或标签
   */
  mode?: 'multiple' | 'tags';
  /**
   * @description Select的属性设置，具体请参考https://ant.design/components/select-cn/
   * @default   {}
   */
  config?: SelectProps & { ref?: any };
  /**
   * @description 额外插入的浮层外层class
   */
  popupClassName?: string;
  /**
   * @description 是否必填
   * @default false
   */
  required?: boolean;
}
/**
* @description 便捷文档地址
* @see https://reactpc.lanhanba.net/components/form/v2form-select
*/
const V2FormSelect: React.FC<V2FormSelectProps> = ({
  label,
  name,
  rules = [],
  options,
  placeholder = `请选择${label || ''}`,
  allowClear = true,
  mode,
  formItemConfig = {},
  config = {},
  onChange,
  className,
  popupClassName,
  required,
  noStyle = false,
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
  const optionFilterProp = config.fieldNames?.label || 'label';
  const _config = Object.assign({ // 默认设置 optionFilterProp 为label
    optionFilterProp,
    showArrow: true,
    showSearch: mode === 'multiple'
  }, config);
  return (
    <Form.Item
      name={name}
      className={cs(styles.V2FormSelect, className)}
      label={label}
      noStyle={noStyle}
      rules={_rules}
      {...formItemConfig}
    >
      <Select
        mode={mode}
        popupClassName={cs(styles.V2FormSelectPopup, popupClassName)}
        options={options}
        placeholder={placeholder}
        allowClear={allowClear}
        onChange={(...props) => onChange && onChange(...props)}
        disabled={disabled}
        suffixIcon={_config.showSearch ? <SearchOutlined /> : undefined}
        {..._config}
      />
    </Form.Item>
  );
};
V2FormSelect.displayName = 'V2FormSelect';
export default V2FormSelect;
