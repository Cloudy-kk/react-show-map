import React, { ReactNode, memo } from 'react';
import cs from 'classnames';
import styles from '../V2FormCascader/index.module.less';
import { CascaderProps, Form, FormItemProps } from 'antd';
import V2ProvinceList from './V2ProvinceList';
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
export interface V2FormProvinceListProps extends DefaultFormItemProps {
  /**
   * @description 额外插入的外层class
   */
  className?: string;
  /**
   * @description 额外插入的浮层外层class
   */
  popupClassName?: string;
  /**
   * @description 输入框提示
   * @default  如有label则为请输入+label，否则为请输入
   */
  placeholder?: string;
  /**
   * @description cascader的属性设置，具体请参考 https://ant.design/components/cascader-cn/#API
   * @default {}
   */
  config?: CascaderProps<any>;
  /**
   * @description 控件类型，type(1: 省市区, 2: 省市)
   */
  type?: number;
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
   * @description 是否开启多选模式
   */
  multiple?: boolean;
  /**
   * @description 是否显示重置按钮
   * @default true
   */
  allowClear?: boolean;
  /**
   * @description 是否启用可搜索功能
   * @default true
   */
  showSearch?: boolean;
  /**
   * @description 多选下，tag的显示方式
   * @default responsive
   */
  maxTagCount?: string;
}
/**
* @description 便捷文档地址
* @see https://reactpc.lanhanba.net/components/form/v2form-province-list
*/
const V2FormProvinceList: React.FC<V2FormProvinceListProps> = memo(({
  name,
  label,
  rules = [],
  placeholder = `请选择${label || ''}`,
  type = 1,
  className,
  popupClassName,
  formItemConfig = {},
  config = {},
  noStyle,
  required,
  multiple,
  disabled,
  allowClear = true,
  showSearch = true,
  maxTagCount = 'responsive'
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
      <V2ProvinceList
        multiple={multiple}
        disabled={disabled}
        popupClassName={popupClassName}
        placeholder={placeholder}
        type={type}
        allowClear={allowClear}
        showSearch={showSearch}
        maxTagCount={maxTagCount}
        suffixIcon={showSearch ? <SearchOutlined /> : undefined}
        {..._config}
      />
    </Form.Item>
  );
}
);
V2FormProvinceList.displayName = 'V2FormProvinceList';
export default V2FormProvinceList;
