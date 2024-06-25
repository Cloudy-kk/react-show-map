/*
* 最近功能版本： 2.15.20
*/
import React, { ReactNode } from 'react';
import styles from './index.module.less';
import cs from 'classnames';
import { Form, TreeSelect, TreeSelectProps } from 'antd';
import { FormItemProps } from 'antd/lib/form/index';
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
   * @description 是否必填
   * @default false
   */
  required?: boolean;
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
   * @description 是否显示清除按钮
   * @default true
   */
  allowClear?: boolean;
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

export interface V2FormTreeSelectProps extends DefaultFormItemProps {
  /**
   * @description treeNodes 数据，如果设置则不需要手动构造 TreeNode 节点（value 在整个树范围内唯一）
   * @type array<{value, title, children, [disabled, disableCheckbox, selectable, checkable]}>
   */
  treeData: any[];
  /**
   * @description 空时显示的提示
   */
  placeholder?: string;
  /**
   * @description 更新回调 (data) => {}
   */
  onChange?: Function;
  /**
   * @description 树组件配置
   */
  config?: TreeSelectProps & { ref?: any };
  /**
   * @description 类名
   */
  className?: string;
}
/**
* @description 便捷文档地址
* @see https://reactpc.lanhanba.net/components/form/v2form-tree-select
*/
const V2FormTreeSelect: React.FC<V2FormTreeSelectProps> = ({
  label,
  name,
  rules = [],
  placeholder = `请输入${label || ''}`,
  treeData,
  onChange,
  formItemConfig = {},
  allowClear = true,
  config = {},
  className,
  disabled,
  required,
  noStyle
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
    showSearch: !!config.multiple
  }, config);
  return (
    <Form.Item
      name={name}
      label={label}
      noStyle={noStyle}
      rules={_rules}
      className={cs(styles.V2FormTreeSelect, className)}
      {...formItemConfig}
    >
      <TreeSelect
        placeholder={placeholder}
        onChange={(value, label, extra) => onChange && onChange(value, label, extra)}
        treeData={treeData}
        allowClear={allowClear}
        disabled={disabled}
        suffixIcon={_config.showSearch ? <SearchOutlined /> : undefined}
        {..._config}
      />
    </Form.Item>
  );
};
V2FormTreeSelect.displayName = 'V2FormTreeSelect';
export default V2FormTreeSelect;
