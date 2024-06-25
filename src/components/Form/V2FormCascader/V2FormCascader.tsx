import React, { ReactNode } from 'react';
import cs from 'classnames';
import styles from './index.module.less';
import { Cascader, Form, FormItemProps } from 'antd';
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
}

export interface V2FormCascaderProps extends DefaultFormItemProps {
  /**
   * @description 可选项数据源
   */
  options: any[];
  placeholder?: string;
  /**
   * @description 变化时回调函数
   */
  onChange?: Function;
  /**
   * @description cascader的属性设置，具体请参考 https://ant.design/components/cascader-cn/#API
   * @default   {}
   */
  config?: { [key: string]: any };
  /**
   * @description 额外插入的浮层外层class
   */
  popupClassName?: string;
  /**
   * @description 额外插入的外层class
   */
  className?: string;
  /**
   * @description 是否开启多选模式
   */
  multiple?: boolean;
  /**
   * @description 是否必填
   * @default false
   */
  required?: boolean;
}
/**
* @description 便捷文档地址
* @see https://reactpc.lanhanba.net/components/form/v2form-cascader
*/
const V2FormCascader: React.FC<V2FormCascaderProps> = ({
  label,
  name,
  rules = [],
  noStyle = false,
  options,
  placeholder = `请选择${label || ''}`,
  formItemConfig,
  config,
  multiple = false,
  onChange,
  popupClassName,
  className,
  required,
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
  const _config = Object.assign({
    showArrow: true,
  }, config);
  return (
    <Form.Item
      className={cs(styles.V2FormCascader, 'v2FormCascader', className)}
      noStyle={noStyle}
      name={name}
      label={label}
      rules={_rules}
      {...formItemConfig}
    >
      <Cascader
        options={options}
        onChange={(value, selectedOptions) => onChange && onChange(value, selectedOptions)}
        placeholder={placeholder}
        popupClassName={cs(styles.V2FormCascaderPopup, 'v2FormCascaderPopup', [
          (multiple || config?.multiple) ? styles.V2FormCascaderMultiple : styles.V2FormCascaderSingle
        ], popupClassName)}
        multiple={multiple}
        disabled={disabled}
        suffixIcon={_config.showSearch ? <SearchOutlined /> : undefined}
        {..._config}
      />
    </Form.Item>
  );
};
V2FormCascader.displayName = 'V2FormCascader';
export default V2FormCascader;
