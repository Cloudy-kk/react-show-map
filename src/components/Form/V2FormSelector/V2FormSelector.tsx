import React, { ReactNode, useContext } from 'react';
import cs from 'classnames';
import styles from './index.module.less';
import { Form, FormItemProps } from 'antd';
import V2Selector from './components/V2Selector';
import { V2FormContext } from '../V2Form';
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

export interface V2FormSelectorProps extends DefaultFormItemProps {
  /**
   * @description 数据化配置选项内容，相比 jsx 定义会获得更好的渲染性能
   * @default []
   */
  options: any[];
  /**
   * @description 变化时回调函数
   */
  onChange?: Function;
  /**
   * @description 设置 Selector 的模式为多选或单选
   * @default single
   */
  mode?: 'multiple' | 'single';
  /**
   * @description 是否必填
   * @default false
   */
  required?: boolean;
  /**
   * @description form实例
   */
  form?: any;
}
/**
* @description 便捷文档地址
* @see https://reactpc.lanhanba.net/components/form/v2form-selector
*/
const V2FormSelector: React.FC<V2FormSelectorProps> = ({
  label,
  name,
  rules = [],
  options,
  mode,
  formItemConfig = {},
  onChange,
  className,
  required,
  noStyle = false,
  disabled,
  form
}) => {
  const { form: baseForm } = useContext(V2FormContext);
  const _form = form || baseForm;
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
      name={name}
      className={cs(styles.V2FormSelector, className)}
      label={label}
      noStyle={noStyle}
      rules={_rules}
      {...formItemConfig}
    >
      <V2Selector
        form={_form}
        name={name}
        options={options}
        mode={mode}
        required={required}
        onChange={onChange}
        disabled={disabled}
      />
    </Form.Item>
  );
};
V2FormSelector.displayName = 'V2FormSelector';
export default V2FormSelector;
